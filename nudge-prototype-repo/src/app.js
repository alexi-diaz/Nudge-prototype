/* Post-onboarding nudge cards — intent picker -> homepage nudge -> destination stub */
(function(){
  const INTENTS = [
    { id:'invoice',   label:'Send & track invoices',
      nudge:{ title:'Start getting paid by sending an invoice', sub:'We’ll track it and let you know when you’re paid', cta:'Explore invoicing', dest:'Invoicing' } },
    { id:'payments',  label:'Accept payments',
      nudge:{ title:'Accept your first payment.', sub:'Set up payments so customers can pay how they want.', cta:'Set up payments', dest:'Payments setup', shadow:true } },
    { id:'insights',  label:'See what I make and spend',
      nudge:{ kind:'bank', title:'Connect your bank to automate your books', sub:'Auto-updates your cash balance, expenses, and P&L.', cta:'Connect bank', dest:'Bank connection' } },
    { id:'receipts',  label:'Organize my receipts',
      nudge:{ title:'Keep receipts in one place.', sub:'Take a photo of your receipts and we’ll organize the rest.', cta:'Snap a receipt', dest:'Receipt capture' } },
    { id:'mileage',   label:'Track mileage deductions',
      nudge:{ title:'Turn trips into tax deductions', sub:'We’ll log your business trips automatically so you can claim every mile.', cta:'Explore mileage auto-tracking', dest:'Mileage tracking' } },
    { id:'estimates', label:'Create estimates or quotes',
      nudge:{ title:'Send a estimate in minutes to your customers', sub:'Show customers what a job costs before you start.', cta:'Explore estimates', dest:'Estimates' } }
  ];
  const FULL = ['invoice','payments'];   // intents with a full-homepage design
  const byId = Object.fromEntries(INTENTS.map(i=>[i.id,i]));

  const screenEl = () => document.querySelector('.screen');
  const scr = (cls) => { screenEl().classList.add('no-aurora'); return Kit.el('div','scr '+cls); };


  /* ---------- Full homepage (per-intent layouts from Figma) ---------- */
  const ICO = (d,sz)=>'<svg width="'+(sz||22)+'" height="'+(sz||22)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';
  const PLUS = ICO('<circle cx="12" cy="12" r="9.5"/><path d="M12 8v8M8 12h8"/>',20);
  const LOCK = ICO('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',16);
  const LOGOS = '<div class="logos"><img alt="" src="data:image/png;base64,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"></div>';
  const BANKROWS = '<div class="rows"><div class="rw">Chase'+PLUS+'</div><div class="dv"></div><div class="rw">Wells Fargo'+PLUS+'</div><div class="dv"></div><div class="rw">Citi'+PLUS+'</div></div>';
  const hd=(t,sub,extra)=>'<div class="wt"><span>'+t+'</span>'+(extra||'')+'</div>'+(sub?'<div class="ws">'+sub+'</div>':'');
  const wd=(h,b,cls)=>'<div class="wd'+(cls?' '+cls:'')+'"><div class="wh">'+h+'</div>'+b+'</div>';

  const W = {
    unpaid: ()=>wd(hd('Unpaid invoices','Send your first invoice and start getting paid faster.'),
      '<div class="bar"><i></i></div><div class="figs"><div>$--<small>0 overdue</small></div><div>$--<small>0 not due yet</small></div></div><button class="ob">Send invoice</button>'),
    paid: ()=>wd(hd('Paid invoices','Send your first invoice and start getting paid faster.'),
      '<div class="bar"><i></i></div><div class="figs"><div>$0<small>0 deposited</small></div><div>$0<small>5 not deposited</small></div></div><button class="ob">Send invoice</button>'),
    paid30: ()=>wd('<div class="ws">Last 30 days</div><div class="wt"><span>Paid invoices</span></div>',
      '<div class="bar"><i></i></div><div class="figs"><div>$0<small>0 deposited</small></div><div>$0<small>5 not deposited</small></div></div>'),
    bank: ()=>wd(LOGOS+'<div style="height:14px"></div>'+hd('Bank accounts','Get started by adding an account'),
      BANKROWS+'<button class="ob">Get started</button>'),
    mileage: ()=>wd(hd('Mileage','Get started by turning on auto-tracking for all trips.','<span class="badge">Manual</span>'),'<button class="ob">Get started</button>'),
    expenses: (flat)=>wd(hd('Expenses','Get started by '+(flat?'snapping a receipt':'Snap a receipt')),
      '<div class="segbar">'+(flat?'<i style="background:#AEB9C0"></i>'.repeat(6):'<i></i><i style="background:#AEB9C0"></i><i style="background:#8A969D"></i><i style="background:#5F6B72"></i><i style="background:#3A4348"></i><i></i>')+'</div>'+
      '<div class="rows"><div class="cat"><u></u>Category<span>--%</span></div><div class="dv"></div><div class="cat"><u></u>Category<span>--%</span></div><div class="dv"></div><div class="cat"><u></u>Category<span>--%</span></div></div><button class="ob">Snap a receipt</button>'),
    pl: ()=>wd(hd('Profit and loss','Get started by adding an account'),
      '<div><div class="lbl">Income</div><div class="figs"><div>$--</div></div></div><div class="bar"><i></i></div><div><div class="lbl">Expenses</div><div class="figs"><div>$--</div></div></div><div class="bar"><i></i></div><button class="ob">Add account</button>'),
    cash: ()=>wd('<div class="wt"><span>Today’s cash balance</span></div>',
      '<div class="big">$--</div><div class="rng"><span>1M</span><span>3M</span><span class="on">6M</span><span>9M</span><span>12M</span><span>24M</span></div>'+
      '<svg viewBox="0 0 340 130" width="100%" height="130" fill="none"><g stroke="#D5DEE3" stroke-width=".5"><path d="M0 20H340M0 65H340M0 110H340"/></g><path d="M20 128C40 110 55 120 75 90C95 60 105 30 125 36C145 42 170 58 200 55C230 52 255 38 285 34" stroke="#8A969D" stroke-width="1.5" stroke-linecap="round"/><g font-size="11" fill="#4C555B" font-family="Avenir Next,sans-serif" text-anchor="end"><text x="338" y="16">200K</text><text x="338" y="61">150K</text><text x="338" y="106">100K</text></g></svg>'),
    half: ()=>'<div class="two">'+
      wd(hd('Paid invoices','Send your first invoice and start getting paid faster.'),'')+
      wd(hd('Mileage','Get started by turning on auto-tracking.','<span class="badge">Manual</span>'),'')+'</div>'
  };

  // card order under the nudge, per intent (Figma "homepage with nudge" frames)
  const LAYOUT = {
    invoice:   ['unpaid','paid','bank','mileage','expenses','pl','cash'],
    payments:  ['unpaid','paid','bank','mileage','expenses','pl','cash'],
    insights:  ['unpaid','half','expenses','pl','cash'],
    receipts:  ['expenses:flat','bank','unpaid','paid','mileage','pl','cash'],
    mileage:   ['mileage','bank','unpaid','paid30','expenses','pl','cash'],
    estimates: ['unpaid','paid','mileage','bank','expenses','pl','cash'],
    none:      ['unpaid','paid','bank','mileage','expenses','pl','cash']
  };

  function nudgeCard(i){
    const n=i.nudge;
    const card = n.kind==='bank' ? Kit.el('div','nudge bank shadow',
      '<div class="nd-hd">'+LOGOS+'<div class="txt"><div class="nd-t">'+n.title+'</div><div class="nd-s">'+n.sub+'</div></div></div>'+
      '<div class="sec">'+BANKROWS+'<button>'+n.cta+'</button><div class="lock">'+LOCK+'<span>Your data’s encrypted, never sold. <u>Learn more</u></span></div></div>')
      : Kit.el('div','nudge shadow','<div class="nd-hd"><div class="nd-t">'+n.title+'</div><div class="nd-s">'+n.sub+'</div></div><button>'+n.cta+'</button>');
    card.style.animation='none';
    card.querySelector('button').onclick = () => Kit.nav('nudge.dest', { intent: i.id });
    return card;
  }

  function fullHome(i){
    const s = Kit.el('div','scr'); screenEl().classList.add('no-aurora');
    Kit.statusBar('dark');
    s.innerHTML =
      '<div class="fh"><div class="wrap"><div class="bg"></div>'+
      '<div class="top"><div><div class="biz">North &amp; Main Bakery '+ICO('<path d="M6 9l6 6 6-6"/>',14)+'</div><div class="gm">Good morning, Mia!</div></div>'+
      '<div class="pill"><span>'+ICO('<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>')+'</span><span class="dot">'+ICO('<path d="M4 13l2-7h12l2 7v6H4z"/><path d="M4 13h5a3 3 0 006 0h5"/>')+'</span><span>'+ICO('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')+'</span></div></div>'+
      '<div class="tdy"><span>Today</span><b>Edit</b></div><div class="feed"></div></div></div>'+
      '<div class="fab">'+ICO('<path d="M12 4v16M4 12h16"/>',34)+'</div>'+
      '<div class="tabs"><div class="glass"></div><div class="tab on"><i class="sel"></i>'+
        '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3L3 10.5V21h6.5v-6h5v6H21V10.5z" fill="currentColor"/></svg><b>Home</b></div>'+
        '<div class="tab"><img class="ti" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADoElEQVR4nO2YUW7iSBCG/3JjCw221LM20jx6T7DkBEtuACcYcoI9QuAEOzeY5AThBmFOMMwJ4seRdli1RJBQOk3tA7ZjiLGxSTYajT8JiXZ3V/9lV1eXDTQ0NDQ0/MrQ/gXb9fkthByLvl/saLbeSshL8dM78Azb9Tn57fc5bjBO+hw3GL/Umlm7tut/qqKp0hNg4M+0QTyvoTXfLlGUaf5RZe7RDjiePwC4n04UZl5loSK00NNMs992g/6Boc84yoG2G/Q3jM/pBcLVWqkIAKQMpe11R44bjG3PH0kZymMXT1FKgXCdNA34ZnvDyilJo/QJ4B6AfnqFEFnCnK+ViuxOtwdrcwNGmLEYYWMN9eqfeSUnpJSOEV85awuYEegLgy+TC/tptNI5kBUPKaVtxFfsLpg6oYV3BhWpPDstN7gk8PhpOE8e7v8dt6UMN0bccp7NAw4cv4kJV++EOUtCxzZikIgnQkSgCREiAAAjtM1qUEU8AKyViixhzrPhVEahAwSagKyLTsu818vFhVJKpX1MYTqQ6frh/scYTNdP/RxijyLxCWulIr1cjETL/L4hDAk0OdYZAMU5d2ec1x2lYz3/Lt7Ed5lro33xWduO+9s413BFTbVPYi30NBsyDL7MhpQW3jQrvuzO16V+KaGU4o0Zpk7EECHijRkmG/g1xQNA65TJeqXmUsqzlREDYgqZKHon9FQtt3vltcXncuweKOOUmK+i6VWq0f/zzp8UQrkGC8RLGcqVWQ2IOWTiqCO8qTpw2NXmlBAqChu70+3tpNk4/dqdbu8UTS8WQoVhI6V8VjMBACOEtblBnQIw5kUcKIv5umXHUWsXdTpuMAbx3BL2fK2+R3XEA9uygxE//bjscNwAiKvMvLJjZ7/gcDQXOhCfrjCPGrbnXwlhT7KOHJttmCgCc/yfPzpuACb++OQTpza3wpd/rx6Xo62GYqp9ViFEQtjna/U9qpQq82v97TxC9BCX3m35ITRG3+aW6DGV3gcINNm+Bz+9SpbV+oewO7JHlrjJOpGUHXql5vniaQbwNwB/1XIgGSw8f2BtXyllPOtKLxcXVRwAACmlzJYdHaGnSYlue/5nMEbxUMWg4eP9j9khTZUcAICWG/QJfJv2tbz3VZ/CIdryQ2ge9V0qijB8WC6mZZqACml0ezdolho9IfXto43uZZqzrPgyKp4D/C35l5f66iKYeqld0Jcqc5uPu2/NT+9AQ0NDQ8OvzX8ImyDuntceEgAAAABJRU5ErkJggg==">'+'<b>Sales</b></div>'+
        '<div class="tab ai"><img class="ti" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACfklEQVR4nO2ZzXHbMBBGH5gcHQ1LcCoIrKQAqYK4hKSCjCsQ1UFKSAuuQKzAQgd2OuDYuoqbg8QRTYHED6FEGeu7CYB2v8chgAUBF130tqVOETTny2zLdgFoIAdKQZYbTJk6V3KACZ9/CPVPezJ198yDtS9WSQFy9PUW9TgwpHqHfKwwVaqcWcjgHJ0P9ddkt64QNdm3kJwueQPk6LxGrSZMF/2jRLviCHzq65swXUy4WbseVFteAI15AS1I0Q+hjCuWgt+29gnThSCFgK5RK18IJ0DbfNPWB1FTG3fC+le3rTF/iO8P4QTomj8kOYbYYEpBln2xBFlWmKch84exfhAeAHI/YMgGUYB8V9A2WtXI3a7Pbb6d27VieS2jV+hCoXonr0IVzzwcPfkcfQ3QfergNr/f+Hr7D7k9FQthUyrzELCMbjCF4/0eWJ0OSmkeAjeysRCpzUMgAMRDnMI8RABAOMSpzMPIYs5nYsMOqG/MGPO7HCPlghjSWPNgAfjAzSoiziziPxVgQv/0wnre/m0DkAgzf00vrF95jprE56QLwL/We0tbGRFHs/v6EKqYXK90BNCd5S7tN6lZTHKFKn0LwD6NeoVcO6xLvgXgkKIBxppvNBYiCiDSfNXXMQYiGMCnMMM+OU2K80RXQQBjq8pUh6K2vAFSlcSpIbwAUtfzKSGcAKc6jKSCGATYfVSS24Eko+p5F8RQ7kaDABWmypC5stTtKQ4j0A+hwGSIsypwvkI2iFTmG3UhGvM+9wi2Yu5IFabK0fMataqR+5TmG20wxRWaDPXV1zyc6I5sfyyddZpLn0IxR+chNzhndx4IvX46O4BQ/fcAF1301vUH8zWXh9G+mzQAAAAASUVORK5CYII=">'+'<b>Intuit AI</b></div>'+
        '<div class="tab"><span class="av"></span><b>Experts</b></div>'+
        '<div class="tab"><img class="ti" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAZ0lEQVR4nO3VsQ3AIAxEURNlEVJQMCVZkoKCjJIsgEUT2bL0X2k3d9WJAAAAIKykPXKpr2WQnWf0ZdbDOsjfwhcAAF/qkF2lNsMcW3P0trqzxN5O7ZFEbssgABATQ+YtfAEAAAAE9gEipRCVuiQlZwAAAABJRU5ErkJggg==">'+'<b>Menu</b></div>'+
      '</div>';
    const feed = s.querySelector('.feed');
    if(i) feed.appendChild(nudgeCard(i));
    const tmp = Kit.el('div','', (LAYOUT[i?i.id:'none']).map(k=>{const [n,f]=k.split(':');return W[n](!!f);}).join(''));
    while(tmp.firstChild) feed.appendChild(tmp.firstChild);
    return s;
  }

  Kit.register('nudge', {
    title:'Post-onboarding nudge', icon:'sparkle', home:'picker',
    screens:{
      /* 1. Intent picker (from Figma screenshot) */
      picker: (data) => {
        const s = scr('picker');
        let sel = data && data.sel || null;
        s.innerHTML =
          '<div class="pk-top"><button class="back" aria-label="Back">'+Kit.icon('chevron-left',24)+'</button>'+
          '<span class="t">Get started</span>'+
          '<button class="x" aria-label="Close"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>'+
          '<div class="pk-prog"><i></i></div>'+
          '<h1>What should we start with today?</h1>'+
          '<div class="pk-list"></div><div class="pk-fade"></div>'+
          '<button class="pk-cta">Next</button>';
        const list = s.querySelector('.pk-list'), cta = s.querySelector('.pk-cta');
        INTENTS.forEach(i=>{
          const o = Kit.el('div','opt'+(sel===i.id?' sel':''),
            '<img src="assets/intent/'+i.id+'.png" alt=""><span>'+i.label+'</span>');
          o.onclick = () => {
            sel = i.id;
            list.querySelectorAll('.opt').forEach(n=>n.classList.remove('sel'));
            o.classList.add('sel'); cta.classList.add('on');
          };
          list.appendChild(o);
        });
        if(sel) cta.classList.add('on');
        cta.onclick = () => Kit.nav('nudge.home', { intent: sel });
        s.querySelector('.x').onclick = () => Kit.nav('nudge.home', { intent: null });
        s.querySelector('.back').onclick = () => Kit.replace('nudge.picker', { sel });
        return s;
      },

      /* 2. Homepage with the intent's nudge card */
      home: (data) => fullHome(data && data.intent ? byId[data.intent] : null),

      /* 3. Destination stub — end of prototype scope */
      dest: (data) => {
        const i = byId[data.intent];
        const s = scr('stub');
        s.innerHTML =
          '<div class="ok">'+Kit.icon('check',30)+'</div>'+
          '<h2>'+i.nudge.dest+'</h2>'+
          '<p>This is where the “'+i.nudge.cta+'” flow would start. Not part of this prototype.</p>'+
          '<button class="go">Back to home</button>';
        s.querySelector('.go').onclick = () => Kit.render('nudge.home', { intent:null });
        return s;
      }
    }
  });

  /* review-only helpers for the switcher outside the device */
  window.Nudge = {
    intents: INTENTS,
    jump: (id) => Kit.render('nudge.home', { intent:id }),
    restart: () => Kit.render('nudge.picker')
  };
})();
