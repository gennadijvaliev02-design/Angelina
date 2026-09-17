const menuBtn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
menuBtn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a,button').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');}));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Transformation carousel: autoplay + swipe + manual arrows.
// v5 uses carousel width rather than slide.offsetLeft, avoiding grid/offset-parent drift.
const carousel=document.getElementById('transformCarousel');
const slides=[...(carousel?.querySelectorAll('.transform-slide')||[])];
const dotsRoot=document.getElementById('transformDots');
let slideIndex=0, autoTimer=null, userPauseTimer=null, scrollRaf=null;

function carouselWidth(){
  return carousel?.clientWidth || 0;
}
function paintDots(){
  if(!dotsRoot)return;
  [...dotsRoot.children].forEach((d,i)=>d.classList.toggle('active',i===slideIndex));
}
function goToSlide(index,behavior='smooth'){
  if(!carousel||!slides.length)return;
  slideIndex=(index+slides.length)%slides.length;
  const width=carouselWidth();
  if(!width)return;
  carousel.scrollTo({left:Math.round(width*slideIndex),behavior});
  paintDots();
}
slides.forEach((_,i)=>{
  const d=document.createElement('button');
  d.className='carousel-dot'+(i===0?' active':'');
  d.type='button';
  d.setAttribute('aria-label',`Трансформация ${i+1}`);
  d.addEventListener('click',()=>{pauseAutoplay();goToSlide(i)});
  dotsRoot?.appendChild(d);
});
document.querySelector('.carousel-btn.prev')?.addEventListener('click',()=>{pauseAutoplay();goToSlide(slideIndex-1)});
document.querySelector('.carousel-btn.next')?.addEventListener('click',()=>{pauseAutoplay();goToSlide(slideIndex+1)});

function startAutoplay(){
  clearInterval(autoTimer);
  autoTimer=setInterval(()=>goToSlide(slideIndex+1),5500);
}
function pauseAutoplay(){
  clearInterval(autoTimer);
  clearTimeout(userPauseTimer);
  userPauseTimer=setTimeout(startAutoplay,9000);
}

carousel?.addEventListener('pointerdown',pauseAutoplay,{passive:true});
carousel?.addEventListener('touchstart',pauseAutoplay,{passive:true});
carousel?.addEventListener('scroll',()=>{
  if(!carousel||!slides.length)return;
  if(scrollRaf)cancelAnimationFrame(scrollRaf);
  scrollRaf=requestAnimationFrame(()=>{
    const width=carouselWidth();
    if(!width)return;
    const next=Math.max(0,Math.min(slides.length-1,Math.round(carousel.scrollLeft/width)));
    if(next!==slideIndex){slideIndex=next;paintDots();}
  });
},{passive:true});
window.addEventListener('resize',()=>{
  requestAnimationFrame(()=>goToSlide(slideIndex,'auto'));
});
startAutoplay();

// Booking modal. For production, set BOOKING_WEBHOOK to an n8n webhook that checks Google Calendar,
// creates the event and sends Angelina a Telegram notification.
const BOOKING_WEBHOOK='';
const modal=document.getElementById('bookingModal');
const form=document.getElementById('bookingForm');
const success=document.getElementById('bookingSuccess');
const statusEl=document.getElementById('bookingStatus');
function openBooking(){modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');buildCalendar();setTimeout(()=>modal?.querySelector('.booking-close')?.focus(),50);}
function closeBooking(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
document.querySelectorAll('.js-booking-open').forEach(b=>b.addEventListener('click',openBooking));
document.querySelectorAll('[data-booking-close]').forEach(b=>b.addEventListener('click',closeBooking));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeBooking();});

document.querySelectorAll('[data-choice-group]').forEach(group=>{group.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{group.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const hidden=group.parentElement.querySelector('input[type="hidden"]');if(hidden)hidden.value=btn.dataset.value||btn.textContent.trim();}));});

const weekdays=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const monthNames=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
let weekOffset=0,selectedDate=null;
const calendarStrip=document.getElementById('calendarStrip');
const dateInput=document.getElementById('bookingDate');
const timeInput=document.getElementById('bookingTime');
const timeSlots=document.getElementById('timeSlots');
const monthLabel=document.getElementById('calendarMonth');
function isoLocal(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function buildCalendar(){
  if(!calendarStrip)return;
  calendarStrip.innerHTML='';
  const start=new Date();start.setHours(12,0,0,0);start.setDate(start.getDate()+1+weekOffset*7);
  const end=new Date(start);end.setDate(start.getDate()+6);
  monthLabel.textContent=start.getMonth()===end.getMonth()?`${monthNames[start.getMonth()]}`:`${monthNames[start.getMonth()]} — ${monthNames[end.getMonth()]}`;
  for(let i=0;i<7;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);const val=isoLocal(d);
    const btn=document.createElement('button');btn.type='button';btn.className='cal-day';btn.dataset.value=val;btn.innerHTML=`<small>${weekdays[d.getDay()]}</small><b>${d.getDate()}</b>`;
    if((selectedDate&&selectedDate===val)||(!selectedDate&&i===0)){btn.classList.add('active');selectedDate=val;dateInput.value=val;}
    btn.addEventListener('click',()=>{calendarStrip.querySelectorAll('.cal-day').forEach(x=>x.classList.remove('active'));btn.classList.add('active');selectedDate=val;dateInput.value=val;buildTimes(val);});
    calendarStrip.appendChild(btn);
  }
  buildTimes(selectedDate);
}
document.getElementById('calPrev')?.addEventListener('click',()=>{weekOffset=Math.max(0,weekOffset-1);selectedDate=null;buildCalendar();});
document.getElementById('calNext')?.addEventListener('click',()=>{weekOffset=Math.min(5,weekOffset+1);selectedDate=null;buildCalendar();});
function buildTimes(date){
  if(!timeSlots)return;timeSlots.innerHTML='';
  const options=['10:00','12:00','15:00','17:30','19:00','20:30'];
  options.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='time'+(i===0?' active':'');b.dataset.value=t;b.textContent=t;b.addEventListener('click',()=>{timeSlots.querySelectorAll('.time').forEach(x=>x.classList.remove('active'));b.classList.add('active');timeInput.value=t;});timeSlots.appendChild(b);});
  timeInput.value=options[0];
}
function googleCalendarUrl(data){
  const [y,m,d]=data.date.split('-').map(Number);const [hh,mm]=data.time.split(':').map(Number);const start=new Date(y,m-1,d,hh,mm);const end=new Date(start.getTime()+45*60000);
  const fmt=x=>`${x.getFullYear()}${String(x.getMonth()+1).padStart(2,'0')}${String(x.getDate()).padStart(2,'0')}T${String(x.getHours()).padStart(2,'0')}${String(x.getMinutes()).padStart(2,'0')}00`;
  const q=new URLSearchParams({action:'TEMPLATE',text:'Знакомство с Ангелиной Кулаковой',dates:`${fmt(start)}/${fmt(end)}`,details:`Цель: ${data.goal}. Контакт: ${data.contact}`,location:'Онлайн / по согласованию'});
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
form?.addEventListener('submit',async e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());
  if(!data.date||!data.time)return;
  const submit=form.querySelector('button[type="submit"]');submit.disabled=true;statusEl.textContent='Проверяем свободное время…';
  try{
    if(BOOKING_WEBHOOK){const r=await fetch(BOOKING_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw new Error('booking failed');}
    document.getElementById('successName').textContent=(data.name||'').trim()||'готово';
    const d=new Date(`${data.date}T12:00:00`);document.getElementById('successText').textContent=`${d.getDate()} ${monthNames[d.getMonth()]} в ${data.time}. Цель: ${data.goal}. Ангелина свяжется с тобой по указанному контакту.`;
    document.getElementById('googleCalendarLink').href=googleCalendarUrl(data);
    form.hidden=true;success.hidden=false;statusEl.textContent='Готово';
  }catch(err){statusEl.textContent='Не удалось отправить заявку. Напиши Ангелине в WhatsApp.';}
  finally{submit.disabled=false;}
});
