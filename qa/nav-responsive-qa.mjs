import {chromium,webkit} from 'playwright';
const pages=['index.html','pages/football.html','pages/cheer.html','pages/schedules.html','pages/coaches.html','pages/registration.html','pages/faq.html','pages/contact.html'];
const sizes=[
 {name:'tiny-portrait',width:320,height:568,mobile:true},
 {name:'portrait',width:390,height:844,mobile:true},
 {name:'phone-landscape',width:844,height:390,mobile:true},
 {name:'large-phone-landscape',width:932,height:430,mobile:true},
 {name:'tablet',width:1024,height:768,mobile:false},
 {name:'laptop',width:1366,height:768,mobile:false},
 {name:'desktop',width:1440,height:900,mobile:false},
];
const errors=[];
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 for(const size of sizes){
  const context=await browser.newContext({viewport:{width:size.width,height:size.height},isMobile:size.mobile,hasTouch:size.mobile,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(name+' '+size.name+' JS error '+e.message));
  for(const url of pages){
   try{
    await page.goto('http://127.0.0.1:8765/'+url,{waitUntil:'domcontentloaded'});
    const status=await page.evaluate(()=>{
      const nav=document.querySelector('nav'),links=nav.querySelector('.nav-links'),review=nav.querySelector('.nav-reviews');
      const burger=nav.querySelector('.nav-hamburger'),register=nav.querySelector('.nav-cta-desktop');
      const display=e=>getComputedStyle(e).display!=='none';
      const box=e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width}};
      return {vw:innerWidth,nav:box(nav),logo:box(nav.querySelector('.nav-logo')),review:box(review),burger:box(burger),
        menu:getComputedStyle(document.querySelector('.nav-mobile-menu')).display,links:display(links),
        reviewVisible:display(review),burgerVisible:display(burger),registerVisible:display(register),
        documentWidth:document.documentElement.scrollWidth};
    });
    const where=name+' '+size.name+' '+url;
    const compact=size.width<=1399;
    const visibleBox=(b)=>b.left>=-1&&b.right<=status.vw+1;
    if(compact){
      if(status.links||status.registerVisible||!status.burgerVisible||!status.reviewVisible)errors.push(where+' incorrect compact controls '+JSON.stringify(status));
      if(!visibleBox(status.logo)||!visibleBox(status.review)||!visibleBox(status.burger))errors.push(where+' compact item clipped '+JSON.stringify(status));
      if(status.logo.right>status.review.left+1||status.review.right>status.burger.left+1)errors.push(where+' compact items overlap '+JSON.stringify(status));
      await page.locator('.nav-hamburger').click();
      const menu=await page.evaluate(()=>{
        const el=document.querySelector('.nav-mobile-menu'),r=el.getBoundingClientRect(),s=getComputedStyle(el);
        return {open:el.classList.contains('is-open'),height:r.height,maxHeight:s.maxHeight,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,overflow:s.overflowY,bottom:r.bottom,viewport:innerHeight,links:el.querySelectorAll('a').length};
      });
      if(!menu.open||menu.links<5||menu.bottom>menu.viewport+1||menu.overflow!=='auto')errors.push(where+' mobile menu inaccessible '+JSON.stringify(menu));
      await page.locator('.nav-hamburger').click();
    }else{
      if(!status.links||status.burgerVisible||!status.reviewVisible)errors.push(where+' desktop controls incorrect '+JSON.stringify(status));
      if(!visibleBox(status.review))errors.push(where+' desktop reviews button clipped '+JSON.stringify(status));
    }
    if(status.documentWidth>status.vw+3)errors.push(where+' page overflow '+status.documentWidth+' vs '+status.vw);
   }catch(e){errors.push(name+' '+size.name+' '+url+' error '+e.message)}
  }
  await context.close();
 }
 await browser.close();
}
console.log('WCFCC_NAV_RESPONSIVE_ISSUES='+JSON.stringify(errors));
if(errors.length)process.exitCode=1;
