import { chromium, webkit } from 'playwright';

/* Tests the actual vertical dragging experience and one-at-a-time card swap. */
const base='http://127.0.0.1:8765/pages/football.html';
const viewports=[
  {name:'small-phone',width:320,height:568},
  {name:'phone',width:390,height:844},
  {name:'landscape',width:844,height:390},
  {name:'tablet',width:768,height:1024},
  {name:'desktop',width:1440,height:900}
];
const failures=[];
const assert=(ok,message)=>{if(!ok)failures.push(message);};
for(const [browserName,browserEngine] of [['chromium',chromium],['webkit',webkit]]) {
 const browser=await browserEngine.launch({headless:true});
 for(const size of viewports) {
  const ctx=await browser.newContext({
   viewport:{width:size.width,height:size.height},
   isMobile:size.width<500,hasTouch:size.width<500,reducedMotion:'reduce'
  });
  const page=await ctx.newPage();
  const label=browserName+' '+size.name;
  page.on('pageerror',error=>failures.push(label+' JS '+error.message));
  try {
   await page.goto(base,{waitUntil:'domcontentloaded'});
   const rail=page.locator('#fb-timeline-rail');
   const current=page.locator('.fb-timeline-item.is-selected');
   await rail.scrollIntoViewIfNeeded();
   const initial=await page.evaluate(()=>{
     const r=document.querySelector('#fb-timeline-rail');
     const items=[...document.querySelectorAll('#fb-timeline-track .fb-timeline-item')];
     const track=document.querySelector('#fb-timeline-track');
     const rect=r.getBoundingClientRect();
     return {items:items.length,active:items.filter(el=>getComputedStyle(el).visibility==='visible').length,
      week:items.find(el=>el.classList.contains('is-selected'))?.dataset.week,
      output:document.querySelector('#fb-timeline-output')?.textContent,
      railHeight:rect.height,railWidth:rect.width,
      touchAction:getComputedStyle(r).touchAction,
      aria:r.getAttribute('aria-orientation'),
      overflow:track.scrollWidth-track.clientWidth,
      handleShadow:getComputedStyle(r.querySelector('.fb-timeline-handle')).boxShadow,
      viewport:innerWidth,doc:document.documentElement.scrollWidth};
   });
   assert(initial.items===4&&initial.active===1&&initial.week==='1',label+' initial visibility '+JSON.stringify(initial));
   assert(initial.aria==='vertical'&&initial.railHeight>initial.railWidth*2.1,
     label+' slider not vertical '+JSON.stringify(initial));
   assert(initial.touchAction==='none'&&!initial.handleShadow.includes('none'),
     label+' missing touch drag or glow '+JSON.stringify(initial));
   assert(initial.overflow<=3,label+' horizontal timeline overflow '+JSON.stringify(initial));
   assert(initial.doc<=initial.viewport+3,label+' horizontal document overflow '+JSON.stringify(initial));

   await rail.focus();
   await page.keyboard.press('End');
   assert(await rail.getAttribute('aria-valuenow')==='4',label+' End key did not select Week 4');
   assert((await current.count())===1&&(await current.getAttribute('data-week'))==='4',
     label+' End key did not replace visible card');
   await page.keyboard.press('Home');
   assert(await rail.getAttribute('aria-valuenow')==='1',label+' Home key did not reset Week 1');
   await page.keyboard.press('ArrowDown');
   assert(await rail.getAttribute('aria-valuenow')==='2',label+' ArrowDown did not select Week 2');

   const box=await rail.boundingBox();
   const x=box.x+Math.min(box.width/3,25);
   // Pointer capture must continue working while the thumb moves between ticks.
   await page.mouse.move(x,box.y+26);
   await page.mouse.down();
   await page.mouse.move(x,box.y+box.height-26,{steps:12});
   await page.mouse.up();
   await page.waitForTimeout(80);
   const end=await page.evaluate(()=>{
     const weeks=[...document.querySelectorAll('.fb-timeline-item')];
     return {
       value:document.querySelector('#fb-timeline-rail').getAttribute('aria-valuenow'),
       active:weeks.filter(w=>getComputedStyle(w).visibility==='visible').map(w=>w.dataset.week),
       hidden:weeks.filter(w=>w.getAttribute('aria-hidden')==='true').length,
       output:document.querySelector('#fb-timeline-output').textContent,
       progress:document.querySelector('.fb-timeline-experience').style.getPropertyValue('--timeline-progress')
     };
   });
   assert(end.value==='4'&&end.active.length===1&&end.active[0]==='4'&&end.hidden===3&&end.progress==='1',
    label+' vertical drag to Week 4 failed '+JSON.stringify(end));
   const newBox=await rail.boundingBox();
   const xBack=newBox.x+Math.min(newBox.width/3,25);
   const bottomHit=await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.id||document.elementFromPoint(x,y)?.className||'',{x:xBack,y:newBox.y+newBox.height-25});
   await page.mouse.move(xBack,newBox.y+newBox.height-25);
   await page.mouse.down();
   await page.mouse.move(xBack,newBox.y+25,{steps:12});
   await page.mouse.up();
   await page.waitForTimeout(80);
   const valueBack=await rail.getAttribute('aria-valuenow');
   assert(valueBack==='1',label+' drag back to Week 1 failed '+JSON.stringify({valueBack,bottomHit,box:newBox}));
   if(process.env.SHOW_SHOTS==='1'&&browserName==='chromium'&&['phone','desktop'].includes(size.name)){
    await page.screenshot({path:'/tmp/timeline-'+size.name+'.png'});
   }
  }catch(e){failures.push(label+' test exception '+e.message);}
  await ctx.close();
 }
 await browser.close();
}
console.log('TESTING_TIMELINE_ISSUES='+JSON.stringify(failures));
if(failures.length)process.exitCode=1;
