import { chromium, webkit } from 'playwright';

const errors=[];
const screens=[
 {name:'tiny portrait',width:320,height:568},
 {name:'phone portrait',width:390,height:844},
 {name:'phone landscape',width:844,height:390},
 {name:'tablet',width:768,height:1024},
 {name:'desktop',width:1440,height:900},
];
const base='http://127.0.0.1:8765/';
const check=(ok,comment)=>{if(!ok)errors.push(comment)};
for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]) {
 const browser=await engine.launch({headless:true});
 for(const screen of screens) {
  const name=engineName+' '+screen.name;
  const context=await browser.newContext({viewport:screen,isMobile:screen.width<500,hasTouch:screen.width<500,reducedMotion:'no-preference'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(name+' JS error '+error.message));
  try {
   await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(130);
   const home=await page.evaluate(()=>{
    const tabs=[...document.querySelectorAll('#programs .program-choice')];
    const ticker=[...document.querySelectorAll('.ticker-track .ticker-item')];
    const nav=document.querySelector('nav .nav-reviews');
    const navIcons=[...nav.querySelectorAll('svg')];
    const label=nav.querySelector('.nav-reviews-label').getBoundingClientRect();
    const stars=navIcons.map(x=>x.getBoundingClientRect());
    const field=document.querySelector('.field-experience');
    const imageStyle=getComputedStyle(field).backgroundImage;
    const overlayStyle=getComputedStyle(field,'::before').backgroundImage;
    return {
      cards:tabs.map(x=>x.getBoundingClientRect().height),
      tickerCount:ticker.length,
      stars:ticker.filter(x=>x.textContent.includes('★')).length,
      diamonds:ticker.filter(x=>x.textContent.includes('◆')).length,
      fonts:ticker.map(x=>getComputedStyle(x).fontSize),
      colors:ticker.map(x=>getComputedStyle(x).color),
      navGapLeft:label.left-stars[0].right,
      navGapRight:stars[1].left-label.right,
      photo:imageStyle.includes('Artificial_turf.jpg'),
      unfilteredPhoto:!imageStyle.includes('gradient')&&overlayStyle==='none',
      noCaption:!document.querySelector('.field-photo-credit'),
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
   });
   check(home.tickerCount===36&&home.stars===36&&home.diamonds===0,name+' ticker not 36 star separators '+JSON.stringify(home));
   check(new Set(home.fonts).size===1&&new Set(home.colors).size===1,name+' ticker text visual inconsistency');
   check(home.photo&&home.noCaption&&home.unfilteredPhoto,name+' original turf photo obscured or caption unexpectedly restored');
   check(home.cards.length===2&&Math.abs(home.cards[0]-home.cards[1])<2,name+' uneven homepage program tabs '+home.cards);
   check(Math.abs(home.navGapLeft-home.navGapRight)<2.5,name+' nav stars are not centered '+JSON.stringify(home));
   check(home.overflow<=3,name+' homepage horizontal overflow '+home.overflow);
   const homeCheer=page.locator('#home-program-cheer');
   await homeCheer.click();
   const theme=await page.evaluate(()=>{
    const sec=document.querySelector('#programs');
    const feat=document.querySelector('#home-panel-cheer');
    const intro=document.querySelector('#home-panel-intro');
    return {theme:sec.dataset.activeProgram,background:getComputedStyle(sec).backgroundImage,
      panelBg:getComputedStyle(feat).backgroundImage,panelVisible:!feat.hidden,hiddenIntro:intro.hidden,
      paragraph:getComputedStyle(feat.querySelector('p')).color};
   });
   check(theme.theme==='cheer'&&theme.panelVisible&&theme.hiddenIntro,name+' homepage cheer tab not functioning '+JSON.stringify(theme));
   check(theme.background.includes('25, 20, 29')||theme.background.includes('42, 23, 37'),name+' cheer section reverted to full bright pink '+JSON.stringify(theme));

   await page.goto(base+'pages/registration.html',{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(150);
   const reg=await page.evaluate(()=>{
     const tabs=[...document.querySelectorAll('.registration-programs .program-choice')];
     return {
       heights:tabs.map(t=>t.getBoundingClientRect().height),
       steps:document.querySelectorAll('.registration-steps li').length,
       docs:document.querySelectorAll('.registration-doc-list li').length,
       policy:document.querySelectorAll('.registration-policy-list > div').length,
       formRows:document.querySelectorAll('.registration-form-row').length,
       oldCards:document.querySelectorAll('.registration-process .wc-card,.registration-documents .info-card,.registration-policies .info-card').length,
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
     };
   });
   check(reg.heights.length===2&&Math.abs(reg.heights[0]-reg.heights[1])<2,name+' registration tabs uneven '+JSON.stringify(reg));
   check(reg.steps===5&&reg.docs===5&&reg.policy===6&&reg.formRows===2&&reg.oldCards===0,name+' registration structure '+JSON.stringify(reg));
   check(reg.overflow<=3,name+' registration horizontal overflow '+reg.overflow);
   await page.locator('#registration-program-cheer').click();
   const cheer=await page.evaluate(()=>({
     selected:document.querySelector('#registration-program-cheer').getAttribute('aria-selected'),
     visible:!document.querySelector('#registration-panel-cheer').hidden,
     introHidden:document.querySelector('#registration-panel-intro').hidden,
     theme:document.querySelector('#registration-programs').dataset.activeProgram,
     hash:document.querySelector('#registration-panel-cheer .program-feature-link').getAttribute('href'),
     target:!!document.getElementById('cheer-registration')
   }));
   check(cheer.selected==='true'&&cheer.visible&&cheer.introHidden&&cheer.theme==='cheer'&&cheer.hash==='#cheer-registration'&&cheer.target,name+' registration cheer switch/link '+JSON.stringify(cheer));
   await page.locator('#registration-program-football').click();
   const football=await page.evaluate(()=>({
     selected:document.querySelector('#registration-program-football').getAttribute('aria-selected'),
     visible:!document.querySelector('#registration-panel-football').hidden,
     theme:document.querySelector('#registration-programs').dataset.activeProgram
   }));
   check(football.selected==='true'&&football.visible&&football.theme==='football',name+' registration football tab failed '+JSON.stringify(football));
   if(screen.name==='desktop'||screen.name==='phone portrait'){
     await page.goto(base+'index.html#testimonials',{waitUntil:'domcontentloaded'});
     const testimonials=await page.evaluate(()=>{
       const sec=document.querySelector('#testimonials');
       const card=sec.querySelector('.testimonial-card');
       const cheer=sec.querySelector('.testimonial-card.is-cheer');
       const nav=sec.querySelector('.carousel-controls');
       return {stage:getComputedStyle(sec).backgroundImage,card:getComputedStyle(card).backgroundColor,
         cheer:getComputedStyle(cheer).backgroundColor,arrow:!!nav.querySelector('.carousel-btn'),
         dots:!!nav.querySelector('.carousel-dots')};
     });
     check(testimonials.stage.includes('gradient')&&testimonials.card!==testimonials.cheer&&testimonials.arrow&&testimonials.dots,name+' family review theme or interactions lost '+JSON.stringify(testimonials));
   }
  }catch(error){errors.push(name+' test exception: '+error.message);}
  await context.close();
 }
 await browser.close();
}
console.log('WCFCC_NOV10_ISSUES='+JSON.stringify(errors));
if(errors.length)process.exitCode=1;
