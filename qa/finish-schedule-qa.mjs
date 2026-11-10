import {chromium,webkit} from 'playwright';
const sizes=[
 {name:'small-phone',width:320,height:568},
 {name:'phone',width:390,height:844},
 {name:'landscape',width:844,height:390},
 {name:'tablet',width:768,height:1024},
 {name:'desktop',width:1440,height:900}
];
const issues=[];
for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 for(const screen of sizes){
  const ctx=await browser.newContext({viewport:screen,isMobile:screen.width<500,hasTouch:screen.width<500,reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>issues.push(engineName+' '+screen.name+' JS '+e.message));
  const name=engineName+' '+screen.name;
  try{
   await page.goto('http://127.0.0.1:8765/pages/schedules.html',{waitUntil:'domcontentloaded'});
   const initial=await page.evaluate(()=>{
    const s=document.querySelector('.schedule-chooser');
    const panels=[...s.querySelectorAll('.schedule-program-panel')];
    const container=s.querySelector('.schedule-runway');
    return {
      program:s.dataset.activeProgram,
      brief:s.querySelectorAll('.schedule-brief > div').length,
      oldCards:s.querySelectorAll('.schedule-fact,.info-grid,.info-card').length,
      football:panels[0].querySelectorAll('.schedule-day').length,
      cheer:panels[1].querySelectorAll('.schedule-day').length,
      fridayText:getComputedStyle(panels[0].querySelector('.schedule-day-feature p')).color,
      darkFriday:getComputedStyle(panels[0].querySelector('.schedule-day-feature')).backgroundImage,
      width:document.documentElement.scrollWidth,viewport:innerWidth,
      panelDisplay:getComputedStyle(container).display
    };
   });
   if(initial.brief!==3||initial.oldCards!==0||initial.football!==5||initial.cheer!==3||initial.program!=='football'||initial.width>initial.viewport+3)
    issues.push(name+' schedule structure '+JSON.stringify(initial));
   await page.locator('.schedule-program-tabs [data-tab="cheer"]').click();
   const cheer=await page.evaluate(()=>{
    const s=document.querySelector('.schedule-chooser');
    const panels=[...s.querySelectorAll('.schedule-program-panel')];
    return {theme:s.dataset.activeProgram,footballVisible:getComputedStyle(panels[0]).display!=='none',cheerVisible:getComputedStyle(panels[1]).display!=='none',days:panels[1].querySelectorAll('.schedule-day').length};
   });
   if(cheer.theme!=='cheer'||cheer.footballVisible||!cheer.cheerVisible||cheer.days!==3)
     issues.push(name+' cheer schedule tab '+JSON.stringify(cheer));
   const fridayInk=await page.evaluate(()=>getComputedStyle(document.querySelector('.schedule-cheer-panel .schedule-day-feature .schedule-day-content p')).color);
   if(fridayInk!=='rgb(245, 237, 242)'||initial.fridayText!=='rgb(245, 237, 242)')
     issues.push(name+' Friday descriptions lack high contrast '+JSON.stringify({football:initial.fridayText,cheer:fridayInk}));

   await page.goto('http://127.0.0.1:8765/pages/cheer.html',{waitUntil:'domcontentloaded'});
   await page.locator('a[href="#curriculum"]').click();
   await page.waitForTimeout(100);
   const anchor=await page.evaluate(()=>{
    const s=document.getElementById('curriculum').getBoundingClientRect(),nav=document.querySelector('body > nav').getBoundingClientRect();
    return {sectionTop:s.top,navBottom:nav.bottom,navHeight:nav.height,hash:location.hash,viewport:innerWidth};
   });
   if(Math.abs(anchor.sectionTop-anchor.navBottom)>5||anchor.hash!=='#curriculum')
     issues.push(name+' curriculum anchor misses section background '+JSON.stringify(anchor));
   await page.goto('http://127.0.0.1:8765/pages/registration.html',{waitUntil:'domcontentloaded'});
   await page.locator('#registration-program-cheer').click();
   const contrast=await page.evaluate(()=>{
    const panel=document.getElementById('registration-panel-cheer');
    const link=panel.querySelector('.program-feature-link');
    const head=panel.querySelector('h3 span');
    return {head:getComputedStyle(head).color,
      buttonText:getComputedStyle(link).color,
      buttonBg:getComputedStyle(link).backgroundColor,
      panelBg:getComputedStyle(panel).backgroundImage,
      visible:getComputedStyle(link).display!=='none'};
   });
   if(!contrast.visible||contrast.buttonBg!=='rgb(255, 228, 242)'||contrast.buttonText!=='rgb(38, 21, 39)')
     issues.push(name+' registration cheer CTA contrast '+JSON.stringify(contrast));
   const stars=await page.evaluate(()=>{
     const el=document.querySelector('nav .nav-reviews');
     return {left:getComputedStyle(el,'::before').transform,
       right:getComputedStyle(el,'::after').transform,
       label:getComputedStyle(el.querySelector('.nav-reviews-label')).letterSpacing};
   });
   if(stars.right==='none'||stars.right==='matrix(1, 0, 0, 1, 0, 0)')
     issues.push(name+' right Reviews star has no optical spacing adjustment '+JSON.stringify(stars));
  }catch(e){issues.push(name+' test exception '+e.message)}
  await ctx.close();
 }
 await browser.close();
}
console.log('FINISH_SCHEDULE_ISSUES='+JSON.stringify(issues));
if(issues.length)process.exitCode=1;
