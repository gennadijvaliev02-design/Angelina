const menuBtn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
menuBtn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false')}));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Demo booking flow
const bookingForm=document.querySelector('#bookingForm');
const bookingSuccess=document.querySelector('#bookingSuccess');
document.querySelectorAll('[data-choice-group]').forEach(group=>{
  const key=group.dataset.choiceGroup;
  const hidden=group.parentElement.querySelector(`input[name="${key}"]`);
  group.querySelectorAll('button[data-value]').forEach(btn=>btn.addEventListener('click',()=>{
    group.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(hidden) hidden.value=btn.dataset.value;
  }));
});
bookingForm?.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(bookingForm);
  const name=(data.get('name')||'').toString().trim()||'готово';
  const day=data.get('day');
  const time=data.get('time');
  const goal=data.get('goal');
  document.querySelector('#successName').textContent=name;
  document.querySelector('#successText').textContent=`${day}, ${time} · ${goal}. В настоящей версии эта заявка придёт Ангелине.`;
  bookingForm.hidden=true;
  bookingSuccess.hidden=false;
  bookingSuccess.scrollIntoView({behavior:'smooth',block:'center'});
});
document.querySelector('.reset-booking')?.addEventListener('click',()=>{
  bookingSuccess.hidden=true;
  bookingForm.hidden=false;
  bookingForm.scrollIntoView({behavior:'smooth',block:'center'});
});
