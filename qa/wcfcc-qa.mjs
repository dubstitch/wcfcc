import { chromium, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const engine = process.env.BROWSER_NAME === "webkit" ? webkit : chromium;
const browser = await engine.launch({headless:true});
const base = "http://127.0.0.1:8765/";
const pages = ["index.html","pages/football.html","pages/cheer.html","pages/registration.html","pages/faq.html","pages/schedules.html","pages/contact.html","pages/coaches.html"];
const devices = [
 {name:"small-phone",width:320,height:568},
 {name:"phone",width:390,height:844},
 {name:"landscape",width:844,height:390},
 {name:"tablet",width:768,height:1024},
 {name:"desktop",width:1440,height:900}
];
const errors=[];
const name=process.env.BROWSER_NAME || "chromium";
let shots=0;
function problem(device,path,msg){errors.push(device+" "+path+" "+msg);}

for(const device of devices) {
 const context=await browser.newContext({
  viewport:{width:device.width,height:device.height},
  reducedMotion:"reduce",
  isMobile:device.width<=768,
  hasTouch:device.width<=768
 });
 const page=await context.newPage();
 const runtime=[];
 page.on("pageerror",e=>runtime.push(String(e)));
 for(const path of pages) {
  const response=await page.goto(base+path,{waitUntil:"networkidle"});
  if(!response?.ok()) {problem(device.name,path,"HTTP "+response?.status());continue;}
  await page.waitForTimeout(220);
  const metrics=await page.evaluate(()=>{
   const a=document.querySelector(".portfolio-archive-notice");
   const first=document.querySelector("body > .hero,body > .page-header");
   const inner=document.querySelector(".hero-inner,.page-header > .container");
   const form=document.querySelector("form.wc-form");
   return {
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    archive:a?.getBoundingClientRect().bottom??null,
    hero:first?.getBoundingClientRect().top??null,
    content:inner?.getBoundingClientRect().top??null,
    formDisabled:!form||[...form.querySelectorAll("input,textarea,select,button")].every(x=>x.disabled)
   };
  });
  if(metrics.width>metrics.viewport+3)problem(device.name,path,"horizontal overflow "+JSON.stringify(metrics));
  if(metrics.archive===null)problem(device.name,path,"missing archive note");
  if(metrics.hero!==null&&metrics.archive!==null&&metrics.hero-metrics.archive>8)problem(device.name,path,"gap between archive and section "+JSON.stringify(metrics));
  if(metrics.content!==null&&metrics.archive!==null&&metrics.content-metrics.archive>100)problem(device.name,path,"hero content delayed after archive "+JSON.stringify(metrics));
  if(!metrics.formDisabled)problem(device.name,path,"archived form not disabled");

  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  for(const v of axe.violations.filter(v=>["serious","critical"].includes(v.impact))) {
    const targets=v.nodes.slice(0,8).map(n=>({
      target:n.target.join(","),html:n.html.slice(0,110),summary:n.failureSummary?.slice(0,100)
    }));
    problem(device.name,path,"AXE "+v.id+" "+JSON.stringify(targets));
  }
  if(path==="index.html"){
    const experienceCards=await page.locator("#expCarousel .exp-card").count();
    if(experienceCards!==7)problem(device.name,path,"experience card regression: "+experienceCards+" of 7");
    const ticker=page.locator("#stickyTicker");
    const t=await ticker.evaluate(el=>({top:el.getBoundingClientRect().top,docY:el.getBoundingClientRect().top+scrollY,style:getComputedStyle(el).position}));
    if(t.style!=="sticky")problem(device.name,path,"ticker position="+t.style);
    await page.evaluate(y=>window.scrollTo(0,y),t.docY+300);
    await page.waitForTimeout(150);
    const top=await ticker.evaluate(el=>el.getBoundingClientRect().top);
    if(Math.abs(top-64)>3)problem(device.name,path,"ticker not under nav, top="+top);
    await page.evaluate(()=>window.scrollTo(0,0));
    if(device.name==="phone"||device.name==="desktop"){
      await page.locator('a.nav-reviews[href="#testimonials"]').click();
      await page.waitForTimeout(600);
      const rv=await page.locator("#testimonials").evaluate(el=>el.getBoundingClientRect().top);
      if(rv<100||rv>148)problem(device.name,path,"reviews anchor misses section top "+rv);
    }
  }
  if(path==="pages/cheer.html"){
    const meta=await page.evaluate(()=>{
      const group=[...document.querySelectorAll(".ch-meta-item")].find(x=>x.textContent.includes("$175"));
      const dot=group?.querySelector(".sep")?.getBoundingClientRect();
      const title=group?.querySelector("span:last-child")?.getBoundingClientRect();
      return {dotLeft:dot?.left,dotRight:dot?.right,titleLeft:title?.left};
    });
    if(!(meta.dotRight<meta.titleLeft&&meta.dotLeft>=0))problem(device.name,path,"$175 dot missing or misplaced "+JSON.stringify(meta));
  }
  if(device.name==="phone"&&process.env.SHOW_SHOTS==="1"&&
    ["index.html","pages/football.html","pages/cheer.html","pages/schedules.html","pages/contact.html","pages/coaches.html"].includes(path)&&shots<12) {
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(200);
    const shot=await page.screenshot({type:"jpeg",quality:40});
    console.log("SHOT_BASE64:"+name+"-"+path+":"+shot.toString("base64"));
    shots++;
  }
 }
 if(runtime.length)problem(device.name,"site","runtime errors "+runtime.join(" | ").slice(0,500));
 await context.close();
}
await browser.close();
console.log("WCFCC_QA_ISSUES="+JSON.stringify(errors));
if(errors.length)process.exitCode=1;
