const menuBtn=document.querySelector('.menu-btn');const nav=document.querySelector('.nav');
menuBtn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');}));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('[data-choice-group]').forEach(group=>{group.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{group.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const hidden=group.parentElement.querySelector('input[type="hidden"]');if(hidden)hidden.value=btn.dataset.value||btn.textContent.trim();}));});
const form=document.getElementById('bookingForm');const success=document.getElementById('bookingSuccess');
form?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const name=(data.get('name')||'').toString().trim()||'готово';document.getElementById('successName').textContent=name;document.getElementById('successText').textContent=`Демо-запись: ${data.get('day')} в ${data.get('time')}. Цель: ${data.get('goal')}.`;form.hidden=true;success.hidden=false;success.scrollIntoView({behavior:'smooth',block:'center'});});
document.querySelector('.reset-booking')?.addEventListener('click',()=>{success.hidden=true;form.hidden=false;form.scrollIntoView({behavior:'smooth',block:'start'});});
