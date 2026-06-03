// const fetch = require('node-fetch');

// module.exports = async (req, res) => {
//   const SHOP   = process.env.SHOPIFY_SHOP;
//   const TOKEN  = process.env.SHOPIFY_ADMIN_TOKEN;
//   const PUB_ID = process.env.GERMANY_PUBLICATION_ID;

//   if (!SHOP || !TOKEN || !PUB_ID) {
//     return res.status(500).send('Missing environment variables');
//   }

//   // ?info=1 → return JSON with variant count
//   if (req.query.info === '1') {
//     try {
//       const variants = await fetchAllVariants(SHOP, TOKEN, PUB_ID);
//       return res.status(200).json({ totalVariants: variants.length });
//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }

//   }

//   // ?download=1 → return raw CSV
//   if (req.query.download === '1') {
//     try {
//       const variants = await fetchAllVariants(SHOP, TOKEN, PUB_ID);
//       const rows = [['GTIN', 'SKU', 'STOCK', 'PRICE_EUR']];
//       for (const v of variants) {
//         const basePrice  = parseFloat(v.contextualPricing?.price?.amount || 0);
//         const finalPrice = (basePrice * 1.18).toFixed(2);
//         rows.push([
//           v.barcode           || '',
//           v.sku               || '',
//           v.inventoryQuantity ?? 0,
//           finalPrice,
//         ]);
//       }
//       const csv = rows
//         .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
//         .join('\n');
//       res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//       res.setHeader('Content-Disposition', 'attachment; filename="germany-feed.csv"');
//       res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//       return res.status(200).send(csv);
//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }
//   }

//   // Default → serve HTML page
//   const html = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8"/>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Germany Product Feed</title>
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
//   <style>
//     *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//     :root {
//       --font-display: 'Instrument Serif', Georgia, serif;
//       --font-body: 'Inter', sans-serif;
//       --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
//       --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
//       --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
//       --text-lg: clamp(1.125rem, 1rem + 0.75vw, 1.5rem);
//       --text-xl: clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem);
//       --space-1:.25rem;--space-2:.5rem;--space-3:.75rem;--space-4:1rem;
//       --space-6:1.5rem;--space-8:2rem;--space-10:2.5rem;--space-12:3rem;
//       --radius-sm:.375rem;--radius-md:.5rem;--radius-lg:.75rem;
//       --radius-xl:1rem;--radius-full:9999px;
//       --transition: 180ms cubic-bezier(0.16,1,0.3,1);
//       --bg:#f7f6f2;--surface:#ffffff;--surface-2:#f3f0ec;
//       --border:oklch(0.2 0.01 80 / 0.1);
//       --text-c:#28251d;--text-muted:#7a7974;--text-faint:#bab9b4;
//       --primary:#01696f;--primary-h:#0c4e54;--primary-hl:#cedcd8;
//       --success:#437a22;--success-hl:#d4dfcc;
//       --shadow-sm:0 1px 2px oklch(0.2 0.01 80 / 0.06);
//       --shadow-md:0 4px 16px oklch(0.2 0.01 80 / 0.09);
//       --shadow-lg:0 12px 40px oklch(0.2 0.01 80 / 0.13);
//     }
//     [data-theme="dark"] {
//       --bg:#171614;--surface:#1c1b19;--surface-2:#22211f;
//       --border:oklch(1 0 0 / 0.08);
//       --text-c:#cdccca;--text-muted:#797876;--text-faint:#5a5957;
//       --primary:#4f98a3;--primary-h:#227f8b;--primary-hl:#313b3b;
//       --success:#6daa45;--success-hl:#3a4435;
//       --shadow-sm:0 1px 2px oklch(0 0 0 / 0.25);
//       --shadow-md:0 4px 16px oklch(0 0 0 / 0.35);
//       --shadow-lg:0 12px 40px oklch(0 0 0 / 0.45);
//     }
//     html { -webkit-font-smoothing:antialiased; }
//     body {
//       min-height:100dvh; font-family:var(--font-body);
//       font-size:var(--text-base); color:var(--text-c);
//       background:var(--bg); display:flex; flex-direction:column;
//       align-items:center; justify-content:center;
//       padding:var(--space-8) var(--space-4);
//       transition:background var(--transition), color var(--transition);
//     }
//     .theme-toggle {
//       position:fixed; top:var(--space-4); right:var(--space-4);
//       width:40px; height:40px; border-radius:var(--radius-full);
//       background:var(--surface); border:1px solid var(--border);
//       box-shadow:var(--shadow-sm); display:flex; align-items:center;
//       justify-content:center; cursor:pointer; color:var(--text-muted);
//       transition:background var(--transition), box-shadow var(--transition), color var(--transition);
//       z-index:100;
//     }
//     .theme-toggle:hover { background:var(--surface-2); box-shadow:var(--shadow-md); color:var(--text-c); }
//     .card {
//       background:var(--surface); border-radius:var(--radius-xl);
//       border:1px solid var(--border); box-shadow:var(--shadow-lg);
//       padding:var(--space-10) var(--space-8); max-width:460px; width:100%;
//       text-align:center; position:relative; overflow:hidden;
//       transition:background var(--transition), box-shadow var(--transition);
//     }
//     .card::before {
//       content:''; position:absolute; top:0; left:0; right:0; height:3px;
//       background:linear-gradient(90deg, var(--primary), #4f98a3);
//     }
//     .flag { font-size:3rem; margin-bottom:var(--space-4); display:block; }
//     .card-title {
//       font-family:var(--font-display); font-size:var(--text-xl);
//       color:var(--text-c); margin-bottom:var(--space-2); line-height:1.2;
//     }
//     .card-subtitle {
//       font-size:var(--text-sm); color:var(--text-muted);
//       margin-bottom:var(--space-8); line-height:1.6;
//     }
//     .status-area {
//       min-height:160px; display:flex; flex-direction:column;
//       align-items:center; justify-content:center; gap:var(--space-4);
//     }
//     .state { display:none; flex-direction:column; align-items:center; gap:var(--space-3); }
//     .state.active { display:flex; }
//     .spinner-wrap { position:relative; width:64px; height:64px; }
//     .spinner-track { width:64px; height:64px; border-radius:50%; border:3px solid var(--primary-hl); }
//     .spinner-fill {
//       position:absolute; top:0; left:0; width:64px; height:64px;
//       border-radius:50%; border:3px solid transparent;
//       border-top-color:var(--primary); border-right-color:var(--primary);
//       animation:spin 0.8s cubic-bezier(0.5,0,0.5,1) infinite;
//     }
//     @keyframes spin { to { transform:rotate(360deg); } }
//     .spinner-icon {
//       position:absolute; top:50%; left:50%;
//       transform:translate(-50%,-50%); font-size:1.4rem;
//     }
//     .state-label { font-size:var(--text-sm); font-weight:500; color:var(--text-muted); }
//     .dots { display:flex; gap:var(--space-1); }
//     .dot {
//       width:5px; height:5px; border-radius:50%;
//       background:var(--primary); opacity:0.3;
//       animation:dot-pulse 1.2s ease-in-out infinite;
//     }
//     .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
//     @keyframes dot-pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
//     .success-ring {
//       width:64px; height:64px; border-radius:50%;
//       background:var(--success-hl); display:flex;
//       align-items:center; justify-content:center; font-size:1.8rem;
//       animation:pop-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
//     }
//     @keyframes pop-in{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
//     .success-label {
//       font-size:var(--text-sm); font-weight:600; color:var(--success);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both;
//     }
//     .stats-pill {
//       display:inline-flex; align-items:center; gap:var(--space-2);
//       background:var(--success-hl);
//       border:1px solid color-mix(in oklch, var(--success) 20%, transparent);
//       border-radius:var(--radius-full); padding:var(--space-2) var(--space-4);
//       font-size:var(--text-xs); font-weight:600; color:var(--success);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both;
//     }
//     @keyframes fade-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
//     .btn-download {
//       display:inline-flex; align-items:center; gap:var(--space-2);
//       background:var(--primary); color:#fff;
//       font-family:var(--font-body); font-size:var(--text-sm); font-weight:600;
//       padding:var(--space-3) var(--space-8); border-radius:var(--radius-full);
//       border:none; cursor:pointer; box-shadow:var(--shadow-sm);
//       transition:background var(--transition), box-shadow var(--transition), transform var(--transition);
//       text-decoration:none;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.3s both;
//     }
//     .btn-download:hover { background:var(--primary-h); box-shadow:var(--shadow-md); transform:translateY(-1px); }
//     .btn-download:active { transform:translateY(0); }
//     .btn-download svg { transition:transform var(--transition); }
//     .btn-download:hover svg { transform:translateY(2px); }
//     .timestamp {
//       font-size:var(--text-xs); color:var(--text-faint);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.4s both;
//     }
//     .regen-link {
//       display:inline-flex; align-items:center; gap:var(--space-1);
//       font-size:var(--text-xs); color:var(--text-muted); cursor:pointer;
//       border:none; background:none; font-family:var(--font-body);
//       padding:var(--space-1) var(--space-2); border-radius:var(--radius-sm);
//       transition:color var(--transition), background var(--transition);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.5s both;
//     }
//     .regen-link:hover { color:var(--text-c); background:var(--surface-2); }
//     .error-ring {
//       width:64px; height:64px; border-radius:50%; background:#fde8e8;
//       display:flex; align-items:center; justify-content:center; font-size:1.8rem;
//       animation:pop-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
//     }
//     [data-theme="dark"] .error-ring { background:#3b2222; }
//     .error-label {
//       font-size:var(--text-sm); font-weight:600; color:#dc2626;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both;
//     }
//     [data-theme="dark"] .error-label { color:#f87171; }
//     .error-msg {
//       font-size:var(--text-xs); color:var(--text-muted);
//       max-width:30ch; text-align:center;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both;
//     }
//     @media(max-width:480px){ .card{padding:var(--space-8) var(--space-6);} }
//     @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
//   </style>
// </head>
// <body>
//   <button class="theme-toggle" data-theme-toggle aria-label="Toggle dark mode">
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//       <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
//     </svg>
//   </button>

//   <div class="card">
//     <span class="flag">&#127465;&#127466;</span>
//     <h1 class="card-title">Germany Product Feed</h1>
//     <p class="card-subtitle">Live Shopify data &mdash; prices include 19% markup</p>

//     <div class="status-area" id="statusArea">
//       <div class="state active" id="stateGenerating">
//         <div class="spinner-wrap">
//           <div class="spinner-track"></div>
//           <div class="spinner-fill"></div>
//           <span class="spinner-icon">&#9881;&#65039;</span>
//         </div>
//         <span class="state-label">Generating feed&hellip;</span>
//         <div class="dots">
//           <div class="dot"></div><div class="dot"></div><div class="dot"></div>
//         </div>
//       </div>

//       <div class="state" id="stateSuccess">
//         <div class="success-ring">&#9989;</div>
//         <span class="success-label">Feed ready &amp; downloaded!</span>
//         <div class="stats-pill">
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
//           <span id="variantCount">— variants exported</span>
//         </div>
//         <a class="btn-download" href="/api/germany-feed?download=1" download="germany-feed.csv">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//           Download CSV
//         </a>
//         <span class="timestamp" id="genTimestamp"></span>
//         <button class="regen-link" onclick="startFlow()">
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//           Regenerate feed
//         </button>
//       </div>

//       <div class="state" id="stateError">
//         <div class="error-ring">&#10060;</div>
//         <span class="error-label">Generation failed</span>
//         <p class="error-msg" id="errorMsg">Something went wrong. Please try again.</p>
//         <button class="regen-link" style="margin-top:var(--space-2)" onclick="startFlow()">
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//           Try again
//         </button>
//       </div>
//     </div>
//   </div>

//   <script>
//     (function(){
//       const t=document.querySelector('[data-theme-toggle]'),r=document.documentElement;
//       let d=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
//       r.setAttribute('data-theme',d); icon(t,d);
//       t&&t.addEventListener('click',()=>{d=d==='dark'?'light':'dark';r.setAttribute('data-theme',d);icon(t,d);});
//       function icon(b,m){if(!b)return;b.innerHTML=m==='dark'?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';}
//     })();

//     function showState(id){
//       ['stateGenerating','stateSuccess','stateError'].forEach(s=>document.getElementById(s).classList.remove('active'));
//       document.getElementById(id).classList.add('active');
//     }

//     async function startFlow(){
//       showState('stateGenerating');
//       const start = Date.now();
//       try {
//         const res = await fetch('/api/germany-feed?info=1');
//         if(!res.ok){ const e=await res.json().catch(()=>({error:res.statusText})); throw new Error(e.error||'Server error'); }
//         const data = await res.json();

//         // Ensure at least 2 seconds of "generating" feel
//         const elapsed = Date.now() - start;
//         const wait = Math.max(0, 2000 - elapsed);

//         setTimeout(()=>{
//           const count = data.totalVariants ?? '—';
//           const now = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
//           document.getElementById('variantCount').textContent = count + ' variants exported';
//           document.getElementById('genTimestamp').textContent = 'Generated ' + now + ' IST';
//           showState('stateSuccess');
//           // Auto download
//           const a = document.createElement('a');
//           a.href = '/api/germany-feed?download=1';
//           a.download = 'germany-feed.csv';
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//         }, wait);

//       } catch(err){
//         const elapsed = Date.now() - start;
//         setTimeout(()=>{
//           document.getElementById('errorMsg').textContent = err.message || 'Something went wrong.';
//           showState('stateError');
//         }, Math.max(0, 2000 - elapsed));
//       }
//     }

//     startFlow();
//   </script>
// </body>
// </html>`;

//   res.setHeader('Content-Type', 'text/html; charset=utf-8');
//   return res.status(200).send(html);
// };

// async function fetchAllVariants(shop, token, publicationId) {
//   let allVariants = [];
//   let cursor      = null;
//   let hasNextPage = true;

//   while (hasNextPage) {
//     const query = `{
//       publication(id: "${publicationId}") {
//         products(first: 250${cursor ? `, after: "${cursor}"` : ''}) {
//           pageInfo { hasNextPage endCursor }
//           edges {
//             node {
//               variants(first: 10) {
//                 edges {
//                   node {
//                     sku barcode inventoryQuantity
//                     contextualPricing(context: { country: DE }) {
//                       price { amount currencyCode }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }`;

//     const response = await fetch(
//       `https://${shop}/admin/api/2025-04/graphql.json`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Shopify-Access-Token': token,
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const json = await response.json();
//     if (json.errors) throw new Error(JSON.stringify(json.errors));
//     const page = json?.data?.publication?.products;
//     if (!page) throw new Error('No product data returned');

//     for (const { node: product } of page.edges) {
//       for (const { node: variant } of product.variants.edges) {
//         allVariants.push(variant);
//       }
//     }

//     hasNextPage = page.pageInfo.hasNextPage;
//     cursor      = page.pageInfo.endCursor;
//   }

//   return allVariants;
// }
// const fetch = require('node-fetch');

// module.exports = async (req, res) => {
//   const SHOP   = process.env.SHOPIFY_SHOP;
//   const TOKEN  = process.env.SHOPIFY_ADMIN_TOKEN;
//   const PUB_ID = process.env.GERMANY_PUBLICATION_ID;

//   if (!SHOP || !TOKEN || !PUB_ID) {
//     return res.status(500).send('Missing environment variables');
//   }

//   // ?info=1 → return JSON with product + variant count
//   if (req.query.info === '1') {
//     try {
//       const { allVariants, totalProducts } = await fetchAllProducts(SHOP, TOKEN, PUB_ID);
//       return res.status(200).json({
//         totalVariants: allVariants.length,
//         totalProducts: totalProducts,
//       });
//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }
//   }

//   // ?download=1 → fetch from Shopify, build CSV, send file
//   if (req.query.download === '1') {
//     try {
//       const { allVariants } = await fetchAllProducts(SHOP, TOKEN, PUB_ID);
//       const rows = [['EAN_CODE', 'SKU', 'STOCK', 'PRICE_EUR']];
//       for (const v of allVariants) {
//         const basePrice  = parseFloat(v.contextualPricing?.price?.amount || 0);
//         const finalPrice = (basePrice * 1).toFixed(2);
//         rows.push([
//           v.barcode           || '',
//           v.sku               || '',
//           v.inventoryQuantity ?? 0,
//           finalPrice,
//         ]);
//       }
//       const csv = rows
//         .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
//         .join('\n');

//       res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//       res.setHeader('Content-Disposition', 'attachment; filename="germany-feed.csv"');
//       res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//       return res.status(200).send(csv);
//     } catch (err) {
//       console.error('[Germany Feed Error]', err.message);
//       return res.status(500).json({ error: err.message });
//     }
//   }

//   // Default → serve HTML page
//   const html = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8"/>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Germany Product Feed</title>
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
//   <style>
//     *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//     :root {
//       --font-display: 'Instrument Serif', Georgia, serif;
//       --font-body: 'Inter', sans-serif;
//       --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
//       --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
//       --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
//       --text-xl: clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem);
//       --space-1:.25rem;--space-2:.5rem;--space-3:.75rem;--space-4:1rem;
//       --space-6:1.5rem;--space-8:2rem;--space-10:2.5rem;
//       --radius-sm:.375rem;--radius-full:9999px;--radius-xl:1rem;
//       --transition: 180ms cubic-bezier(0.16,1,0.3,1);
//       --bg:#f7f6f2;--surface:#ffffff;--surface-2:#f3f0ec;
//       --border:rgba(40,37,29,0.1);
//       --text-c:#28251d;--text-muted:#7a7974;--text-faint:#bab9b4;
//       --primary:#01696f;--primary-h:#0c4e54;--primary-hl:#cedcd8;
//       --success:#437a22;--success-hl:#d4dfcc;
//       --shadow-sm:0 1px 2px rgba(40,37,29,0.06);
//       --shadow-md:0 4px 16px rgba(40,37,29,0.09);
//       --shadow-lg:0 12px 40px rgba(40,37,29,0.13);
//     }
//     [data-theme="dark"] {
//       --bg:#171614;--surface:#1c1b19;--surface-2:#22211f;
//       --border:rgba(255,255,255,0.08);
//       --text-c:#cdccca;--text-muted:#797876;--text-faint:#5a5957;
//       --primary:#4f98a3;--primary-h:#227f8b;--primary-hl:#313b3b;
//       --success:#6daa45;--success-hl:#3a4435;
//       --shadow-sm:0 1px 2px rgba(0,0,0,0.25);
//       --shadow-md:0 4px 16px rgba(0,0,0,0.35);
//       --shadow-lg:0 12px 40px rgba(0,0,0,0.45);
//     }
//     html { -webkit-font-smoothing:antialiased; }
//     body {
//       min-height:100dvh; font-family:var(--font-body);
//       font-size:var(--text-base); color:var(--text-c);
//       background:var(--bg); display:flex; flex-direction:column;
//       align-items:center; justify-content:center;
//       padding:var(--space-8) var(--space-4);
//       transition:background var(--transition),color var(--transition);
//     }
//     .theme-toggle {
//       position:fixed; top:var(--space-4); right:var(--space-4);
//       width:40px; height:40px; border-radius:var(--radius-full);
//       background:var(--surface); border:1px solid var(--border);
//       box-shadow:var(--shadow-sm); display:flex; align-items:center;
//       justify-content:center; cursor:pointer; color:var(--text-muted);
//       transition:background var(--transition),box-shadow var(--transition),color var(--transition);
//       z-index:100;
//     }
//     .theme-toggle:hover { background:var(--surface-2); box-shadow:var(--shadow-md); color:var(--text-c); }
//     .card {
//       background:var(--surface); border-radius:var(--radius-xl);
//       border:1px solid var(--border); box-shadow:var(--shadow-lg);
//       padding:var(--space-10) var(--space-8); max-width:460px; width:100%;
//       text-align:center; position:relative; overflow:hidden;
//       transition:background var(--transition),box-shadow var(--transition);
//     }
//     .card::before {
//       content:''; position:absolute; top:0; left:0; right:0; height:3px;
//       background:linear-gradient(90deg, var(--primary), #4f98a3);
//     }
//     .flag { font-size:3rem; margin-bottom:var(--space-4); display:block; }
//     .card-title {
//       font-family:var(--font-display); font-size:var(--text-xl);
//       color:var(--text-c); margin-bottom:var(--space-2); line-height:1.2;
//     }
//     .card-subtitle {
//       font-size:var(--text-sm); color:var(--text-muted);
//       margin-bottom:var(--space-8); line-height:1.6;
//     }
//     .status-area {
//       min-height:160px; display:flex; flex-direction:column;
//       align-items:center; justify-content:center; gap:var(--space-4);
//     }
//     .state { display:none; flex-direction:column; align-items:center; gap:var(--space-3); }
//     .state.active { display:flex; }
//     .spinner-wrap { position:relative; width:64px; height:64px; }
//     .spinner-track { width:64px; height:64px; border-radius:50%; border:3px solid var(--primary-hl); }
//     .spinner-fill {
//       position:absolute; top:0; left:0; width:64px; height:64px;
//       border-radius:50%; border:3px solid transparent;
//       border-top-color:var(--primary); border-right-color:var(--primary);
//       animation:spin 0.8s cubic-bezier(0.5,0,0.5,1) infinite;
//     }
//     @keyframes spin { to { transform:rotate(360deg); } }
//     .spinner-icon {
//       position:absolute; top:50%; left:50%;
//       transform:translate(-50%,-50%); font-size:1.4rem;
//     }
//     .state-label { font-size:var(--text-sm); font-weight:500; color:var(--text-muted); }
//     .dots { display:flex; gap:var(--space-1); }
//     .dot {
//       width:5px; height:5px; border-radius:50%;
//       background:var(--primary); opacity:0.3;
//       animation:dot-pulse 1.2s ease-in-out infinite;
//     }
//     .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
//     @keyframes dot-pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
//     .success-ring {
//       width:64px; height:64px; border-radius:50%;
//       background:var(--success-hl); display:flex;
//       align-items:center; justify-content:center; font-size:1.8rem;
//       animation:pop-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
//     }
//     @keyframes pop-in{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
//     .success-label {
//       font-size:var(--text-sm); font-weight:600; color:var(--success);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both;
//     }
//     .stats-row {
//       display:flex; gap:var(--space-3); flex-wrap:wrap; justify-content:center;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both;
//     }
//     .stats-pill {
//       display:inline-flex; align-items:center; gap:var(--space-2);
//       background:var(--success-hl); border:1px solid rgba(67,122,34,0.2);
//       border-radius:var(--radius-full); padding:var(--space-2) var(--space-4);
//       font-size:var(--text-xs); font-weight:600; color:var(--success);
//     }
//     @keyframes fade-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
//     .btn-download {
//       display:inline-flex; align-items:center; gap:var(--space-2);
//       background:var(--primary); color:#fff;
//       font-family:var(--font-body); font-size:var(--text-sm); font-weight:600;
//       padding:var(--space-3) var(--space-8); border-radius:var(--radius-full);
//       border:none; cursor:pointer; box-shadow:var(--shadow-sm);
//       transition:background var(--transition),box-shadow var(--transition),transform var(--transition);
//       text-decoration:none;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.3s both;
//     }
//     .btn-download:hover { background:var(--primary-h); box-shadow:var(--shadow-md); transform:translateY(-1px); }
//     .btn-download:active { transform:translateY(0); }
//     .btn-download svg { transition:transform var(--transition); }
//     .btn-download:hover svg { transform:translateY(2px); }
//     .timestamp {
//       font-size:var(--text-xs); color:var(--text-faint);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.4s both;
//     }
//     .regen-link {
//       display:inline-flex; align-items:center; gap:var(--space-1);
//       font-size:var(--text-xs); color:var(--text-muted); cursor:pointer;
//       border:none; background:none; font-family:var(--font-body);
//       padding:var(--space-1) var(--space-2); border-radius:var(--radius-sm);
//       transition:color var(--transition),background var(--transition);
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.5s both;
//     }
//     .regen-link:hover { color:var(--text-c); background:var(--surface-2); }
//     .error-ring {
//       width:64px; height:64px; border-radius:50%; background:#fde8e8;
//       display:flex; align-items:center; justify-content:center; font-size:1.8rem;
//       animation:pop-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
//     }
//     [data-theme="dark"] .error-ring { background:#3b2222; }
//     .error-label {
//       font-size:var(--text-sm); font-weight:600; color:#dc2626;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both;
//     }
//     [data-theme="dark"] .error-label { color:#f87171; }
//     .error-msg {
//       font-size:var(--text-xs); color:var(--text-muted);
//       max-width:30ch; text-align:center;
//       animation:fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both;
//     }
//     @media(max-width:480px){ .card{padding:var(--space-8) var(--space-6);} }
//     @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
//   </style>
// </head>
// <body>

//   <button class="theme-toggle" data-theme-toggle aria-label="Toggle dark mode">
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//       <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
//     </svg>
//   </button>

//   <div class="card">
//     <span class="flag">&#127465;&#127466;</span>
//     <h1 class="card-title">Germany Product Feed</h1>
//     <p class="card-subtitle">Live Shopify data &mdash; prices include 18% markup</p>

//     <div class="status-area" id="statusArea">

//       <!-- Generating -->
//       <div class="state active" id="stateGenerating">
//         <div class="spinner-wrap">
//           <div class="spinner-track"></div>
//           <div class="spinner-fill"></div>
//           <span class="spinner-icon">&#9881;&#65039;</span>
//         </div>
//         <span class="state-label">Generating feed&hellip;</span>
//         <div class="dots">
//           <div class="dot"></div><div class="dot"></div><div class="dot"></div>
//         </div>
//       </div>

//       <!-- Success -->
//       <div class="state" id="stateSuccess">
//         <div class="success-ring">&#9989;</div>
//         <span class="success-label">Feed ready &amp; downloaded!</span>
//         <div class="stats-row">
//           <div class="stats-pill">
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
//             <span id="productCount">&#8212; products</span>
//           </div>
//           <div class="stats-pill">
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
//             <span id="variantCount">&#8212; variants</span>
//           </div>
//         </div>
//         <a class="btn-download" href="/api/germany-feed?download=1" download="germany-feed.csv">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//           Download CSV
//         </a>
//         <span class="timestamp" id="genTimestamp"></span>
//         <button class="regen-link" onclick="startFlow()">
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//           Regenerate feed
//         </button>
//       </div>

//       <!-- Error -->
//       <div class="state" id="stateError">
//         <div class="error-ring">&#10060;</div>
//         <span class="error-label">Generation failed</span>
//         <p class="error-msg" id="errorMsg">Something went wrong. Please try again.</p>
//         <button class="regen-link" style="margin-top:var(--space-2)" onclick="startFlow()">
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
//           Try again
//         </button>
//       </div>

//     </div>
//   </div>

//   <script>
//     (function(){
//       var t=document.querySelector('[data-theme-toggle]'),r=document.documentElement;
//       var d=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
//       r.setAttribute('data-theme',d); setIcon(t,d);
//       if(t) t.addEventListener('click',function(){d=d==='dark'?'light':'dark';r.setAttribute('data-theme',d);setIcon(t,d);});
//       function setIcon(b,m){if(!b)return;b.innerHTML=m==='dark'?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';}
//     })();

//     function showState(id){
//       ['stateGenerating','stateSuccess','stateError'].forEach(function(s){document.getElementById(s).classList.remove('active');});
//       document.getElementById(id).classList.add('active');
//     }

//     function startFlow(){
//       showState('stateGenerating');
//       var start = Date.now();

//       fetch('/api/germany-feed?info=1')
//         .then(function(res){
//           if(!res.ok) return res.json().then(function(e){throw new Error(e.error||'Server error');});
//           return res.json();
//         })
//         .then(function(data){
//           var elapsed = Date.now() - start;
//           var wait = Math.max(0, 2000 - elapsed);
//           setTimeout(function(){
//             var variants = data.totalVariants !== undefined ? data.totalVariants : '\u2014';
//             var products = data.totalProducts !== undefined ? data.totalProducts : '\u2014';
//             var now = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
//             document.getElementById('variantCount').textContent = variants + ' variants';
//             document.getElementById('productCount').textContent = products + ' products';
//             document.getElementById('genTimestamp').textContent = 'Generated ' + now + ' IST';
//             showState('stateSuccess');
//             var a = document.createElement('a');
//             a.href = '/api/germany-feed?download=1';
//             a.download = 'germany-feed.csv';
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//           }, wait);
//         })
//         .catch(function(err){
//           var elapsed = Date.now() - start;
//           setTimeout(function(){
//             document.getElementById('errorMsg').textContent = err.message || 'Something went wrong.';
//             showState('stateError');
//           }, Math.max(0, 2000 - elapsed));
//         });
//     }

//     startFlow();
//   </script>
// </body>
// </html>`;

//   res.setHeader('Content-Type', 'text/html; charset=utf-8');
//   return res.status(200).send(html);
// };

// async function fetchAllProducts(shop, token, publicationId) {
//   let allVariants   = [];
//   let totalProducts = 0;
//   let cursor        = null;
//   let hasNextPage   = true;

//   while (hasNextPage) {
//     const query = `{
//       publication(id: "${publicationId}") {
//         products(first: 250${cursor ? `, after: "${cursor}"` : ''}) {
//           pageInfo { hasNextPage endCursor }
//           edges {
//             node {
//               variants(first: 10) {
//                 edges {
//                   node {
//                     sku barcode inventoryQuantity
//                     contextualPricing(context: { country: DE }) {
//                       price { amount currencyCode }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }`;

//     const response = await fetch(
//       `https://${shop}/admin/api/2025-04/graphql.json`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Shopify-Access-Token': token,
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const json = await response.json();
//     if (json.errors) throw new Error(JSON.stringify(json.errors));
//     const page = json?.data?.publication?.products;
//     if (!page) throw new Error('No product data returned');

//     for (const { node: product } of page.edges) {
//       totalProducts++;
//       for (const { node: variant } of product.variants.edges) {
//         allVariants.push(variant);
//       }
//     }

//     hasNextPage = page.pageInfo.hasNextPage;
//     cursor      = page.pageInfo.endCursor;
//   }

//   return { allVariants, totalProducts };
// }
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const SHOP   = process.env.SHOPIFY_SHOP;
  const TOKEN  = process.env.SHOPIFY_ADMIN_TOKEN;
  const PUB_ID = process.env.GERMANY_PUBLICATION_ID;

  if (!SHOP || !TOKEN || !PUB_ID) {
    return res.status(500).send('Missing environment variables');
  }

  try {
    const { allVariants, totalProducts } = await fetchAllProducts(SHOP, TOKEN, PUB_ID);
    // const rows = [['ean_code', 'SKU', 'STOCK', 'PRICE_EUR']];
    const rows = [['ean_code', 'price_incl_vat', 'stock', 'origin']];

    for (const v of allVariants) {
      const basePrice  = parseFloat(v.contextualPricing?.price?.amount || 0);
      const finalPrice = (basePrice * 1).toFixed(2);
      rows.push([
        v.barcode           || '',
        finalPrice,
        //v.sku               || '',
        v.inventoryQuantity ?? 0,
        'own',
      ]);
    }

    const csv = rows
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(csv);

  } catch (err) {
    console.error('[Germany Feed Error]', err.message);
    return res.status(500).send('Error generating feed: ' + err.message);
  }
};

async function fetchAllProducts(shop, token, publicationId) {
  let allVariants   = [];
  let totalProducts = 0;
  let cursor        = null;
  let hasNextPage   = true;

  while (hasNextPage) {
    const query = `{
      publication(id: "${publicationId}") {
        products(first: 250${cursor ? `, after: "${cursor}"` : ''}) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              variants(first: 10) {
                edges {
                  node {
                    sku barcode inventoryQuantity
                    contextualPricing(context: { country: DE }) {
                      price { amount currencyCode }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    const response = await fetch(
      `https://${shop}/admin/api/2025-04/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query }),
      }
    );

    const json = await response.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    const page = json?.data?.publication?.products;
    if (!page) throw new Error('No product data returned — check Publication ID');

    for (const { node: product } of page.edges) {
      totalProducts++;
      for (const { node: variant } of product.variants.edges) {
        allVariants.push(variant);
      }
    }

    hasNextPage = page.pageInfo.hasNextPage;
    cursor      = page.pageInfo.endCursor;
  }

  return { allVariants, totalProducts };
}