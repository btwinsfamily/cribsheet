(function(){
'use strict';
const $=id=>document.getElementById(id);
const ages=window.BOOK_AGES||["Prenatal","Birth · hours","Days 1–7","1–3 months","3–12 months","1–5 years","6–18 years","Adult"];
const systems=["Nervous","Respiratory","Cardiovascular","Digestive","Immune","Musculoskeletal","Sensory","Sleep & circadian","Renal & metabolic"];
const safe=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentAge=1;
function showAge(index){
 currentAge=index;const data=AGE_SYNTHESIS[index];
 $('age-title').textContent=data.title;$('age-lead').textContent=data.lead;
 $('age-challenge').textContent=data.challenge;$('age-handoff').textContent=data.handoff;
 const bar=$('age-stagebar');bar.replaceChildren();
 ages.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.className=i===index?'active':'';b.setAttribute('aria-pressed',String(i===index));b.onclick=()=>showAge(i);bar.append(b)});
 $('age-threads').innerHTML=data.threads.map(([title,body])=>'<div class="paper"><h3>'+safe(title)+'</h3><p>'+safe(body)+'</p></div>').join('');
 const wrap=$('age-systems');wrap.replaceChildren();
 systems.forEach(sys=>{
  const detail=sys==='Respiratory'?window.BOOK_RESP_STAGES[index][1]:BOOK_DATA.systems[sys].stages[index][1];
  const card=document.createElement('article');card.className='age-system-card';
  const h=document.createElement('h3');h.textContent=sys;
  const p=document.createElement('p');p.textContent=detail;
  const button=document.createElement('button');button.type='button';button.className='chip';button.textContent='Follow '+sys+' across ages →';
  button.onclick=()=>{window.openSystemAtAge(sys,index)};
  card.append(h,p,button);wrap.append(card)
 });
}
window.showAge=showAge;
document.addEventListener('DOMContentLoaded',()=>{showAge(1)});
})();