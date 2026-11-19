/* Contextual glossary: progressive enhancement of existing chapter text. */
(()=>{
  'use strict';
  const entries=window.BOOK_DATA?.glossary||[];
  if(!entries.length)return;
  const lookup=new Map(entries.map(([term,definition])=>[term.toLocaleLowerCase(),{term,definition}]));
  const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const words=entries.map(e=>e[0]).sort((a,b)=>b.length-a.length).map(escapeRegex);
  const pattern=new RegExp('(^|[^\\p{L}\\p{N}])('+words.join('|')+')(?![\\p{L}\\p{N}])','giu');
  const root=document.getElementById('chapter');
  if(!root)return;
  const pop=document.createElement('div');
  pop.id='term-popover';pop.className='term-popover';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Biology term definition');pop.hidden=true;
  pop.innerHTML='<button type="button" class="term-close" aria-label="Close definition">×</button><strong class="term-name"></strong><p class="term-description"></p><button type="button" class="term-more">Find in glossary →</button>';
  document.body.appendChild(pop);
  let active=null;
  function close(){pop.hidden=true;if(active){active.setAttribute('aria-expanded','false');active=null}}
  function open(button,entry){
    if(active===button&&!pop.hidden){close();return}
    if(active)active.setAttribute('aria-expanded','false');
    active=button;active.setAttribute('aria-expanded','true');
    pop.querySelector('.term-name').textContent=entry.term;
    pop.querySelector('.term-description').textContent=entry.definition;
    pop.querySelector('.term-more').onclick=()=>{
      close();window.tab('glossary');
      const search=document.getElementById('glosssearch');search.value=entry.term;window.renderGlossary();search.scrollIntoView({block:'start'}); 
    };
    pop.hidden=false;
    const r=button.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
    const left=Math.max(10,Math.min(window.innerWidth-w-10,r.left));
    const top=r.bottom+h+10<window.innerHeight?r.bottom+7:Math.max(10,r.top-h-7);
    pop.style.left=left+'px';pop.style.top=top+'px';
  }
  pop.querySelector('.term-close').onclick=close;
  document.addEventListener('pointerdown',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!e.target.closest('.biology-term'))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  document.addEventListener('scroll',()=>{if(!pop.hidden)close()},true);
  const skip=new Set(['SCRIPT','STYLE','A','BUTTON','INPUT','TEXTAREA','SUMMARY','CODE','PRE','FIGCAPTION']);
  function annotate(container){
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT,{acceptNode(node){
      if(!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      for(let p=node.parentElement;p&&p!==container.parentElement;p=p.parentElement){
        if(skip.has(p.tagName)||p.classList.contains('biology-term')||p.closest('#term-popover'))return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const value=node.nodeValue;pattern.lastIndex=0;
      let match,last=0,found=false;const frag=document.createDocumentFragment();
      while((match=pattern.exec(value))){
        const term=match[2],start=match.index+match[1].length,end=start+term.length;
        const entry=lookup.get(term.toLocaleLowerCase());if(!entry)continue;
        found=true;if(start>last)frag.append(document.createTextNode(value.slice(last,start)));
        const b=document.createElement('button');b.type='button';b.className='biology-term';b.textContent=term;
        b.setAttribute('aria-label',term+': show definition');b.setAttribute('aria-expanded','false');
        b.addEventListener('click',()=>open(b,entry));frag.append(b);last=end;
      }
      if(found){if(last<value.length)frag.append(document.createTextNode(value.slice(last)));node.replaceWith(frag)}
    });
  }
  let scheduled=false;
  const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;observer.disconnect();annotate(root);observer.observe(root,{childList:true,subtree:true})})});
  annotate(root);observer.observe(root,{childList:true,subtree:true});
})();