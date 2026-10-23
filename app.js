'use strict';
const cards = document.querySelector('#cards');
const selected = new Set();
let concepts = [];
let toastTimer;
const defaults = {home:'/ko',habom:'/ko/habom',game:'/ko/games/sharehouse'};
const node = (tag, className, text) => { const el = document.createElement(tag); if(className) el.className=className; if(text!==undefined) el.textContent=text; return el; };
const href = (item, page) => `${item.baseUrl.replace(/\/$/,'')}${(item.paths||{})[page] || defaults[page]}`;
const link = (label, url, className) => {const el=node('a',className,label);el.href=url;el.target='_blank';el.rel='noopener noreferrer';return el;};
const noteKey = item => `elysian-review:${item.id}:${item.version || 'v1'}`;
const notes = new Map();
function notify(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
function shareUrl(item){const url=new URL(location.href);url.hash=item.id;return url.href;}
function reviewText(item){return `${item.label} — ${item.title}\n버전: ${item.version || '미표기'}\n시안: ${new URL(href(item,'home'),location.href).href}\n리뷰 링크: ${shareUrl(item)}\n\n${notes.get(item.id)?.trim() || '(아직 작성한 메모가 없습니다.)'}`;}
async function copy(text){try{await navigator.clipboard.writeText(text);notify('복사했어요. 원하는 곳에 붙여넣어 전달해 주세요.');}catch{const area=node('textarea');area.value=text;area.style.position='fixed';area.style.top='0';document.body.append(area);area.select();try{if(!document.execCommand('copy'))throw Error();notify('복사했어요. 원하는 곳에 붙여넣어 전달해 주세요.');}catch{notify('복사할 수 없어요. 메모를 직접 선택해 복사해 주세요.');}finally{area.remove();}}}
function updateComparison(){document.querySelector('#compare-bar').hidden=selected.size===0;document.querySelector('#compare-count').textContent=`${selected.size}개 선택`;document.querySelector('#open-compare').disabled=selected.size!==2;document.querySelectorAll('.compare-toggle').forEach(button=>{const active=selected.has(button.dataset.id);button.setAttribute('aria-pressed',String(active));button.textContent=active?'비교 선택됨':'비교하기';});}
function renderCard(item,index){
 const card=node('article','card');card.id=item.id;
 const top=node('div','card-top');top.append(node('span','concept-number',item.label || `CONCEPT ${String(index+1).padStart(2,'0')}`));
 const toggle=node('button','compare-toggle','비교하기');toggle.dataset.id=item.id;toggle.setAttribute('aria-pressed','false');toggle.setAttribute('aria-label',`${item.title} 비교 선택`);toggle.addEventListener('click',()=>{if(selected.has(item.id))selected.delete(item.id);else if(selected.size<2)selected.add(item.id);else{notify('두 개까지 비교할 수 있어요. 먼저 선택한 시안 하나를 해제해 주세요.');return;}updateComparison();});top.append(toggle);card.append(top);
 const screen=link('',href(item,'home'),'screen-link');screen.setAttribute('aria-label',`${item.title} 메인 시안 열기 (새 탭)`);const img=node('img');img.src=item.image;img.alt=`${item.title} 메인 화면`;img.width=1440;img.height=1000;img.loading=index<2?'eager':'lazy';img.decoding='async';screen.append(img,node('span','screen-badge','시안 열기 ↗'));card.append(screen);
 const heading=node('div','card-heading');heading.append(node('h3','',item.title),node('span','version',item.version||''));card.append(heading,node('p','description',item.description));
 const tags=node('div','tags');(item.tags||[]).forEach(tag=>tags.append(node('span','tag',tag)));card.append(tags);
 const links=node('div','card-links');[['home','메인 ↗'],['habom','하봄 ↗'],['game','게임 상세 ↗']].forEach(([page,label])=>{const a=link(label,href(item,page),`button${page==='home'?' dark':''}`);a.setAttribute('aria-label',`${item.title} ${label.replace(' ↗','')} (새 탭)`);links.append(a);});card.append(links);
 const meta=node('div','card-meta');if(item.sourceUrl)meta.append(link(`${item.sourceLabel||'소스 보기'} ↗`,item.sourceUrl));else meta.append(node('span','',item.sourceLabel||''));const share=node('button','text-button','이 시안 링크 복사 ↗');share.addEventListener('click',()=>copy(shareUrl(item)));meta.append(share);card.append(meta);
 const details=node('details','notes');const summary=node('summary','','리뷰 메모');summary.append(node('span','','이 브라우저에만 저장'));details.append(summary);const body=node('div','note-body');const label=node('label','',`${item.title}에 대한 의견`);label.htmlFor=`note-${item.id}`;const area=node('textarea');area.id=label.htmlFor;area.placeholder='좋았던 점, 아쉬웠던 점, 다음 시안에도 남기고 싶은 요소를 적어 주세요.';area.maxLength=10000;try{area.value=localStorage.getItem(noteKey(item))||'';}catch{}notes.set(item.id,area.value);area.addEventListener('input',()=>{notes.set(item.id,area.value);try{localStorage.setItem(noteKey(item),area.value);}catch{notify('브라우저 저장이 차단되어 있어요. 페이지를 닫기 전에 리뷰를 복사해 주세요.');}});
 const tip=node('div','note-tip');tip.append(node('span','','자동 저장 · 다른 사람에게는 보이지 않아요'));const copyNote=node('button','text-button','이 리뷰 복사 ↗');copyNote.addEventListener('click',()=>copy(reviewText(item)));tip.append(copyNote);body.append(label,area,tip);details.append(body);card.append(details);return card;
}
document.querySelector('#clear-compare').addEventListener('click',()=>{selected.clear();updateComparison();});
const dialog=document.querySelector('#compare-dialog');
document.querySelector('#open-compare').addEventListener('click',()=>{if(selected.size!==2)return;const container=document.querySelector('#comparison');container.replaceChildren();concepts.filter(item=>selected.has(item.id)).forEach(item=>{const col=node('section');col.append(node('h3','',`${item.label} · ${item.title}`));const img=node('img');img.src=item.image;img.alt=`${item.title} 첫 화면`;col.append(img,link('실제 시안 열기 ↗',href(item,'home'),'button dark'));container.append(col);});dialog.showModal();});
document.querySelector('#close-compare').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
document.querySelector('#copy-all').addEventListener('click',()=>{if(!concepts.length)return;copy(`스튜디오 엘리시안 웹사이트 디자인 리뷰\n\n${concepts.map(reviewText).join('\n\n──────────────────\n\n')}`);});
fetch('./data.json').then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{if(!Array.isArray(data)||!data.length)throw Error();concepts=data;cards.replaceChildren(...concepts.map(renderCard));if(location.hash){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}document.getElementById(id)?.scrollIntoView();}}).catch(()=>{cards.replaceChildren(node('p','','시안 목록을 불러오지 못했어요. 잠시 후 페이지를 새로고침해 주세요.'));});
