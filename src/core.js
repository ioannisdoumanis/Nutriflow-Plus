/* ================================================================
   NutriFlow — core: helpers, state, derived data, db, charts
   ================================================================ */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g,'').slice(0,20) : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const EUR = new Intl.NumberFormat('el-GR', {style:'currency', currency:'EUR', maximumFractionDigits:0});
const EUR2 = new Intl.NumberFormat('el-GR', {style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2});
const N1 = new Intl.NumberFormat('el-GR', {minimumFractionDigits:1, maximumFractionDigits:1});
const N0 = new Intl.NumberFormat('el-GR', {maximumFractionDigits:0});
const MON = ['Ιαν','Φεβ','Μαρ','Απρ','Μαΐ','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ'];
const MONG = ['Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου','Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου'];
const MONN = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];
const DAY = ['Κυριακή','Δευτέρα','Τρίτη','Τετάρτη','Πέμπτη','Παρασκευή','Σάββατο'];
const DAYS = ['Κυρ','Δευ','Τρί','Τετ','Πέμ','Παρ','Σάβ'];

function isoOf(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
const today = () => isoOf(new Date());
function P(s){ const a = String(s || '').split('-').map(Number); return new Date(a[0] || 1970, (a[1] || 1) - 1, a[2] || 1); }
function addD(s, n){ const d = P(s); d.setDate(d.getDate() + n); return isoOf(d); }
function monday(s){ const d = P(s); return addD(s, -((d.getDay() + 6) % 7)); }
function ddiff(a, b){ return Math.round((P(b) - P(a)) / 864e5); }
function fmtD(s){ if(!s) return '—'; const d = P(s); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtS(s){ if(!s) return '—'; const d = P(s); return d.getDate() + ' ' + MON[d.getMonth()]; }
function fmtL(s){ const d = P(s); return DAY[d.getDay()] + ' ' + d.getDate() + ' ' + MONG[d.getMonth()]; }
function rel(s){
  const n = ddiff(today(), s);
  if(n === 0) return 'σήμερα'; if(n === 1) return 'αύριο'; if(n === -1) return 'χθες';
  if(n > 1 && n < 7) return DAY[P(s).getDay()];
  if(n < 0 && n > -31) return 'πριν ' + (-n) + ' ημ.';
  return fmtS(s);
}
function nowMin(){ const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function tmin(t){ const a = String(t || '0:0').split(':').map(Number); return a[0] * 60 + (a[1] || 0); }
function tstr(m){ return String(Math.floor(m / 60)).padStart(2,'0') + ':' + String(m % 60).padStart(2,'0'); }
function age(bd){ if(!bd) return null; const d = P(bd), t = new Date(); let a = t.getFullYear() - d.getFullYear(); if(t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--; return a; }
function initials(n){ return String(n || '?').trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase(); }
function first(n){ return String(n || '').trim().split(/\s+/)[0] || ''; }
function hash(s){ let h = 0; for(const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f ? f(x) : x) || 0), 0);

/* ---------------- icons ---------------- */
const I = {
  home:'<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M16 4.6a3.4 3.4 0 0 1 0 6.8M18 14.8c1.7.7 2.8 2.5 3 5.2"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  plan:'<path d="M12 3c4 2.5 6 6 6 9.5A6 6 0 0 1 6 12.5C6 9 8 5.5 12 3Z"/><path d="M12 21V11"/>',
  euro:'<path d="M17.5 6.8A6.6 6.6 0 0 0 7 9.4m0 5.2a6.6 6.6 0 0 0 10.5 2.6"/><path d="M4.5 10.6h8.5M4.5 13.4h8.5"/>',
  gear:'<circle cx="12" cy="12" r="3.1"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14.1 2.6h-4.2L9.5 5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.4h4.2l.4-2.4a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chevR:'<path d="m9 6 6 6-6 6"/>', chevL:'<path d="m15 6-6 6 6 6"/>',
  scale:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9.5a5 5 0 0 1 7 0L12 13z"/>',
  trend:'<path d="m3.5 16.5 5.5-5.5 3.5 3.5 8-8"/><path d="M20.5 11V6.5H16"/>',
  trendD:'<path d="m3.5 7.5 5.5 5.5 3.5-3.5 8 8"/><path d="M20.5 13v4.5H16"/>',
  alert:'<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.2M12 17.2h.01"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  wallet:'<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11.5" rx="2.5"/><circle cx="16" cy="13.7" r="1.2"/>',
  box:'<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
  cake:'<path d="M4 20h16v-7.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 12.5z"/><path d="M4 15c2.7 1.4 5.3 1.4 8 0 2.7-1.4 5.3-1.4 8 0M12 10V7M12 4.5v.01"/>',
  copy:'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
  down:'<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4.5 19.5h15"/>',
  edit:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash:'<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  note:'<path d="M5 3.5h10.5L19 7v13.5H5z"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
  phone:'<path d="M5 4h3.5l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5L15 13.5l5 2V19a1.5 1.5 0 0 1-1.6 1.5C10.5 20 4 13.5 3.5 5.6A1.5 1.5 0 0 1 5 4Z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  flame:'<path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-4-3.5-5.5-4-10-2.5 2-3.5 4-3.5 6-1.2-.7-2-2-2-3.5C6.5 9 5.5 11.4 5.5 14.5A6.5 6.5 0 0 0 12 21Z"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>',
  drop:'<path d="M12 3.5c3.5 4.2 6 7.7 6 10.8a6 6 0 0 1-12 0c0-3.1 2.5-6.6 6-10.8Z"/>',
  bolt:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  logout:'<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  sparkle:'<path d="M12 3.5 13.8 10 20.5 12l-6.7 2L12 20.5 10.2 14 3.5 12l6.7-2z"/>',
  file:'<path d="M6 3.5h8L19 8.5v12H6z"/><path d="M13.5 3.5v5.5H19"/>',
  receipt:'<path d="M6 3.5h12v17l-2.4-1.5-2 1.5-1.6-1.5-1.6 1.5-2-1.5L6 20.5z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  chart:'<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6.5" width="3" height="11" rx="1"/><rect x="15.5" y="9" width="3" height="8.5" rx="1"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.2"/>',
  unlock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 7.7-1.5"/><circle cx="12" cy="15.5" r="1.2"/>',
  pie:'<path d="M12 3.5v8.5h8.5A8.5 8.5 0 1 1 12 3.5Z"/><path d="M15 3.9A8.5 8.5 0 0 1 20.1 9H15z"/>'
};
function ic(n, attrs){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' + (attrs || '') + '>' + (I[n] || '') + '</svg>'; }

/* ---------------- constants ---------------- */
const GOALS = ['Απώλεια βάρους','Αύξηση μυϊκής μάζας','Διατήρηση','Αθλητική διατροφή','Παθολογική διατροφή','Εγκυμοσύνη'];
const GOAL_C = {'Απώλεια βάρους':'mint','Αύξηση μυϊκής μάζας':'violet','Διατήρηση':'sky','Αθλητική διατροφή':'amber','Παθολογική διατροφή':'rose','Εγκυμοσύνη':'violet'};
const ACT = [{v:1.2,l:'Καθιστική ζωή'},{v:1.375,l:'Ελαφριά άσκηση (1–3/εβδ.)'},{v:1.55,l:'Μέτρια άσκηση (3–5/εβδ.)'},{v:1.725,l:'Έντονη άσκηση (6–7/εβδ.)'},{v:1.9,l:'Αθλητής / διπλές προπονήσεις'}];
const TYPES = ['Πρώτη επίσκεψη','Επανέλεγχος','Μέτρηση σύστασης','Online συνεδρία'];
const TYPE_C = {'Πρώτη επίσκεψη':'violet','Επανέλεγχος':'mint','Μέτρηση σύστασης':'sky','Online συνεδρία':'amber'};
const TYPE_DUR = {'Πρώτη επίσκεψη':60,'Επανέλεγχος':45,'Μέτρηση σύστασης':30,'Online συνεδρία':30};
const STATUS = {scheduled:{l:'Προγραμματισμένο',c:'sky'},done:{l:'Ολοκληρώθηκε',c:'mint'},noshow:{l:'Δεν προσήλθε',c:'rose'},cancelled:{l:'Ακυρώθηκε',c:''}};
const METHODS = ['Κάρτα','Μετρητά','IRIS','Τραπεζική κατάθεση'];
const METHOD_C = {'Κάρτα':'var(--mint)','Μετρητά':'var(--amber)','IRIS':'var(--violet)','Τραπεζική κατάθεση':'var(--sky)'};
const MEALS = ['Πρωινό','Δεκατιανό','Μεσημεριανό','Απογευματινό','Βραδινό'];
const CATS = {all:'Όλα',dairy:'Γαλακτοκομικά',meat:'Κρέας & ψάρι',legume:'Όσπρια',grain:'Αμυλούχα',veg:'Λαχανικά',fruit:'Φρούτα',fat:'Λίπη & ξηροί',dish:'Μαγειρευτά',snack:'Σνακ'};
const COLORS = {mint:'var(--mint)',violet:'var(--violet)',sky:'var(--sky)',amber:'var(--amber)',rose:'var(--rose)'};
const AVG = [['#5CF0B0','#6FCBFF'],['#A394FF','#6FCBFF'],['#FFC46B','#FF7A93'],['#6FCBFF','#5CF0B0'],['#FF7A93','#A394FF'],['#A394FF','#5CF0B0'],['#FFC46B','#5CF0B0']];
const FOODMAP = {}; FOODS.forEach(f => FOODMAP[f.n] = f);
const DEFAULT_SETTINGS = {practiceName:'Γραφείο Διατροφής', sessionPrice:45, firstVisitPrice:65,
  presets:[{name:'Πακέτο 8 συνεδριών',sessions:8,price:300},{name:'Πακέτο 4 συνεδριών',sessions:4,price:160},{name:'Online μηνιαίο (4 συνεδρίες)',sessions:4,price:100}]};

function av(name, size){ const g = AVG[hash(name) % AVG.length]; return '<span class="av ' + (size || '') + '" style="background:linear-gradient(135deg,' + g[0] + ',' + g[1] + ')">' + esc(initials(name)) + '</span>'; }
function chip(text, color, dot){ return '<span class="chip ' + (color || '') + (dot ? ' glow' : '') + '">' + (dot ? '<i></i>' : '') + esc(text) + '</span>'; }

/* ---------------- state ---------------- */
const COLS = ['clients','measurements','appointments','packages','payments','plans','expenses','settings'];
const S = {
  view:'today', cid:null, ctab:'overview', metric:'weight',
  filter:'active', q:'', sort:'name',
  week:monday(today()), calDay:today(), finRange:12, ptab:'client', paySearch:'',
  loading:true, db:null, dl:null, user:null, me:null, canWrite:true,
  clients:[], measurements:[], appointments:[], packages:[], payments:[], plans:[], expenses:[], settings:[],
  expFilter:'all', expQ:'', repRange:'12', finUnlocked:false,
  draft:null, activeMeal:0, foodCat:'all', foodQ:''
};
function cfg(){ const d = S.settings.find(x => x.id === 'main'); return Object.assign({}, DEFAULT_SETTINGS, d || {}); }

/* ---------------- index & derived ---------------- */
let IX = {}, dirty = true;
function reindex(){
  const by = (arr, key) => { const m = {}; arr.forEach(x => { const k = x[key || 'clientId']; (m[k] || (m[k] = [])).push(x); }); return m; };
  IX.client = {}; S.clients.forEach(c => IX.client[c.id] = c);
  IX.meas = by(S.measurements); Object.values(IX.meas).forEach(a => a.sort((x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
  IX.appt = by(S.appointments); Object.values(IX.appt).forEach(a => a.sort((x, y) => (x.date + x.time) < (y.date + y.time) ? -1 : 1));
  IX.pay = by(S.payments); Object.values(IX.pay).forEach(a => a.sort((x, y) => x.date < y.date ? 1 : -1));
  IX.pkg = by(S.packages); Object.values(IX.pkg).forEach(a => a.sort((x, y) => x.startDate < y.startDate ? -1 : 1));
  IX.plan = by(S.plans.filter(p => !p.isTemplate)); Object.values(IX.plan).forEach(a => a.sort((x, y) => x.date < y.date ? 1 : -1));
  IX.used = {}; IX.booked = {};
  S.appointments.forEach(a => {
    if(!a.packageId) return;
    if(a.status === 'done' || a.status === 'noshow') IX.used[a.packageId] = (IX.used[a.packageId] || 0) + 1;
    else if(a.status === 'scheduled') IX.booked[a.packageId] = (IX.booked[a.packageId] || 0) + 1;
  });
  dirty = false;
}
const client = id => IX.client[id];
const meas = cid => IX.meas[cid] || [];
const appts = cid => IX.appt[cid] || [];
const pays = cid => IX.pay[cid] || [];
const pkgs = cid => IX.pkg[cid] || [];
const cplans = cid => IX.plan[cid] || [];
const lastM = cid => { const m = meas(cid); return m.length ? m[m.length - 1] : null; };
const firstM = cid => { const m = meas(cid); return m.length ? m[0] : null; };
const pkgUsed = p => (Number(p.usedOffset) || 0) + (IX.used[p.id] || 0);
function activePkg(cid){ const a = pkgs(cid).filter(p => pkgUsed(p) < Number(p.sessions)); return a.length ? a[a.length - 1] : null; }
function charges(cid){ return sum(pkgs(cid), p => p.price) + sum(appts(cid).filter(a => a.status === 'done' && !a.packageId && a.fee), a => a.fee); }
function paid(cid){ return sum(pays(cid), p => p.amount); }
function balance(cid){ return Math.round((charges(cid) - paid(cid)) * 100) / 100; }
function nextA(cid){ const t = today(), n = tstr(nowMin()); return appts(cid).find(a => a.status === 'scheduled' && (a.date > t || (a.date === t && a.time >= n))) || null; }
function lastVisit(cid){ const d = appts(cid).filter(a => a.status === 'done'); if(d.length) return d[d.length - 1].date; const m = lastM(cid); return m ? m.date : (client(cid) || {}).startDate; }
function bmi(w, h){ return w && h ? w / Math.pow(h / 100, 2) : null; }
function bmiCat(v){ if(v == null) return ['—','']; if(v < 18.5) return ['Ελλιποβαρής','amber']; if(v < 25) return ['Φυσιολογικό','mint']; if(v < 30) return ['Υπέρβαρος','amber']; if(v < 35) return ['Παχυσαρκία Ι','rose']; return ['Παχυσαρκία ΙΙ+','rose']; }
function fatCat(bf, sex){ if(bf == null) return ['—','']; const lim = sex === 'Γ' ? [21, 33, 39] : [8, 20, 25]; if(bf < lim[0]) return ['Χαμηλό','amber']; if(bf <= lim[1]) return ['Υγιές εύρος','mint']; if(bf <= lim[2]) return ['Αυξημένο','amber']; return ['Υψηλό','rose']; }
function visCat(v){ if(v == null) return ['—','']; return v <= 12 ? ['Υγιές (1–12)','mint'] : ['Αυξημένο (13+)','rose']; }
function bmr(c, w){ if(!w || !c || !c.height) return null; const a = age(c.birthdate) || 35; const b = 10 * w + 6.25 * c.height - 5 * a; return c.sex === 'Γ' ? b - 161 : b + 5; }
function tdee(c, w){ const b = bmr(c, w); return b ? b * (Number(c.activity) || 1.375) : null; }
function targetK(c, w){
  const t = tdee(c, w); if(!t) return null;
  const adj = {'Απώλεια βάρους':-500,'Αύξηση μυϊκής μάζας':300,'Παθολογική διατροφή':-300,'Εγκυμοσύνη':340}[c.goal] || 0;
  return Math.round((t + adj) / 10) * 10;
}
function macroT(c, w){
  const k = targetK(c, w); if(!k) return null;
  const gpk = {'Απώλεια βάρους':1.8,'Αύξηση μυϊκής μάζας':2.0,'Αθλητική διατροφή':1.7,'Εγκυμοσύνη':1.2}[c.goal] || 1.4;
  const p = Math.round(gpk * w), f = Math.round(k * 0.28 / 9), cc = Math.max(0, Math.round((k - p * 4 - f * 9) / 4));
  return {k, p, c:cc, f, gpk};
}
function monthsBack(n){
  const t = P(today()), out = [];
  for(let i = n - 1; i >= 0; i--){ const d = new Date(t.getFullYear(), t.getMonth() - i, 1); out.push({key:isoOf(d).slice(0,7), l:MON[d.getMonth()], m:d.getMonth(), y:d.getFullYear()}); }
  return out;
}
function revenueBy(months){ const m = {}; S.payments.forEach(p => { const k = String(p.date).slice(0,7); m[k] = (m[k] || 0) + (Number(p.amount) || 0); }); return months.map(x => Object.assign({}, x, {v:m[x.key] || 0})); }
function progress(c){
  const f = firstM(c.id), l = lastM(c.id);
  if(!f || !l) return null;
  const d = l.weight - f.weight;
  let pct = null;
  if(c.targetWeight){ const tot = f.weight - c.targetWeight; pct = tot ? Math.max(0, Math.min(1, (f.weight - l.weight) / tot)) : 1; }
  return {from:f.weight, to:l.weight, d, pct};
}
function planTot(p){
  let k = 0, pr = 0, c = 0, f = 0;
  (p.meals || []).forEach(m => (m.items || []).forEach(i => { k += +i.kcal || 0; pr += +i.p || 0; c += +i.c || 0; f += +i.f || 0; }));
  return {k:Math.round(k), p:Math.round(pr), c:Math.round(c), f:Math.round(f)};
}
function mealK(m){ return Math.round(sum(m.items || [], i => i.kcal)); }
function scaleItem(it){
  if(!it.base) return it;
  const k = (Number(it.qty) || 0) / (Number(it.per) || 1);
  it.kcal = Math.round(it.base[0] * k); it.p = Math.round(it.base[1] * k * 10) / 10; it.c = Math.round(it.base[2] * k * 10) / 10; it.f = Math.round(it.base[3] * k * 10) / 10;
  return it;
}
function itemFromFood(f, qty){ return scaleItem({food:f.n, qty:qty == null ? f.d : qty, unit:f.unit, per:f.per, base:[f.kcal, f.p, f.c, f.f]}); }

function alerts(){
  const out = [], t = today();
  S.clients.filter(c => c.status !== 'inactive').forEach(c => {
    const b = balance(c.id);
    if(b > 0) out.push({c, k:'debt', pri:2 + b / 100, color:'rose', icon:'wallet', title:'Οφειλή ' + EUR.format(b), sub:c.name});
    const ap = activePkg(c.id);
    if(ap){ const left = ap.sessions - pkgUsed(ap); if(left <= 1) out.push({c, k:'pkg', pri:2.5, color:'amber', icon:'box', title:(left === 1 ? 'Τελευταία συνεδρία πακέτου' : 'Το πακέτο ολοκληρώθηκε'), sub:c.name + ' · ' + ap.name}); }
    else if(pkgs(c.id).length && !nextA(c.id)) {}
    if(!nextA(c.id)){ const lv = lastVisit(c.id); const n = lv ? ddiff(lv, t) : 0; if(n >= 14) out.push({c, k:'gap', pri:1.5 + n / 30, color:'sky', icon:'cal', title:'Χωρίς ραντεβού · ' + n + ' ημέρες', sub:c.name + ' · τελευταία επίσκεψη ' + fmtS(lv)}); }
    const m = meas(c.id);
    if(m.length >= 2 && (c.goal === 'Απώλεια βάρους' || c.goal === 'Παθολογική διατροφή')){ const d = m[m.length - 1].weight - m[m.length - 2].weight; if(d >= 0.6) out.push({c, k:'up', pri:3, color:'amber', icon:'trend', title:'Αύξηση βάρους +' + N1.format(d) + ' kg', sub:c.name + ' · στην τελευταία μέτρηση'}); }
    if(c.birthdate){ const bd = P(c.birthdate), now = P(t); let nb = new Date(now.getFullYear(), bd.getMonth(), bd.getDate()); if(nb < now) nb = new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate()); const n = Math.round((nb - now) / 864e5); if(n <= 7) out.push({c, k:'bday', pri:1, color:'violet', icon:'cake', title:n === 0 ? 'Γενέθλια σήμερα' : 'Γενέθλια σε ' + n + ' ημέρες', sub:c.name + ' · ' + ((age(c.birthdate) || 0) + (n === 0 ? 0 : 1)) + ' ετών'}); }
  });
  return out.sort((a, b) => b.pri - a.pri);
}

/* ---------------- db ---------------- */
function toast(msg, icon){
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(icon || 'check') + '<span></span>'; t.lastChild.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2800);
}
function onWriteError(e){
  if(e && e.code === 'invalid_argument'){ S.canWrite = false; toast('Δεν έχετε δικαίωμα αλλαγών σε αυτό το αρχείο.', 'alert'); render(); }
  else if(e && e.code === 'quota_exceeded') toast('Η βάση είναι γεμάτη. Διαγράψτε παλιές εγγραφές.', 'alert');
  else toast('Η αποθήκευση απέτυχε — δοκιμάστε ξανά.', 'alert');
}
function localSet(col, id, data){ const i = S[col].findIndex(x => x.id === id); const rec = Object.assign({id}, data); if(i >= 0) S[col][i] = rec; else S[col].push(rec); dirty = true; }
async function put(col, id, data){
  localSet(col, id, data); render();
  if(!S.db) return;
  try{ await S.db.doc(col + '/' + id).set(data); }catch(e){ onWriteError(e); }
}
async function patch(col, id, part){
  const cur = S[col].find(x => x.id === id); if(!cur) return;
  const next = Object.assign({}, cur, part); delete next.id;
  localSet(col, id, next); render();
  if(!S.db) return;
  try{ await S.db.doc(col + '/' + id).update(part); }catch(e){ onWriteError(e); }
}
async function del(col, id){
  S[col] = S[col].filter(x => x.id !== id); dirty = true; render();
  if(!S.db) return;
  try{ await S.db.doc(col + '/' + id).delete(); }catch(e){ onWriteError(e); }
}
const clean = o => { const r = {}; Object.keys(o).forEach(k => { if(k !== 'id') r[k] = o[k]; }); return r; };

/* ---------------- charts ---------------- */
let gid = 0;
function niceMax(v){ if(v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
function spark(vals, color, w, h){
  w = w || 110; h = h || 38;
  if(!vals.length) return '';
  const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rg = (mx - mn) || 1;
  const pts = vals.map((v, i) => [vals.length < 2 ? w / 2 : i * (w - 4) / (vals.length - 1) + 2, h - 4 - (v - mn) / rg * (h - 10)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const id = 'sg' + (++gid);
  const last = pts[pts.length - 1];
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".35"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
    '<path d="' + d + ' L ' + last[0].toFixed(1) + ' ' + h + ' L ' + pts[0][0].toFixed(1) + ' ' + h + ' Z" fill="url(#' + id + ')"/>' +
    '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
    '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.4" fill="' + color + '"/></svg>';
}
function inlineSpark(vals, color){
  if(vals.length < 2) return '<span class="faint">—</span>';
  const w = 84, h = 26, mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rg = (mx - mn) || 1;
  const d = vals.map((v, i) => (i ? 'L' : 'M') + (i * (w - 4) / (vals.length - 1) + 2).toFixed(1) + ' ' + (h - 3 - (v - mn) / rg * (h - 6)).toFixed(1)).join(' ');
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function miniBars(vals, color, hi){
  const w = 110, h = 38, n = vals.length, mx = Math.max.apply(null, vals.concat([1])), bw = w / n;
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' + vals.map((v, i) => {
    const bh = Math.max(3, v / mx * (h - 4));
    return '<rect x="' + (i * bw + bw * .18).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="' + (bw * .64).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2.5" fill="' + color + '" opacity="' + (i === hi ? 1 : .3) + '"/>';
  }).join('') + '</svg>';
}
/* area / line chart: pts [{l, v, tip}] */
function area(pts, o){
  o = o || {};
  const W = 760, H = o.h || 250, L = o.left || 48, R = 14, T = 16, B = 30;
  if(!pts.length) return '<div class="empty"><div class="e-ico">' + ic('trend') + '</div>Δεν υπάρχουν ακόμη δεδομένα</div>';
  const color = o.color || 'var(--mint)';
  const vals = pts.map(p => p.v).concat(o.target != null ? [o.target] : []);
  let mn, mx;
  if(o.zero){ mn = 0; mx = niceMax(Math.max.apply(null, vals) * 1.08); }
  else { mn = Math.min.apply(null, vals); mx = Math.max.apply(null, vals); const pad = Math.max((mx - mn) * .2, Math.abs(mx) * .01, .5); mn -= pad; mx += pad; }
  const x = i => L + (pts.length < 2 ? (W - L - R) / 2 : i * (W - L - R) / (pts.length - 1));
  const y = v => T + (H - T - B) * (1 - (v - mn) / ((mx - mn) || 1));
  const id = 'ag' + (++gid);
  let d = '';
  pts.forEach((p, i) => {
    if(!i){ d = 'M' + x(0).toFixed(1) + ' ' + y(p.v).toFixed(1); return; }
    if(o.smooth){ const x0 = x(i - 1), y0 = y(pts[i - 1].v), x1 = x(i), y1 = y(p.v), cx = (x0 + x1) / 2; d += ' C' + cx.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + y1.toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1); }
    else d += ' L' + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1);
  });
  let g = '';
  const ticks = o.zero ? 5 : 4;
  for(let i = 0; i <= ticks; i++){
    const v = mn + (mx - mn) * i / ticks, yy = y(v);
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="rgba(214,240,255,.06)" ' + (i ? 'stroke-dasharray="2 4"' : '') + '/>' +
      '<text x="' + (L - 10) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#66747C">' + esc(o.fmtY ? o.fmtY(v) : N1.format(v)) + '</text>';
  }
  const step = Math.max(1, Math.ceil(pts.length / (o.maxLabels || 8)));
  let xl = '';
  pts.forEach((p, i) => { if(i % step === 0 || i === pts.length - 1) xl += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10.5" fill="#66747C">' + esc(p.l) + '</text>'; });
  let tg = '';
  if(o.target != null){
    const yy = y(o.target);
    tg = '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="var(--amber)" stroke-width="1.3" stroke-dasharray="6 5" opacity=".85"/>' +
      '<rect x="' + (W - R - 92) + '" y="' + (yy - 21).toFixed(1) + '" width="92" height="17" rx="5" fill="var(--amber-dim)"/>' +
      '<text x="' + (W - R - 46) + '" y="' + (yy - 9).toFixed(1) + '" text-anchor="middle" font-size="10.5" fill="var(--amber)">στόχος ' + esc(N1.format(o.target)) + '</text>';
  }
  const hits = pts.map((p, i) => {
    const x0 = i === 0 ? L : (x(i - 1) + x(i)) / 2, x1 = i === pts.length - 1 ? W - R : (x(i) + x(i + 1)) / 2;
    return '<rect x="' + x0.toFixed(1) + '" y="' + T + '" width="' + Math.max(1, x1 - x0).toFixed(1) + '" height="' + (H - T - B) + '" fill="transparent" data-tip="' + esc(p.tip || (p.l + '|' + p.v)) + '" data-hx="' + x(i).toFixed(1) + '" data-hy="' + y(p.v).toFixed(1) + '"/>';
  }).join('');
  const lx = x(pts.length - 1), ly = y(pts[pts.length - 1].v);
  const dots = o.dots ? pts.map((p, i) => '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="2.6" fill="var(--panel)" stroke="' + color + '" stroke-width="1.6"/>').join('') : '';
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label || 'Γράφημα') + '"><defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".28"/><stop offset=".7" stop-color="' + color + '" stop-opacity=".04"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient>' +
    '<filter id="' + id + 'f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs>' + g +
    '<path d="' + d + ' L ' + lx.toFixed(1) + ' ' + (H - B) + ' L ' + x(0).toFixed(1) + ' ' + (H - B) + ' Z" fill="url(#' + id + ')"/>' +
    '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="5" opacity=".35" filter="url(#' + id + 'f)"/>' +
    '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>' +
    tg + dots +
    '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="8" fill="' + color + '" opacity=".18"/><circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="4" fill="' + color + '" stroke="var(--panel)" stroke-width="2"/>' +
    xl + '<g class="hits">' + hits + '</g></svg>';
}
function bars(pts, o){
  o = o || {};
  const W = 760, H = o.h || 250, L = 52, R = 10, T = 18, B = 30;
  const mx = niceMax(Math.max.apply(null, pts.map(p => p.v).concat([1])) * 1.1);
  const bw = (W - L - R) / pts.length;
  let g = '';
  for(let i = 0; i <= 4; i++){ const v = mx * i / 4, yy = T + (H - T - B) * (1 - i / 4);
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="rgba(214,240,255,.06)" ' + (i ? 'stroke-dasharray="2 4"' : '') + '/><text x="' + (L - 10) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#66747C">' + esc(o.fmtY ? o.fmtY(v) : v) + '</text>'; }
  const id = 'bg' + (++gid), col = o.color || '#5CF0B0';
  const b = pts.map((p, i) => {
    const h = (H - T - B) * p.v / mx, x = L + i * bw + bw * .2, w = bw * .6, y = H - B - h, last = i === pts.length - 1;
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(h, 2).toFixed(1) + '" rx="5" fill="' + (last ? 'url(#' + id + ')' : col) + '"' + (last ? '' : ' fill-opacity=".24"') + '/>' +
      (last ? '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(h, 2).toFixed(1) + '" rx="5" fill="none" stroke="' + col + '" stroke-opacity=".6"/>' : '') +
      '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10.5" fill="' + (last ? '#E9EFF2' : '#66747C') + '">' + esc(p.l) + '</text>' +
      '<rect x="' + (L + i * bw).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + (H - T - B) + '" fill="transparent" data-tip="' + esc(p.tip || (p.l + '|' + p.v)) + '"/>';
  }).join('');
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label || 'Γράφημα') + '"><defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + col + '"/><stop offset="1" stop-color="' + col + '" stop-opacity=".5"/></linearGradient></defs>' + g + b + '</svg>';
}
function donut(parts, size, center){
  size = size || 120; parts = parts.filter(p => (Number(p.v) || 0) > 0); const r = size / 2 - 9, c = 2 * Math.PI * r, tot = sum(parts, p => p.v) || 1;
  let off = 0;
  const segs = parts.map(p => { const len = p.v / tot * c; const s = '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + p.color + '" stroke-width="10" stroke-dasharray="' + Math.max(0, len - 2).toFixed(2) + ' ' + c.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" stroke-linecap="round" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"><title>' + esc(p.l) + '</title></circle>'; off += len; return s; }).join('');
  return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px;flex:none"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="10"/>' + segs + '</svg>' +
    (center ? '<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">' + center + '</div>' : '') + '</div>';
}
function ring(pct, color, size, center){
  size = size || 132; const r = size / 2 - 10, c = 2 * Math.PI * r, len = Math.max(0, Math.min(1, pct)) * c;
  const id = 'rg' + (++gid);
  return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px;flex:none"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="' + color + '"/><stop offset="1" stop-color="var(--sky)"/></linearGradient></defs>' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="9"/>' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="url(#' + id + ')" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + len.toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')" style="filter:drop-shadow(0 0 6px ' + color + ')"/></svg>' +
    '<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">' + (center || '') + '</div></div>';
}
function pbar(pct, color){ return '<div class="bar"><i style="width:' + (Math.max(0, Math.min(1, pct)) * 100).toFixed(1) + '%;background:' + color + ';box-shadow:0 0 10px ' + color + '"></i></div>'; }

/* ---------------- expenses & reports ---------------- */
const EXP_CATS = ['Ενοίκιο','Κοινόχρηστα','Ρεύμα','Νερό','Τηλέφωνο & internet','Λογιστής','ΕΦΚΑ / εισφορές','Λογισμικό & συνδρομές','Μάρκετινγκ','Εξοπλισμός','Αναλώσιμα','Εκπαίδευση','Ασφάλιση','Μετακινήσεις','Άλλο'];
const EXPAL = ['#A394FF','#6FCBFF','#FFC46B','#7FE3D0','#5CF0B0','#FF7A93','#FF9F6B','#8FA3FF','#E39BFF','#C9D46B','#6BB8FF','#FFD36B','#B09AFF','#7FD3A0','#8A9791'];
const EXP_METHODS = ['Κάρτα','Τραπεζική κατάθεση','Πάγια εντολή','Μετρητά'];
function expCol(cat){ const i = EXP_CATS.indexOf(cat); return EXPAL[i < 0 ? EXPAL.length - 1 : i]; }
function expensesBy(months){ const m = {}; S.expenses.forEach(e => { const k = String(e.date).slice(0,7); m[k] = (m[k] || 0) + (Number(e.amount) || 0); }); return months.map(x => Object.assign({}, x, {v:m[x.key] || 0})); }
function payIn(from, to){ return S.payments.filter(p => p.date >= from && p.date <= to); }
function expIn(from, to){ return S.expenses.filter(e => e.date >= from && e.date <= to); }
function kfmt(v){ const a = Math.abs(v); return (v < 0 ? '−' : '') + (a >= 1000 ? N1.format(a / 1000) + 'k' : Math.round(a)); }
/* income vs expenses bars + profit line */
function pnl(rows, o){
  o = o || {};
  const W = 760, H = o.h || 260, L = 52, R = 12, T = 18, B = 30;
  if(!rows.length) return '';
  const vals = []; rows.forEach(r => vals.push(r.inc, r.exp, r.inc - r.exp));
  const hi = Math.max.apply(null, vals.concat([1])), lo = Math.min.apply(null, vals.concat([0]));
  const stp = niceMax((hi - lo) / 4 || 1);
  const mx = Math.ceil(hi * 1.04 / stp) * stp, mn = lo < 0 ? -Math.ceil(-lo * 1.1 / stp) * stp : 0;
  const nT = Math.round((mx - mn) / stp);
  const y = v => T + (H - T - B) * (1 - (v - mn) / ((mx - mn) || 1));
  const bw = (W - L - R) / rows.length;
  let g = '';
  for(let i = 0; i <= nT; i++){ const v = mn + stp * i, yy = y(v);
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="rgba(214,240,255,.06)" stroke-dasharray="2 4"/><text x="' + (L - 10) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#66747C">' + esc(kfmt(v)) + '</text>'; }
  g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" stroke="rgba(214,240,255,.18)"/>';
  let bars_ = '', pts = [], hits = '', xl = '';
  const step = Math.max(1, Math.ceil(rows.length / 12));
  rows.forEach((r, i) => {
    const x0 = L + i * bw, w = Math.min(bw * .3, 26), cx = x0 + bw / 2;
    const bar = (v, x, fill, op) => { const y1 = y(Math.max(v, 0)), y2 = y(Math.min(v, 0)); return '<rect x="' + x.toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(1.5, y2 - y1).toFixed(1) + '" rx="3.5" fill="' + fill + '" fill-opacity="' + op + '"/>'; };
    bars_ += bar(r.inc, cx - w - 1.5, '#5CF0B0', .75) + bar(r.exp, cx + 1.5, '#FF7A93', .6);
    pts.push([cx, y(r.inc - r.exp), r.inc - r.exp]);
    if(i % step === 0 || i === rows.length - 1) xl += '<text x="' + cx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10.5" fill="#66747C">' + esc(r.l) + '</text>';
    hits += '<rect x="' + x0.toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + (H - T - B) + '" fill="transparent" data-tip="' + esc((r.tipL || r.l) + '|Έσοδα ' + EUR.format(r.inc) + ' · Έξοδα ' + EUR.format(r.exp) + ' · Κέρδος ' + EUR.format(r.inc - r.exp)) + '"/>';
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const line = pts.length > 1 ? '<path d="' + d + '" fill="none" stroke="#FFC46B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' : '';
  const dots = pts.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2" fill="' + (p[2] < 0 ? '#FF7A93' : '#FFC46B') + '" stroke="#0C1115" stroke-width="1.5"/>').join('');
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label || 'Έσοδα, έξοδα και κέρδος') + '">' + g + bars_ + line + dots + xl + '<g>' + hits + '</g></svg>';
}
function pnlLegend(){ return '<div class="legend"><span><i style="background:#5CF0B0"></i>Έσοδα</span><span><i style="background:#FF7A93"></i>Έξοδα</span><span><i style="background:#FFC46B;border-radius:50%"></i>Κέρδος</span></div>'; }
/* finance PIN lock (UI privacy lock, not a security boundary) */
async function pinHash(pin){
  try{ const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('nutriflow-pin:' + pin)); return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch(e){ let h = 0; for(const ch of 'nutriflow-pin:' + pin) h = (h * 131 + ch.charCodeAt(0)) >>> 0; return 'x' + h.toString(16); }
}
function finLocked(){ return !!cfg().financePin && !S.finUnlocked; }
