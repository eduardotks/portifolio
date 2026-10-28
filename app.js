import {profile,projects,experience,skillGroups,certificates,courses,languages} from './content.js';
import {ui} from './ui.js';

const supported=['pt-BR','en','es'];
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
let lang='pt-BR',projectFilter='all',skillFilter='all',activeWork='proconsig',lastProjectTrigger=null,toastTimeout;
const openJobs=new Set();
const localized=value=>typeof value==='string'?value:value[lang];
const copy=()=>Object.fromEntries(Object.entries(ui).map(([key,value])=>[key,localized(value)]));
const tags=items=>`<div class="tag-list">${items.map(item=>`<span>${escape(localized(item))}</span>`).join('')}</div>`;
const externalLink=({url,label})=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a>`;
const month=value=>new Intl.DateTimeFormat(lang,{month:'short',year:'numeric'}).format(new Date(`${value}-15T12:00:00`));
const period=job=>`${month(job.start)} — ${job.end?month(job.end):copy().ongoing}`;

function renderProjects(){
 const c=copy();
 $('#project-filters').innerHTML=[['all',c.all],['security',c.security],['everyday',c.everyday]].map(([id,label])=>`<button type="button" data-project-filter="${id}" aria-pressed="${projectFilter===id}">${escape(label)}</button>`).join('');
 const shown=projects.filter(p=>projectFilter==='all'||p.kind===projectFilter);
 $('#projects-grid').innerHTML=shown.map(p=>`<article class="project-card" data-project="${p.id}">
  <div class="project-cover ${p.id}"><span class="project-platform">${escape(p.platform)}</span><img src="./assets/${p.image}" alt="${escape(p.name)}" width="512" height="512" loading="lazy"><span class="cover-wordmark">${escape(p.name.toUpperCase())}</span></div>
  <div class="project-body"><div class="project-title-row"><h3>${escape(p.name)}</h3><span class="project-status">${escape(c[p.status])}</span></div><p>${escape(localized(p.description))}</p>${tags(p.tech)}
  <div class="project-links"><button class="project-detail-button" type="button" data-open-project="${p.id}" aria-label="${escape(c.details+': '+p.name)}">${escape(c.details)} <span aria-hidden="true">↗</span></button><div class="store-links">${p.links.map(externalLink).join('')}</div></div></div></article>`).join('');
 $('.project-empty').hidden=shown.length>0;
}

function renderExperience(){
 const c=copy();
 $('#timeline').innerHTML=experience.map((job,index)=>`<article class="timeline-item"><div class="job-meta"><span>${escape(period(job))}</span><span>${escape(localized(job.place))}</span></div><div class="job-top"><h3>${escape(job.company)}</h3>${job.current?`<span class="job-current">${escape(c.current)}</span>`:''}</div><p class="job-role">${escape(localized(job.role))}</p><p class="job-summary">${escape(localized(job.summary))}</p>
  ${job.projects?`<div class="project-tabs" role="tablist" aria-label="Prodemge — ${escape(c.navProjects)}">${job.projects.map(p=>`<button type="button" role="tab" id="tab-${p.id}" data-work-tab="${p.id}" aria-selected="${activeWork===p.id}" aria-controls="panel-${p.id}" tabindex="${activeWork===p.id?0:-1}">${escape(p.name)}</button>`).join('')}</div>${job.projects.map(p=>`<div class="work-panel" id="panel-${p.id}" role="tabpanel" aria-labelledby="tab-${p.id}" ${activeWork!==p.id?'hidden':''}><h4>${escape(localized(p.subtitle))}</h4><ul>${p.bullets.map(b=>`<li>${escape(localized(b))}</li>`).join('')}</ul>${tags(p.tech)}</div>`).join('')}`:`${tags(job.tech)}<details class="job-details" data-job="${index}" ${openJobs.has(String(index))?'open':''}><summary><span>${escape(c.responsibilities)}</span><span class="details-plus" aria-hidden="true">+</span></summary><ul>${job.bullets.map(b=>`<li>${escape(localized(b))}</li>`).join('')}</ul></details>`}</article>`).join('');
}

function selectWork(id,focus=false){
 activeWork=id;
 $$('[data-work-tab]').forEach(button=>{const active=button.dataset.workTab===id;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
 $$('.work-panel').forEach(panel=>panel.hidden=panel.id!==`panel-${id}`);
}

function renderSkills(){
 const c=copy();
 $('#skill-filters').innerHTML=[{id:'all',name:c.all},...skillGroups].map(group=>`<button type="button" data-skill-filter="${group.id}" aria-pressed="${skillFilter===group.id}">${escape(localized(group.name))}</button>`).join('');
 $('#skills-grid').innerHTML=skillGroups.filter(g=>skillFilter==='all'||g.id===skillFilter).map(group=>`<article class="skill-group${group.description?' skill-group-featured':''}"><div class="skill-group-header"><h3>${escape(localized(group.name))}</h3><span aria-hidden="true">${String(skillGroups.indexOf(group)+1).padStart(2,'0')}</span></div>${group.description?`<p class="skill-description">${escape(localized(group.description))}</p>`:''}<ul class="skill-items">${group.items.map(item=>`<li>${escape(localized(item))}</li>`).join('')}</ul></article>`).join('');
}

function renderLearning(){
 $('#languages-list').innerHTML=languages.map(item=>`<div class="language-row"><span class="language-name">${escape(localized(item.name))}</span><span class="language-level">${escape(localized(item.level))}</span></div>`).join('');
 $('#certifications-list').innerHTML=certificates.map(item=>`<article class="certificate-row"><span class="certificate-marker" aria-hidden="true">↗</span><div><h4>${escape(localized(item.title))}</h4><p>${escape(item.issuer)}${item.date?' · '+escape(localized(item.date)):''}</p></div></article>`).join('');
 $('#courses-list').innerHTML=courses.map(course=>`<li>${escape(localized(course))}</li>`).join('');
}

function projectMarkup(project){
 const c=copy();
 return `<div class="dialog-visual ${project.id}"><img src="./assets/${project.image}" alt="${escape(project.name)}" width="512" height="512"></div><div class="dialog-body"><span class="eyebrow section-number">${escape(c.projectLabel)} / ${escape(c[project.status])}</span><h2 id="dialog-title">${escape(project.name)}</h2><p>${escape(localized(project.description))}</p><ul>${project.details.map(detail=>`<li>${escape(localized(detail))}</li>`).join('')}</ul>${tags(project.tech)}<div class="store-links">${project.links.map(externalLink).join('')}</div>${project.preview?`<img class="dialog-preview" src="./assets/${project.preview}" alt="${escape(project.name+' — '+c.actualScreen)}" width="1672" height="941" loading="lazy"><p class="dialog-caption">${escape(c.actualScreen)}</p>`:''}</div>`;
}

function openProject(id,trigger){
 const project=projects.find(item=>item.id===id);if(!project)return;
 lastProjectTrigger=trigger;$('#dialog-content').innerHTML=projectMarkup(project);$('#project-dialog').dataset.project=id;$('#project-dialog').showModal();document.body.style.overflow='hidden';$('.dialog-close').focus();
}

function setMenu(open){$('.site-header').classList.toggle('menu-open',open);$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?copy().menuClose:copy().menuOpen);}
function normalizeLanguage(value){if(!value)return null;if(value.toLowerCase().startsWith('pt'))return 'pt-BR';if(value.toLowerCase().startsWith('en'))return 'en';if(value.toLowerCase().startsWith('es'))return 'es';return null;}

function setLanguage(next,updateUrl=true){
 if(!supported.includes(next))return;lang=next;const c=copy();
 document.documentElement.lang=lang;document.title=c.seoTitle;
 $$('[data-t]').forEach(element=>{if(c[element.dataset.t]!==undefined)element.textContent=c[element.dataset.t];});
 $$('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
 $('#main-nav').setAttribute('aria-label',c.navLabel);$('#project-filters').setAttribute('aria-label',c.projectFilterLabel);$('#skill-filters').setAttribute('aria-label',c.skillFilterLabel);$('.hero-art').setAttribute('aria-label',c.artAria);$('.dialog-close').setAttribute('aria-label',c.closeProject);$('.wordmark').setAttribute('aria-label',`${profile.name}, ${c.home}`);$('.hero-bottom a').setAttribute('aria-label',c.viewWork);
 $('.tile-keychain .tile-index').textContent=c.tileSecurity;$('.tile-focus .tile-index').textContent=c.tileFocus;
 $('meta[name="description"]').setAttribute('content',c.seoDescription);$('meta[property="og:title"]').setAttribute('content',c.seoTitle);$('meta[property="og:description"]').setAttribute('content',c.seoDescription);
 renderProjects();renderExperience();renderSkills();renderLearning();setMenu(false);
 const dialog=$('#project-dialog');if(dialog.open)$('#dialog-content').innerHTML=projectMarkup(projects.find(p=>p.id===dialog.dataset.project));
 try{localStorage.setItem('eduardo-portfolio-language',lang);}catch{}
 if(updateUrl){const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search+url.hash);}
}

$$('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
$('#project-filters').addEventListener('click',event=>{const button=event.target.closest('[data-project-filter]');if(!button)return;projectFilter=button.dataset.projectFilter;renderProjects();$('#project-filters').querySelector(`[data-project-filter="${projectFilter}"]`).focus({preventScroll:true});});
$('#skill-filters').addEventListener('click',event=>{const button=event.target.closest('[data-skill-filter]');if(!button)return;skillFilter=button.dataset.skillFilter;renderSkills();$('#skill-filters').querySelector(`[data-skill-filter="${skillFilter}"]`).focus({preventScroll:true});});
$('#projects-grid').addEventListener('click',event=>{const button=event.target.closest('[data-open-project]');if(button)openProject(button.dataset.openProject,button);});
$('#timeline').addEventListener('click',event=>{const tab=event.target.closest('[data-work-tab]');if(tab)selectWork(tab.dataset.workTab);});
$('#timeline').addEventListener('keydown',event=>{const tab=event.target.closest('[data-work-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('[data-work-tab]');let index=tabs.indexOf(tab);index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectWork(tabs[index].dataset.workTab,true);});
$('#timeline').addEventListener('toggle',event=>{if(!event.target.matches('.job-details'))return;if(event.target.open)openJobs.add(event.target.dataset.job);else openJobs.delete(event.target.dataset.job);},true);
$('.menu-toggle').addEventListener('click',()=>setMenu($('.menu-toggle').getAttribute('aria-expanded')!=='true'));
$$('#main-nav a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))setMenu(false);});
$('.dialog-close').addEventListener('click',()=>$('#project-dialog').close());
$('#project-dialog').addEventListener('close',()=>{document.body.style.overflow='';if(lastProjectTrigger?.isConnected)lastProjectTrigger.focus({preventScroll:true});});
$('#project-dialog').addEventListener('click',event=>{const rect=event.currentTarget.getBoundingClientRect();if(event.target===event.currentTarget&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))event.currentTarget.close();});
$('#copy-email').addEventListener('click',async()=>{const toast=$('#toast');try{await navigator.clipboard.writeText(profile.email);toast.textContent=copy().copied;}catch{toast.textContent=copy().copyFailed;}toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3500);});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;$$('#main-nav a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-18% 0px -62% 0px'});$$('main>section[id]').forEach(section=>observer.observe(section));}
let storedLanguage=null;try{storedLanguage=localStorage.getItem('eduardo-portfolio-language');}catch{}
const initialLanguage=normalizeLanguage(new URLSearchParams(location.search).get('lang'))||normalizeLanguage(storedLanguage)||normalizeLanguage(navigator.language)||'pt-BR';
setLanguage(initialLanguage,false);$('#year').textContent=new Date().getFullYear();
const schema=document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Person',name:profile.name,url:profile.url,jobTitle:'Full Stack Developer and Systems Analyst',email:profile.email,sameAs:[profile.github,profile.linkedin],alumniOf:{'@type':'CollegeOrUniversity',name:'Universidade Federal de Uberlândia'},knowsLanguage:['Portuguese','English','Spanish']});document.head.append(schema);
