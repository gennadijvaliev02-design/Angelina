const menuBtn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
menuBtn?.addEventListener('click',()=>{
  const open=nav?.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(!!open));
  menuBtn.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
  menuBtn?.setAttribute('aria-label','Открыть меню');
}));

const revealEls=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },{threshold:.12});
  revealEls.forEach(el=>io.observe(el));
}else{
  revealEls.forEach(el=>el.classList.add('visible'));
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && nav?.classList.contains('open')){
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false');
    menuBtn?.setAttribute('aria-label','Открыть меню');
    menuBtn?.focus();
  }
});

// Transformation carousel: swipe, arrows and accessible pagination.
const carousel=document.getElementById('transformCarousel');
const slides=[...(carousel?.querySelectorAll('.transform-slide')||[])];
const dotsRoot=document.getElementById('transformDots');
let slideIndex=0,scrollRaf=null;

function carouselWidth(){return carousel?.clientWidth||0}
function paintDots(){
  if(!dotsRoot)return;
  [...dotsRoot.children].forEach((d,i)=>{
    d.classList.toggle('active',i===slideIndex);
    d.setAttribute('aria-current',String(i===slideIndex));
  });
}
function goToSlide(index,behavior='smooth'){
  if(!carousel||!slides.length)return;
  slideIndex=(index+slides.length)%slides.length;
  const width=carouselWidth();
  if(!width)return;
  carousel.scrollTo({left:Math.round(width*slideIndex),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
  paintDots();
}
slides.forEach((_,i)=>{
  const d=document.createElement('button');
  d.className='carousel-dot'+(i===0?' active':'');
  d.type='button';
  d.setAttribute('aria-label',`Трансформация ${i+1}`);
  d.addEventListener('click',()=>{goToSlide(i)});
  dotsRoot?.appendChild(d);
});
document.querySelector('.carousel-btn.prev')?.addEventListener('click',()=>{goToSlide(slideIndex-1)});
document.querySelector('.carousel-btn.next')?.addEventListener('click',()=>{goToSlide(slideIndex+1)});

carousel?.addEventListener('scroll',()=>{
  if(!carousel||!slides.length)return;
  if(scrollRaf)cancelAnimationFrame(scrollRaf);
  scrollRaf=requestAnimationFrame(()=>{
    const width=carouselWidth();
    if(!width)return;
    const next=Math.max(0,Math.min(slides.length-1,Math.round(carousel.scrollLeft/width)));
    if(next!==slideIndex){slideIndex=next;paintDots()}
  });
},{passive:true});
window.addEventListener('resize',()=>requestAnimationFrame(()=>goToSlide(slideIndex,'auto')));
paintDots();
