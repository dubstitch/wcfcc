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
  if(path==="index.html"&&!(await page.locator(".portfolio-archive-notice").innerText()).includes("successful 2025 season"))
    problem(device.name,path,"archive wording does not communicate 2025 success");
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
  if(path==="pages/football.html") {
    const details=await page.evaluate(()=>{
      const price=[...document.querySelectorAll(".ch-meta-item")].find(x=>x.textContent.includes("$175"));
      const dot=price?.querySelector(".sep")?.getBoundingClientRect();
      const label=price?.querySelector("span:last-child")?.getBoundingClientRect();
      return {
        positionCards:document.querySelectorAll(".fb-position-card").length,
        gameIqCards:document.querySelectorAll(".fb-game-step").length,
        dotRight:dot?.right,labelLeft:label?.left,
        priceY:label?.top,dotY:dot?.top
      };
    });
    if(details.positionCards!==4||details.gameIqCards!==3)problem(device.name,path,"missing football deep dive "+JSON.stringify(details));
    if(!(details.dotRight<=details.labelLeft&&Math.abs(details.priceY-details.dotY)<18))
      problem(device.name,path,"football price dot orphaned "+JSON.stringify(details));
  }
  if(path==="index.html") {
    const field=await page.locator(".field-experience").evaluate(el=>({
      image:getComputedStyle(el).backgroundImage,
      cards:el.querySelectorAll(".exp-card").length
    }));
    if(!field.image.includes("Artificial_turf.jpg")||field.cards!==7)
      problem(device.name,path,"Real stadium turf missing or cards changed "+JSON.stringify(field));
    const tabs=page.locator(".program-choice");
    const defaultTabs=await tabs.evaluateAll(els=>els.map(el=>({
      kind:el.dataset.tab,bg:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color
    })));
    if(!defaultTabs[1].bg.includes("255")||defaultTabs[1].bg==="rgba(0, 0, 0, 0)")
      problem(device.name,path,"Inactive Cheer tab lost pink identity "+JSON.stringify(defaultTabs));
    await page.locator('.program-choice[data-tab="cheer"]').click();
    const activeTheme=await page.locator("#programs").evaluate(el=>({
      background:getComputedStyle(el).backgroundImage,
      titleColor:getComputedStyle(el.querySelector(".programs-header .section-title")).color
    }));
    const footballInactive=await page.locator('.program-choice[data-tab="football"]').evaluate(el=>getComputedStyle(el).backgroundColor);
    if(!activeTheme.background.includes("linear-gradient")||footballInactive!=="rgb(232, 255, 0)")
      problem(device.name,path,"Cheer selection or inactive Football colors incorrect "+JSON.stringify({activeTheme,footballInactive}));
    if(device.name==="phone"&&process.env.SHOW_SHOTS==="1") {
      await page.locator(".field-experience").scrollIntoViewIfNeeded();
      const shot=await page.screenshot({type:"jpeg",quality:42});
      console.log("DESIGN_SHOT_BASE64:"+name+"-stadium:"+shot.toString("base64"));
      await page.locator("#programs").scrollIntoViewIfNeeded();
      const shot2=await page.screenshot({type:"jpeg",quality:42});
      console.log("DESIGN_SHOT_BASE64:"+name+"-cheer-selection:"+shot2.toString("base64"));
    }
  }
  if(path==="pages/football.html") {
    const guided=await page.evaluate(()=>{
      const el=document.querySelector(".fb-guided-grid");
      return {
        count:document.querySelectorAll(".fb-guided-card").length,
        timeline:document.querySelectorAll(".fb-combine-guide .fb-timeline-item").length,
        columns:el?getComputedStyle(el).gridTemplateColumns:null,
        spill:el?el.scrollWidth-el.clientWidth:Infinity
      };
    });
    if(guided.count!==4||guided.timeline!==4||guided.spill>2)
      problem(device.name,path,"Guided combine layout incomplete "+JSON.stringify(guided));
    if(device.name==="phone"&&process.env.SHOW_SHOTS==="1") {
      await page.locator(".fb-guided-grid").scrollIntoViewIfNeeded();
      const shot=await page.screenshot({type:"jpeg",quality:42});
      console.log("DESIGN_SHOT_BASE64:"+name+"-combine:"+shot.toString("base64"));
    }
  }
  if(path==="pages/cheer.html") {
    const indicator=await page.locator(".cheer-curriculum .carousel-dot.active").first().evaluate(el=>({
      background:getComputedStyle(el).backgroundColor,
      border:getComputedStyle(el).borderTopColor,
      width:el.getBoundingClientRect().width
    }));
    if(indicator.background!=="rgb(255, 44, 153)"||indicator.border!=="rgb(255, 255, 255)")
      problem(device.name,path,"Cheer progression indicator blends into background "+JSON.stringify(indicator));
  }
  if(path==="pages/contact.html") {
    const cheer=await page.locator(".contact-cheer-card").evaluate(el=>({
      bg:getComputedStyle(el).backgroundImage,
      border:getComputedStyle(el).borderLeftColor,
      name:getComputedStyle(el.querySelector("h3")).color
    }));
    if(!cheer.bg.includes("linear-gradient")||cheer.border==="rgb(232, 255, 0)")
      problem(device.name,path,"Contact Cheer card uses inconsistent color "+JSON.stringify(cheer));
  }

  if(path==="pages/registration.html") {
    const cheer=await page.evaluate(()=>{
      const card=document.querySelector(".registration-cheer-card");
      const heading=card?.querySelector("h3");
      const form=card?.querySelector('a[href*="forms.gle"]');
      return {
        exists:!!card,headingColor:heading?getComputedStyle(heading).color:null,
        background:card?getComputedStyle(card).backgroundImage:null,
        buttonColor:form?getComputedStyle(form).color:null
      };
    });
    if(!cheer.exists||cheer.headingColor!=="rgb(255, 255, 255)"||!cheer.background?.includes("linear-gradient"))
      problem(device.name,path,"Cheer registration not pink and readable "+JSON.stringify(cheer));
  }
  if(path==="index.html") {
    const tabs=page.locator('#programs [role="tab"]');
    if(await tabs.count()!==2)problem(device.name,path,"home program tabs missing");
    else {
      await tabs.nth(1).click();
      const selected=await page.evaluate(()=>({
        selected:document.getElementById("programs").dataset.activeProgram,
        visible:!!document.querySelector("#home-panel-cheer:not([hidden])"),
        hidden:document.querySelector("#home-panel-football")?.hidden,
        panelBg:getComputedStyle(document.getElementById("programs")).backgroundImage
      }));
      if(selected.selected!=="cheer"||!selected.visible||!selected.hidden)
        problem(device.name,path,"home Cheer tab failed "+JSON.stringify(selected));
      if(device.name==="phone"&&process.env.SHOW_SHOTS==="1") {
        await page.locator("#programs").scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const shot=await page.screenshot({type:"jpeg",quality:46});
        console.log("DETAIL_SHOT_BASE64:"+name+"-home-cheer:"+shot.toString("base64"));
      }
      await tabs.nth(0).click();
      if(await page.locator("#programs").getAttribute("data-active-program")!=="football")
        problem(device.name,path,"returning to Football failed");
    }
    const review=await page.evaluate(()=>{
      const cards=[...document.querySelectorAll("#testCarousel .testimonial-card")];
      const active=cards.filter(el=>el.classList.contains("is-active"));
      const colored=cards.filter(el=>el.classList.contains("is-cheer"));
      const dot=document.querySelector(".field-experience .carousel-dot.active");
      const bg=dot?getComputedStyle(dot).backgroundColor:null;
      return {active:active.length,cheer:colored.length,bg,field:!!document.querySelector(".field-experience")};
    });
    if(review.active!==1||review.cheer!==2||!review.field)
      problem(device.name,path,"review active/cheer and field presentation "+JSON.stringify(review));
    const cta=await page.locator('.final-cta .btn-cta-outline').evaluate(el=>({
      color:getComputedStyle(el).color,
      border:getComputedStyle(el).borderTopWidth,
      borderColor:getComputedStyle(el).borderTopColor
    }));
    if(cta.color!=="rgb(16, 17, 20)"||parseFloat(cta.border)<2)
      problem(device.name,path,"View Programs button too faint "+JSON.stringify(cta));
    if(device.name==="phone"&&process.env.SHOW_SHOTS==="1"){
      await page.locator(".field-experience").scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      const shot=await page.screenshot({type:"jpeg",quality:46});
      console.log("DETAIL_SHOT_BASE64:"+name+"-field-experience:"+shot.toString("base64"));
    }
    if(device.name==="phone"&&process.env.SHOW_SHOTS==="1"){
      await page.locator("#testimonials").scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      const shot=await page.screenshot({type:"jpeg",quality:46});
      console.log("DETAIL_SHOT_BASE64:"+name+"-reviews:"+shot.toString("base64"));
    }
  }
  if(path==="pages/schedules.html") {
    const details=await page.evaluate(()=>{
      const program=document.querySelector(".schedule-chooser");
      const dates=document.querySelector(".schedule-key-dates");
      return {programBeforeDates:!!(program&&dates&&(program.compareDocumentPosition(dates)&Node.DOCUMENT_POSITION_FOLLOWING)),
        count:document.querySelectorAll(".schedule-date-card").length};
    });
    if(!details.programBeforeDates||details.count!==6)
      problem(device.name,path,"schedule sections and dates missing "+JSON.stringify(details));
    await page.locator('.schedule-program-tabs [data-tab="cheer"]').click();
    const cheer=await page.evaluate(()=>({
      chosen:document.querySelector(".schedule-chooser")?.dataset.activeProgram,
      panelVisible:!document.querySelector('[data-tab-panel-group="schedule"][data-tab-panel="cheer"]')?.hidden,
      footballHidden:document.querySelector('[data-tab-panel-group="schedule"][data-tab-panel="football"]')?.hidden
    }));
    if(cheer.chosen!=="cheer"||!cheer.panelVisible||!cheer.footballHidden)
      problem(device.name,path,"schedule cheer program switch failed "+JSON.stringify(cheer));
    const prev=page.locator("[data-date-prev]"),next=page.locator("[data-date-next]");
    const before=await page.locator("[data-date-track]").evaluate(el=>el.scrollLeft);
    await next.click();
    await page.waitForTimeout(480);
    const after=await page.locator("[data-date-track]").evaluate(el=>el.scrollLeft);
    if(after<=before&&device.width<900)problem(device.name,path,"dates did not scroll "+JSON.stringify({before,after}));
    if(device.name==="phone"&&process.env.SHOW_SHOTS==="1"){
      await page.locator(".schedule-chooser").scrollIntoViewIfNeeded();
      const shot=await page.screenshot({type:"jpeg",quality:46});
      console.log("DETAIL_SHOT_BASE64:"+name+"-schedule-cheer:"+shot.toString("base64"));
    }
  }
  if(path==="pages/faq.html") {
    const ids=["registration-payment","camp-details","safety-policies","game-day-details"];
    const anchors=await page.locator(".faq-jump-grid a").evaluateAll(links=>links.map(a=>a.getAttribute("href")));
    if(ids.some(id=>!anchors.includes("#"+id)||!page))problem(device.name,path,"FAQ links incomplete "+JSON.stringify(anchors));
    const topicMenu=await page.locator("nav.faq-jump-nav").evaluate(el=>({
      position:getComputedStyle(el).position,
      top:el.getBoundingClientRect().top,
      pageHeaderBottom:document.querySelector(".page-header").getBoundingClientRect().bottom,
      height:el.getBoundingClientRect().height
    }));
    if(topicMenu.position==="fixed"||topicMenu.height<100||Math.abs(topicMenu.top-topicMenu.pageHeaderBottom)>8)
      problem(device.name,path,"FAQ index misplaced or fixed "+JSON.stringify(topicMenu));
    if(device.name==="phone"&&process.env.SHOW_SHOTS==="1"){
      await page.locator(".faq-jump-nav").scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      const shot=await page.screenshot({type:"jpeg",quality:46});
      console.log("DETAIL_SHOT_BASE64:"+name+"-faq-nav:"+shot.toString("base64"));
    }
    await page.locator('.faq-jump-grid a[href="#game-day-details"]').click();
    await page.waitForTimeout(350);
    const hash=await page.evaluate(()=>location.hash);
    if(hash!=="#game-day-details")problem(device.name,path,"FAQ anchor did not navigate: "+hash);
  }
  if(path==="pages/football.html") {
    const details=await page.evaluate(()=>{
      const lab=document.querySelector(".fb-position-lab"),progress=document.querySelector(".fb-progression-focus"),combine=document.querySelector(".fb-combine-separate");
      return {lab:!!lab,progress:!!progress,combine:!!combine,
        arrow:!!document.querySelector(".fb-friday-link .fa-solid.fa-arrow-right"),
        metadata:getComputedStyle(document.querySelector(".ch-hero-meta")).fontSize,
        bg1:progress?getComputedStyle(progress).backgroundImage:null,
        bg2:combine?getComputedStyle(combine).backgroundImage:null};
    });
    if(!details.lab||!details.progress||!details.combine||!details.arrow)
      problem(device.name,path,"football structure or icon missing "+JSON.stringify(details));
    if(details.bg1===details.bg2)problem(device.name,path,"football sections indistinguishable "+JSON.stringify(details));
  }
  if(path==="pages/cheer.html") {
    const expanded=await page.evaluate(()=>({
      practice:document.querySelectorAll(".cheer-practice-card").length,
      stages:document.querySelectorAll(".cheer-performance-grid article").length
    }));
    if(expanded.practice!==3||expanded.stages!==3)
      problem(device.name,path,"new Cheer program sections missing "+JSON.stringify(expanded));
  }
  if(path==="pages/cheer.html"){
    const meta=await page.evaluate(()=>{
      const group=[...document.querySelectorAll(".ch-meta-item")].find(x=>x.textContent.includes("$175"));
      const dot=group?.querySelector(".sep")?.getBoundingClientRect();
      const title=group?.querySelector("span:last-child")?.getBoundingClientRect();
      return {dotLeft:dot?.left,dotRight:dot?.right,titleLeft:title?.left};
    });
    if(!(meta.dotRight<meta.titleLeft&&meta.dotLeft>=0))problem(device.name,path,"$175 dot missing or misplaced "+JSON.stringify(meta));
    const palette=await page.evaluate(()=>{
      const tag=document.querySelector(".ch-hero-tagline");
      const chips=[...document.querySelectorAll(".hero .age-chip")];
      const ageChip=document.querySelector(".cheer-age-section .wc-acc-trigger > span > span");
      return {
        taglineColor:getComputedStyle(tag).color,
        pillColors:chips.map(el=>getComputedStyle(el).backgroundColor),
        pillText:chips.map(el=>getComputedStyle(el).color),
        agePillColor:getComputedStyle(ageChip).backgroundColor,
        agePillBorder:getComputedStyle(ageChip).borderTopWidth
      };
    });
    if(palette.taglineColor!=="rgb(255, 255, 255)"||
       palette.pillText.some(x=>x!=="rgb(255, 255, 255)")||
       new Set(palette.pillColors).size!==1||
       palette.agePillBorder!=="0px")
      problem(device.name,path,"inconsistent Cheer palette "+JSON.stringify(palette));

  }
  if(device.name==="phone"&&process.env.SHOW_SHOTS==="1"&&["pages/football.html","pages/cheer.html","pages/registration.html"].includes(path)) {
    const target=path==="pages/football.html"?".fb-position-lab":path==="pages/cheer.html"?".cheer-age-section":".registration-cheer-card";
    const element=page.locator(target);
    if(await element.count()) {
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(170);
      const shot=await page.screenshot({type:"jpeg",quality:42});
      console.log("DETAIL_SHOT_BASE64:"+name+"-"+path+":"+shot.toString("base64"));
    }
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
