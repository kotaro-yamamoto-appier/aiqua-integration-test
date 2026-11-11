(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(n);
  const shapes = {
    mug:'<ellipse cx="100" cy="170" rx="60" ry="8" fill="#c9c9b8"/><path d="M140 68h15c40 0 40 61 0 61h-15" fill="none" stroke="#b6bba5" stroke-width="14"/><path d="M45 58h105v75q0 36-52 36T45 133Z" fill="#c2c7b0"/><ellipse cx="97" cy="58" rx="52" ry="12" fill="#dce0ce"/><ellipse cx="97" cy="58" rx="42" ry="7" fill="#a3a48a"/>',
    tote:'<path d="M71 67V44c0-36 58-36 58 0v23" fill="none" stroke="#c9b99a" stroke-width="10"/><path d="M44 60h112l14 112q-70 20-140 0Z" fill="#d8c8a7"/><path d="M54 65l-8 103m100-103 8 103" stroke="#c3b18e" fill="none"/><text x="100" y="123" text-anchor="middle" font-family="Georgia" font-size="17" fill="#6a735a">little goods.</text><text x="100" y="138" text-anchor="middle" font-size="5" letter-spacing="2" fill="#6a735a">TAKE THE LONG WAY</text>',
    notebook:'<path d="M48 30h108v147H48z" fill="#c0bdc0"/><path d="M44 26h108v147H44z" fill="#d4d0d2"/><path d="M54 26v147" stroke="#b4adb5"/><path d="M58 173h94v4H58" fill="#eee9dd"/><text x="100" y="67" text-anchor="middle" font-size="8" fill="#6e646e" letter-spacing="2">NOTES</text><path d="M80 83h40" stroke="#aaa0ab"/><text x="100" y="155" text-anchor="middle" font-size="5" fill="#827782">A LITTLE ROOM TO THINK</text>',
    bottle:'<rect x="78" y="18" width="44" height="24" rx="5" fill="#6a725f"/><path d="M76 42h48l10 19v109q-34 13-68 0V61z" fill="#9ba995"/><path d="M78 48h7v111" stroke="#b3bfaa" stroke-width="5"/><text x="100" y="112" text-anchor="middle" font-family="Georgia" font-size="10" fill="#edf0e8">little</text><text x="100" y="126" text-anchor="middle" font-family="Georgia" font-size="10" fill="#edf0e8">goods.</text>',
    candle:'<path d="M53 65h94v102q-47 19-94 0Z" fill="#ba865e"/><ellipse cx="100" cy="65" rx="47" ry="13" fill="#cea179"/><ellipse cx="100" cy="64" rx="38" ry="8" fill="#eadbc0"/><path d="M100 66v-9" stroke="#685844" stroke-width="2"/><rect x="67" y="93" width="66" height="50" rx="1" fill="#eee7d5"/><text x="100" y="112" text-anchor="middle" font-family="Georgia" font-size="11" fill="#776f59">slow sunday</text><text x="100" y="131" text-anchor="middle" font-size="5" letter-spacing="1" fill="#776f59">CEDAR & FIG · 180g</text>',
    pen:'<g transform="rotate(30 100 100)"><rect x="92" y="23" width="16" height="131" rx="6" fill="#a8976f"/><rect x="92" y="22" width="16" height="48" rx="5" fill="#b7a783"/><path d="M95 154h10l-5 24Z" fill="#d3c5a2"/><path d="M99 172h2l-1 8Z" fill="#4a5045"/><path d="M105 28v38" stroke="#e0d5b8" stroke-width="3"/></g>'
  };
  const products = [
    {id:'LG-001',name:'The Everyday Mug',category:'Home',price:24,shape:'mug',color:'#e9ece1',tag:'THE DAILY FAVORITE',description:'A comforting ceramic companion for your morning ritual. A soft sage glaze, a generous handle, and room for one more sip.'},
    {id:'LG-002',name:'The Market Tote',category:'On the go',price:32,shape:'tote',color:'#eeebe2',tag:'TAKE IT EVERYWHERE',description:'A roomy cotton canvas tote for market mornings, library trips, and everything in between.'},
    {id:'LG-003',name:'The Quiet Notebook',category:'Stationery',price:18,shape:'notebook',color:'#eeeaed',tag:'',description:'A little space for big ideas. An A5 notebook with a cloth cover and 120 pages of unlined, cream paper.'},
    {id:'LG-004',name:'The Day Bottle',category:'On the go',price:36,shape:'bottle',color:'#e4e9e2',tag:'',description:'Keep your favorite drink close. A reusable, 500 ml insulated bottle in a soft woodland green.'},
    {id:'LG-005',name:'The Slow Sunday Candle',category:'Home',price:28,shape:'candle',color:'#f0e7db',tag:'A MOMENT TO YOURSELF',description:'Notes of cedar and fig in a warm amber vessel. A small invitation to slow down and settle in.'},
    {id:'LG-006',name:'The Good Idea Pen',category:'Stationery',price:12,shape:'pen',color:'#ecece5',tag:'',description:'A smooth-writing, refillable pen with a warm brass finish. For lists, letters, and little flashes of inspiration.'}
  ];
  const art = p => `<svg viewBox="0 0 200 200" aria-hidden="true">${shapes[p.shape]}</svg>`;
  const getProduct = id => products.find(p => p.id === id);
  function read(key, fallback) { try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;} }
  function save(key, data) {try {localStorage.setItem(key,JSON.stringify(data));} catch { /* Shopping still works without persistence. */ } }
  const savedCart = read('little-goods-cart',{});
  let cart = Object.fromEntries(products.map(p => [p.id, Number.isInteger(savedCart?.[p.id]) ? Math.max(0,Math.min(99,savedCart[p.id])) : 0]).filter(([,n])=>n>0));
  let events = []; // Session-only: never load or replay old analytics.
  let category = 'All', timer;
  const count = () => Object.values(cart).reduce((a,b)=>a+b,0);
  const total = () => products.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0);
  function track(name, properties = {}, value) {
    const event = {name,properties,valueToSum:value,time:new Date().toISOString(),status:'Local only'};
    if (window.AIQUA_CONFIG?.enabled) {
      if (typeof window.appier === 'function') {
        try {window.appier('event',name,properties,...(value === undefined ? [] : [value])); event.status='Passed to SDK (delivery unverified)';}
        catch {event.status='SDK call failed';}
      } else event.status='SDK missing — event not sent';
    }
    events.unshift(event); events = events.slice(0,100);
    // A local, vendor-neutral hook for browser inspection and additional integrations.
    window.dispatchEvent(new CustomEvent('shop:analytics',{detail:structuredClone(event)}));
    renderLog();
  }
  function productProps(p) {return {product_id:p.id,product_name:p.name,product_price:p.price,product_category:p.category,currency:'USD',product_url:location.origin+location.pathname+'#product/'+p.id};}
  function toast(message) {$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
  function renderProducts() {
    const filtered = products.filter(p=>category==='All'||p.category===category);
    $('product-count').textContent=filtered.length+' considered essentials';
    $('products').innerHTML=filtered.map(p=>`<article class="product-card"><button class="product-art" style="background:${p.color}" data-view="${p.id}" aria-label="View ${p.name}">${p.tag?`<span class="label">${p.tag}</span>`:''}${art(p)}</button><div class="product-info"><div><button class="product-name" data-view="${p.id}">${p.name}</button><p>${p.category}</p><span class="price">${money(p.price)}</span></div><button class="add" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div></article>`).join('');
  }
  function updateCart() {
    save('little-goods-cart',cart);
    $('cart-count').textContent=count();$('bag-title-count').textContent=`(${count()})`;
    $('cart-content').innerHTML=count()?products.filter(p=>cart[p.id]).map(p=>`<div class="cart-row"><div class="cart-thumb">${art(p)}</div><div><h3>${p.name}</h3><p>${money(p.price)} each · ${money(p.price*cart[p.id])}</p><div class="quantity"><button data-change="${p.id}" data-delta="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${cart[p.id]}</span><button data-change="${p.id}" data-delta="1" aria-label="Increase ${p.name} quantity" ${cart[p.id]>=99?'disabled':''}>+</button></div></div><button class="remove" data-remove="${p.id}">Remove</button></div>`).join('')+`<div class="totals"><span>Subtotal</span><strong>${money(total())}</strong></div><p class="muted">Free mock shipping · USD · No real payment required</p><button class="dark wide" id="checkout-start">Continue to mock checkout ↗</button>`:'<div class="empty"><span>♧</span><h3>Room for a little good.</h3><p>Your bag is empty. Find an everyday favorite.</p><button class="dark wide" id="continue-shopping">Explore the collection</button></div>';
  }
  function add(id) {const p=getProduct(id);if(!p)return;if((cart[id]||0)>=99){toast('Maximum quantity is 99.');return;}cart[id]=(cart[id]||0)+1;updateCart();track('product_added_to_cart',{...productProps(p),quantity:1});toast(p.name+' added to your bag');}
  function change(id,delta) {const p=getProduct(id);if(!p||!cart[id])return;if(delta>0){add(id);return;}cart[id]-=1;if(!cart[id])delete cart[id];updateCart();track('product_removed_from_cart',{...productProps(p),quantity:1});}
  function openProduct(id) {const p=getProduct(id);if(!p)return;document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('product-detail').innerHTML=`<div class="detail-art" style="background:${p.color}">${art(p)}</div><p class="eyebrow">${p.category.toUpperCase()} / ${p.id}</p><h2>${p.name}</h2><p>${p.description}</p><p>${money(p.price)} <span class="muted">USD</span></p><button class="dark wide" data-add="${p.id}">Add to bag — ${money(p.price)}</button>`;$('product-dialog').showModal();track('product_viewed',productProps(p));}
  function route() {const match=location.hash.match(/^#product\/(LG-\d{3})$/);if(match)openProduct(match[1]);else if($('product-dialog').open)$('product-dialog').close();}
  function renderLog() {
    const enabled=window.AIQUA_CONFIG?.enabled;
    $('sdk-status').textContent=enabled?(typeof window.appier==='function'?'SDK forwarding enabled · delivery must be verified in AIQUA.':'SDK missing · events stay in this browser log.'):'Local mode · no events are sent to AIQUA.';
    const log=$('event-log');log.replaceChildren();
    if(!events.length){log.textContent='No events yet. Browse the collection to get started.';return;}
    events.forEach(e=>{const el=document.createElement('details');el.className='event';const summary=document.createElement('summary');summary.textContent=e.name+' · '+new Date(e.time).toLocaleTimeString();const status=document.createElement('small');status.textContent=e.status;const pre=document.createElement('pre');pre.textContent=JSON.stringify(e,null,2);el.append(summary,status,pre);log.append(el);});
  }
  function startCheckout() {if(!count())return;$('cart-dialog').close();$('checkout-content').innerHTML=`<p class="muted">This is a test order. No account, address, or payment details needed.</p>${products.filter(p=>cart[p.id]).map(p=>`<div class="order-line"><span>${p.name} × ${cart[p.id]}</span><span>${money(p.price*cart[p.id])}</span></div>`).join('')}<div class="totals"><span>Total (USD)</span><strong>${money(total())}</strong></div><button class="dark wide" id="place-order">Place test order ↗</button>`;$('checkout-dialog').showModal();track('checkout_started',{cart_quantity:count(),total:total(),currency:'USD'});}
  function placeOrder() {if(!count())return;const orderId='TEST-'+crypto.randomUUID();const orderTotal=total();products.filter(p=>cart[p.id]).forEach(p=>track('product_purchased',{...productProps(p),quantity:cart[p.id],order_id:orderId},p.price*cart[p.id]));track('checkout_completed',{order_id:orderId,currency:'USD',total:orderTotal,cart_quantity:count()},orderTotal);cart={};updateCart();$('checkout-content').innerHTML=`<div class="confirmation"><span>✳</span><h2>A little good, on its way.</h2><p>Your test order is complete.</p><p class="muted">${orderId}<br>${money(orderTotal)} USD · No payment was taken.</p><button class="dark wide" id="finish-order">Back to the collection</button></div>`;}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.view){const hash='#product/'+b.dataset.view;if(location.hash===hash)openProduct(b.dataset.view);else location.hash=hash;}
    if(b.dataset.add)add(b.dataset.add);
    if(b.dataset.change)change(b.dataset.change,Number(b.dataset.delta));
    if(b.dataset.remove){const p=getProduct(b.dataset.remove);const quantity=cart[p.id];delete cart[p.id];updateCart();track('product_removed_from_cart',{...productProps(p),quantity});}
    if(b.dataset.category){category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});renderProducts();track('category_viewed',{category_name:category});}
    if(b.classList.contains('close'))b.closest('dialog').close();
    if(b.id==='cart-open'){updateCart();$('cart-dialog').showModal();track('cart_viewed',{cart_quantity:count(),total:total(),currency:'USD'});}
    if(b.id==='lab-open'||b.id==='lab-open-bottom'){renderLog();$('lab-dialog').showModal();}
    if(b.id==='checkout-start')startCheckout();
    if(b.id==='place-order')placeOrder();
    if(b.id==='continue-shopping'||b.id==='finish-order'){b.closest('dialog').close();location.hash='collection';}
    if(b.id==='clear-events'){events=[];renderLog();}
    if(b.id==='export-events'){const url=URL.createObjectURL(new Blob([JSON.stringify(events,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='little-goods-events.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  });
  document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
  $('product-dialog').addEventListener('close',()=>{if(location.hash.startsWith('#product/'))history.replaceState(null,'',location.pathname+location.search+'#collection');});
  window.addEventListener('hashchange',route);
  document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
  renderProducts();updateCart();renderLog();
  // The SDK logs the initial page load itself. Record a LOCAL observation only
  // to avoid duplicate page_viewed events when the vendor snippet is enabled.
  if(!window.AIQUA_CONFIG?.enabled)track('page_viewed',{url:location.href});
  route();
})();
