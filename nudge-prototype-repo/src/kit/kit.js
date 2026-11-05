/* =============================================================================
   KIT RUNTIME  (classic script — attaches window.Kit; no build step, no modules)
   Sections register screens into a shared registry; the router mounts them into
   #app. This registry is what lets independently-built sections merge into ONE
   prototype: each section only adds to Kit, it never edits another section.

   A section file looks like:

     Kit.register('receipts', {
       title:'Receipts', icon:'receipt',
       home:'inbox',                       // default screen id
       screens:{
         inbox:  (data)=> Kit.el('div','screen-pad', '<h1 class="t-title">Receipts</h1>'),
         detail: (data)=> ...
       }
     });

   Navigate with Kit.nav('receipts.detail', {id:3}). See AGENTS.md for rules.
   ============================================================================= */
window.Kit = (function(){
  const sections = {};        // id -> def
  const screens  = {};        // "section.screen" -> fn(data)->Node
  let currentFq  = null;
  const stack    = [];        // simple nav history for back()

  /* ---- registry --------------------------------------------------------- */
  function register(id, def){
    if(sections[id]) console.warn('[Kit] section already registered:', id);
    sections[id] = def;
    Object.keys(def.screens||{}).forEach(k=>{ screens[id+'.'+k] = def.screens[k]; });
  }

  /* ---- tiny DOM helper -------------------------------------------------- */
  function el(tag, cls, html){
    const e=document.createElement(tag);
    if(cls) e.className=cls;
    if(html!=null) e.innerHTML=html;
    return e;
  }
  function app(){ return document.getElementById('app'); }

  /* ---- mount + navigation ---------------------------------------------- */
  function render(fq, data){
    const fn = screens[fq];
    const host = app();
    host.innerHTML='';
    if(!fn){ host.appendChild(el('div','kit-empty','Screen not found: <b>'+fq+'</b>')); return; }
    currentFq = fq;
    statusBar('light');                 // default each screen to light bg; builder may override
    host.appendChild(fn(data||{}));
    host.scrollTop = 0;
  }
  // iOS status bar color: bg 'dark' -> white content, bg 'light' -> dark content
  function statusBar(bg){
    const sb=document.getElementById('statusbar');
    if(sb) sb.classList.toggle('on-dark', bg==='dark');
  }
  // push with a subtle iOS slide
  function nav(fq, data){
    if(currentFq) stack.push(currentFq);
    slide(()=>render(fq,data),'fwd');
  }
  function back(){
    const prev = stack.pop();
    if(prev) slide(()=>render(prev),'back'); else launcher();
  }
  function replace(fq, data){ render(fq, data); }
  function slide(paint, dir){
    const host = app();
    host.style.transition='none';
    host.style.transform = dir==='back' ? 'translateX(-14px)' : 'translateX(14px)';
    host.style.opacity='0';
    paint();
    requestAnimationFrame(()=>{
      host.style.transition='transform var(--dur) var(--ease-ios),opacity var(--dur)';
      host.style.transform='translateX(0)';
      host.style.opacity='1';
    });
  }

  /* ---- reusable chrome -------------------------------------------------- */
  // iOS 27 frosted top bar with optional back button + right actions
  function topBar(opts){
    opts=opts||{};
    const bar=el('div','topbar');
    bar.innerHTML='<div class="tb-blur"></div><div class="tb-tint"></div>';
    const row=el('div','topbar-row');
    if(opts.back){ const b=el('button','icon-btn plain'); b.innerHTML=icon('chevron-left',22);
      b.onclick=opts.onBack||back; row.appendChild(b); }
    row.appendChild(el('div','title', opts.title||''));
    row.appendChild(el('div','spacer'));
    (opts.actions||[]).forEach(a=>row.appendChild(a));
    bar.appendChild(row);
    return bar;
  }
  // bottom sheet; returns {close}
  function sheet(node){
    const scr=el('div','sheet-scrim'), s=el('div','sheet');
    s.appendChild(el('div','grabber'));
    s.appendChild(node);
    scr.appendChild(s);
    document.querySelector('.screen').appendChild(scr);
    requestAnimationFrame(()=>{scr.classList.add('show');s.classList.add('show');});
    function close(){ scr.classList.remove('show');s.classList.remove('show');
      setTimeout(()=>scr.remove(),420); }
    scr.onclick=e=>{ if(e.target===scr) close(); };
    return {close, el:s};
  }

  /* ---- icon set (stroke, 24px grid). Add shared icons here. ------------- */
  const P = {
    'chevron-left':'<path d="M15 5l-7 7 7 7"/>',
    'chevron-right':'<path d="M9 5l7 7-7 7"/>',
    'plus':'<path d="M12 5v14M5 12h14"/>',
    'check':'<path d="M4 12l5 5L20 6"/>',
    'camera':'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
    'receipt':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    'invoice':'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    'card':'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    'sparkle':'<path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z"/>',
    'home':'<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
    'dollar':'<path d="M12 3v18M8 7h6a2.5 2.5 0 010 5H9a2.5 2.5 0 000 5h7"/>',
    'chart':'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
  };
  function icon(name, size){
    size=size||24;
    const d=P[name]||'';
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" '+
      'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';
  }

  /* ---- launcher (merged home of the kit) -------------------------------- */
  function launcher(){
    const host=app(); host.innerHTML='';
    const wrap=el('div','launcher');
    wrap.innerHTML='<h1>QuickBooks</h1><p class="t-foot">Prototype kit — pick a section</p>';
    const grid=el('div','grid');
    Object.keys(sections).forEach(id=>{
      const def=sections[id];
      const tile=el('div','tile');
      tile.innerHTML='<div class="badge">'+icon(def.icon||'home',20)+'</div><div class="name">'+(def.title||id)+'</div>';
      tile.onclick=()=>{ stack.length=0; render(id+'.'+(def.home||Object.keys(def.screens)[0])); };
      grid.appendChild(tile);
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
    currentFq=null;
  }

  /* ---- boot : read ?section= / ?screen= --------------------------------- */
  function boot(){
    const p=new URLSearchParams(location.search);
    const sec=p.get('section'), scr=p.get('screen');
    if(sec && sections[sec]){
      const def=sections[sec];
      render(sec+'.'+(scr||def.home||Object.keys(def.screens)[0]));
    } else {
      launcher();
    }
  }

  return { register, el, icon, nav, back, replace, render, topBar, sheet, statusBar, launcher, boot,
           sections, screens };
})();
