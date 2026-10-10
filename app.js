const $ = (s) => document.querySelector(s);
let content, filter = 'ALL', menuExpanded = false;
function safeImage(url) { return /^(assets\/[\w.-]+|https:\/\/[^\s]+|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/.test(url || '') ? url : ''; }
function node(tag, cls, text) { const el = document.createElement(tag); if(cls) el.className=cls; if(text!==undefined) el.textContent=text; return el; }
function renderMenu() {
  const grid=$('#menu-grid'); grid.replaceChildren();
  const items=content.menu.filter(m=>m.visible && (!menuExpanded||filter==='ALL'||m.category===filter));
  (menuExpanded?items:items.slice(0,2)).forEach(m=>{
    const card=node('article','menu-card'); const photo=node('div','menu-photo');
    if(safeImage(m.photo)){const img=node('img');img.src=m.photo;img.alt=m.name;img.loading='lazy';photo.append(img);}
    else{photo.classList.add('atlas');photo.style.setProperty('--x',`${(m.tile%4)/3*100}%`);photo.style.setProperty('--y',m.tile<4?'0%':'100%');photo.setAttribute('role','img');photo.setAttribute('aria-label',m.name);}
    const price=node('p','price',`${new Intl.NumberFormat('ja-JP').format(m.price)}円`); price.append(node('small','', '税込'));
    card.append(photo,node('p','category',m.category),node('h3','',m.name),node('p','variant',m.variant),node('p','description',m.description),price);grid.append(card);
  });
  if(!grid.children.length)grid.append(node('p','empty-menu','ただいまメニューを準備しています。'));
  $('.filters').hidden=!menuExpanded;
  grid.classList.toggle('is-collapsed',!menuExpanded);
  $('#menu-toggle').hidden=content.menu.filter(m=>m.visible).length<=2;
  $('#menu-toggle').textContent=menuExpanded?'閉じる':'もっと見る';
  $('#menu-toggle').setAttribute('aria-expanded',String(menuExpanded));
}
function setPhoto(id,url,alt){if(!safeImage(url))return;const box=$(id);box.classList.remove('photo-placeholder');box.classList.add('moment-photo');const img=node('img');img.src=url;img.alt=alt;img.loading='lazy';box.replaceChildren(img);}
function render(data) {
  content=data;const s=data.shop;
  document.querySelectorAll('.brand-name').forEach(e=>e.textContent=s.name);
  document.title=`${s.name} | ラテとスコーン`;
  document.querySelectorAll('.hours').forEach(e=>e.textContent=s.hours);
  document.querySelectorAll('.closed').forEach(e=>e.textContent=s.closed);
  $('#payments').textContent=s.payments;
  initHero(s);
  setPhoto('#solo-photo',s.soloPhoto,'ひとりでゆっくり過ごせる店内');
  setPhoto('#counter-photo',s.counterPhoto,'おしゃべりを楽しめるカウンター');
  for(const [id,value,label] of [['#address',s.address,'住所'],['#directions',s.directions,'最寄駅'],['#phone-container',s.phone,'電話番号']]){const el=$(id);el.textContent=value||'';el.classList.toggle('is-empty',!value);if(value)el.removeAttribute('aria-label');else el.setAttribute('aria-label',`${label}は未入力`);}
  if(s.phone){const a=node('a','text-link',s.phone);a.href=`tel:${s.phone.replace(/[^+\d]/g,'')}`;$('#phone-container').replaceChildren(a);}
  if(s.line&&/^https:\/\/(line\.me|lin\.ee)\//.test(s.line)){
    document.querySelectorAll('.line-link').forEach(a=>{a.href=s.line;a.target='_blank';a.rel='noopener noreferrer';a.removeAttribute('aria-disabled');});$('#line-status').textContent='最新の営業情報は、LINEでご確認ください。';
  }else document.querySelectorAll('.line-link').forEach(a=>a.removeAttribute('aria-disabled'));
  if(s.address){const map=$('#map-area');const iframe=node('iframe');iframe.src=`https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`;iframe.title=`${s.name}の地図`;iframe.loading='lazy';iframe.referrerPolicy='no-referrer-when-downgrade';const a=node('a','text-link','地図アプリで開く ↗');a.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;a.target='_blank';a.rel='noopener noreferrer';map.replaceChildren(iframe,a);}
  renderMenu();
  initMoments();
}
function setNav(open){const b=$('.nav-toggle');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');$('#navigation').classList.toggle('open',open);$('.nav-backdrop').hidden=!open;document.body.classList.toggle('nav-open',open);$('#main').inert=open;$('footer').inert=open;}
$('.nav-toggle').addEventListener('click',()=>setNav($('.nav-toggle').getAttribute('aria-expanded')!=='true'));
function closeNav(){setNav(false);}
$('.nav-backdrop').addEventListener('click',closeNav);
$('#navigation').addEventListener('click',e=>{if(e.target.closest('a'))closeNav();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('.nav-toggle').getAttribute('aria-expanded')==='true'){closeNav();$('.nav-toggle').focus();}});
matchMedia('(min-width:701px)').addEventListener('change',e=>{if(e.matches)closeNav();});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeNav();});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderMenu();}));
$('#year').textContent=new Date().getFullYear();
$('#menu-toggle').addEventListener('click',()=>{menuExpanded=!menuExpanded;if(!menuExpanded){filter='ALL';document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='ALL');b.setAttribute('aria-pressed',String(b.dataset.filter==='ALL'));});}renderMenu();if(!menuExpanded)$('#menu').scrollIntoView({behavior:'smooth',block:'start'});});
document.querySelectorAll('.line-link').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  const url=content?.shop.line||'';
  const ready=/^https:\/\/(line\.me|lin\.ee)\//.test(url);
  $('#line-dialog-note').textContent=ready?'LINEを開いて、最新の営業情報をご確認いただけます。':'LINEのURLは準備中です。設定後にご案内します。';
  $('#line-confirm').hidden=!ready;
  if(ready)$('#line-confirm').href=url;
  $('#line-dialog').showModal();
}));
$('#line-cancel').addEventListener('click',()=>$('#line-dialog').close());
$('#line-confirm').addEventListener('click',()=>$('#line-dialog').close());
$('#line-dialog').addEventListener('click',e=>{if(e.target===$('#line-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});

let heroTimer,heroIndex=0,heroPaused=false,heroReady=false;
const heroSlides=[$('#hero-image'),$('#hero-interior')];
function showHero(index){heroIndex=index;heroSlides.forEach((img,i)=>{img.classList.toggle('is-visible',i===index);img.setAttribute('aria-hidden',String(i!==index));});$('#hero-caption').textContent=index===0?'LATTE & SCONE · ひと息のおともに':'INSIDE IKOI · あなたのペースで過ごす場所';}
function scheduleHero(){clearInterval(heroTimer);if(heroReady&&!heroPaused&&!document.hidden)heroTimer=setInterval(()=>showHero((heroIndex+1)%heroSlides.length),3000);}
async function initHero(shop){
  clearInterval(heroTimer);heroReady=false;showHero(0);
  heroSlides[0].src=safeImage(shop.hero)||'assets/hero.png';heroSlides[1].src=safeImage(shop.interior)||'assets/interior-hero.png';
  try{await Promise.all(heroSlides.map(img=>img.decode()));heroReady=true;scheduleHero();}catch{$('#hero-pause').hidden=true;}
}
$('#hero-pause').addEventListener('click',()=>{heroPaused=!heroPaused;const label=heroPaused?'写真の自動切り替えを再生':'写真の自動切り替えを停止';$('#hero-pause').setAttribute('aria-label',label);$('#hero-pause').title=label;$('#hero-pause span').textContent=heroPaused?'▶':'Ⅱ';scheduleHero();});
document.addEventListener('visibilitychange',scheduleHero);

const momentsTrack=$('#moments-track');
const momentCards=[...momentsTrack.querySelectorAll('.moment-card')];
let momentIndex=0,momentScrollFrame,momentSettleTimer,momentsReady=false;
function momentStep(){return momentCards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(momentsTrack).columnGap);}
function updateMoments(){
  const physicalIndex=Math.round(momentsTrack.scrollLeft/momentStep());
  momentIndex=((physicalIndex-2)%momentCards.length+momentCards.length)%momentCards.length;
  [...momentsTrack.children].forEach((card,i)=>card.classList.toggle('is-current',i===physicalIndex));
  $('#moments-status').textContent=`${String(momentIndex+1).padStart(2,'0')} / ${String(momentCards.length).padStart(2,'0')}`;
  [...$('#moments-dots').children].forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===momentIndex)));
}
function goToMoment(index){
  const physicalIndex=index+2;
  momentsTrack.scrollTo({left:physicalIndex*momentStep(),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
function sizeMoments(){
  if(!momentsReady)return;
  clearTimeout(momentSettleTimer);
  const width=momentsTrack.clientWidth,gap=parseFloat(getComputedStyle(momentsTrack).columnGap);
  const cardWidth=width<=660?width*.76:(width-2*gap)/2;
  const stage=momentsTrack.parentElement;
  stage.style.setProperty('--moment-width',`${cardWidth}px`);
  stage.style.setProperty('--moment-side',`${(width-cardWidth)/2}px`);
  momentsTrack.scrollTo({left:(momentIndex+2)*(cardWidth+gap),behavior:'instant'});
  updateMoments();
}
function initMoments(){
  momentsTrack.querySelectorAll('[data-clone]').forEach(card=>card.remove());
  function clone(card){const copy=card.cloneNode(true);copy.dataset.clone='true';copy.setAttribute('aria-hidden','true');copy.inert=true;copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));return copy;}
  momentsTrack.prepend(...momentCards.slice(-2).map(clone));
  momentsTrack.append(...momentCards.slice(0,2).map(clone));
  const dots=$('#moments-dots');dots.replaceChildren();
  momentCards.forEach((card,i)=>{const b=node('button');b.type='button';b.title=card.querySelector('h3').textContent;b.setAttribute('aria-label',`${i+1}枚目を表示：${b.title}`);b.setAttribute('aria-controls','moments-track');b.addEventListener('click',()=>goToMoment(i));dots.append(b);});
  momentsReady=true;sizeMoments();
}
$('#moments-prev').addEventListener('click',()=>goToMoment(momentIndex-1));
$('#moments-next').addEventListener('click',()=>goToMoment(momentIndex+1));
momentsTrack.addEventListener('scroll',()=>{if(!momentsReady)return;cancelAnimationFrame(momentScrollFrame);momentScrollFrame=requestAnimationFrame(updateMoments);clearTimeout(momentSettleTimer);momentSettleTimer=setTimeout(()=>{const physicalIndex=Math.round(momentsTrack.scrollLeft/momentStep());if(physicalIndex<2||physicalIndex>=momentCards.length+2){momentsTrack.scrollTo({left:(momentIndex+2)*momentStep(),behavior:'instant'});}},160);},{passive:true});
momentsTrack.addEventListener('keydown',e=>{if(e.target!==momentsTrack)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goToMoment(momentIndex+(e.key==='ArrowRight'?1:-1));}else if(e.key==='Home'||e.key==='End'){e.preventDefault();goToMoment(e.key==='Home'?0:momentCards.length-1);}});
new ResizeObserver(sizeMoments).observe(momentsTrack);
(async()=>{try{const r=await fetch('content.json',{cache:'no-store'});if(!r.ok)throw Error();render(await r.json());}catch{$('#load-error').hidden=false;}})();
