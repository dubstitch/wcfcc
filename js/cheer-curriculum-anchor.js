/*
  Scroll to the actual CURRICULUM color boundary rather than the heading.
  Compensates only for the fixed navigation so the preceding section does
  not peek out between the header and the curriculum background.
*/
(() => {
  const target=document.getElementById("curriculum");
  if(!target)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const topOfSection=()=>{
    const bar=document.querySelector("body > nav");
    const headerHeight=bar ? Math.max(0,bar.getBoundingClientRect().height) : 64;
    return Math.max(0,Math.round(target.getBoundingClientRect().top+window.scrollY-headerHeight));
  };
  function scrollToBoundary(behavior="smooth"){
    window.scrollTo({top:topOfSection(),behavior:reduced.matches?"instant":behavior});
  }
  document.querySelectorAll('a[href="#curriculum"]').forEach(link=>{
    link.addEventListener("click",event=>{
      event.preventDefault();
      if(location.hash!=="#curriculum")history.pushState(null,"","#curriculum");
      scrollToBoundary();
    });
  });
  window.addEventListener("hashchange",()=>{
    if(location.hash==="#curriculum")scrollToBoundary("instant");
  });
  if(location.hash==="#curriculum"){
    window.addEventListener("load",()=>{
      requestAnimationFrame(()=>scrollToBoundary("instant"));
    },{once:true});
  }
})();
