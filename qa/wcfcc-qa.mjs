import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const browser=await chromium.launch();
const base="http://127.0.0.1:8765/";
const paths=["index.html","pages/football.html","pages/cheer.html","pages/registration.html","pages/faq.html","pages/schedules.html","pages/contact.html","pages/coaches.html"];
const sizes=[{label:"small-phone",w:320,h:568},{label:"phone",w:390,h:844},{label:"landscape",w:844,h:390},{label:"tablet",w:768,h:1024},{label:"desktop",w:1440,h:900}];
const errors=[];
for(const size of sizes){
 const context=await browser.newContext({viewport:{width:size.w,height:size.h},reducedMotion:"reduce"});
 const page=await context.newPage();
 const jsErrors=[];
 page.on("pageerror",e=>jsErrors.push(String(e)));
 for(const path of paths){
  const response=await page.goto(base+path,{waitUntil:"domcontentloaded"});
  if(!response?.ok())errors.push(size.label+" "+path+" HTTP failure");
  await page.waitForTimeout(150);
  const metrics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,archive:!!document.querySelector(".portfolio-archive-notice"),forms:[...document.querySelectorAll("form")].map(f=>[...f.querySelectorAll("input,button,select,textarea")].every(c=>c.disabled))}));
  if(metrics.width>metrics.viewport+3)errors.push(size.label+" "+path+" horizontal overflow "+JSON.stringify(metrics));
  if(!metrics.archive)errors.push(size.label+" "+path+" no archive notice");
  if(metrics.forms.some(f=>!f))errors.push(size.label+" "+path+" form not disabled");
  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  for(const v of axe.violations.filter(v=>["serious","critical"].includes(v.impact))){
   errors.push(size.label+" "+path+" "+v.id+": "+v.nodes.slice(0,3).map(n=>n.target.join(",")).join(";"));
  }
 }
 if(jsErrors.length)errors.push(size.label+" runtime: "+jsErrors.slice(0,6).join(" | "));
 await context.close();
}
await browser.close();
console.log("WCFCC_QA_ISSUES="+JSON.stringify(errors));
if(errors.length)process.exitCode=1;
