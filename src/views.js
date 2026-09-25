/* ================================================================
   NutriFlow — views
   ================================================================ */
const NAV = [
  {k:'today', l:'Σήμερα', i:'home', key:'1'},
  {k:'clients', l:'Πελάτες', i:'users', key:'2'},
  {k:'calendar', l:'Ημερολόγιο', i:'cal', key:'3'},
  {k:'finance', l:'Έσοδα', i:'euro', key:'4'},
  {k:'expenses', l:'Έξοδα', i:'receipt', key:'5'},
  {k:'reports', l:'Αναφορές', i:'chart', key:'6'},
  {k:'settings', l:'Ρυθμίσεις', i:'gear', key:'7'}
];
const FIN_VIEWS = ['finance','expenses','reports'];
function renderSide(){
  const t = today();
  const badge = {
    today: S.appointments.filter(a => a.date === t && a.status === 'scheduled').length,
    clients: S.clients.filter(c => c.status !== 'inactive').length
  };
  const lk = cfg().financePin ? '<span class="badge">' + ic(S.finUnlocked ? 'unlock' : 'lock', 'width="12" height="12" style="width:12px;height:12px"') + '</span>' : '';
  $('#navs').innerHTML = '<div class="nav-label">Γραφείο</div>' + NAV.slice(0, 3).map(n => navBtn(n, badge[n.k])).join('') +
    '<div class="nav-label">Οικονομικά</div>' + NAV.slice(3, 6).map(n => navBtn(n, null, lk)).join('') +
    '<div class="nav-label">Σύστημα</div>' + navBtn(NAV[6]);
  $('#practice').textContent = cfg().practiceName;
  const sy = $('#sync');
  sy.className = 'sync' + (S.db ? '' : ' off');
  sy.lastChild.textContent = S.loading ? 'φόρτωση…' : S.db ? 'συγχρονισμένο · ' + (S.clients.length + S.appointments.length + S.measurements.length + S.payments.length) + ' εγγραφές' : 'χωρίς σύνδεση βάσης';
}
function navBtn(n, b, extra){
  const cur = S.view === n.k || (n.k === 'clients' && S.view === 'client');
  return '<button class="nav' + (n.k === 'settings' ? ' nav-set' : '') + '" data-act="go" data-v="' + n.k + '" aria-current="' + cur + '">' + ic(n.i) + '<span>' + n.l + '</span>' + (b ? '<span class="badge">' + b + '</span>' : (extra || '')) + '</button>';
}
function renderTop(){
  let crumbs = '', act = '';
  const title = {today:'Σήμερα', clients:'Πελάτες', calendar:'Ημερολόγιο', finance:'Έσοδα', expenses:'Έξοδα', reports:'Αναφορές & κερδοφορία', settings:'Ρυθμίσεις'};
  if(S.view === 'client'){
    const c = client(S.cid);
    crumbs = '<button data-act="go" data-v="clients">Πελάτες</button>' + ic('chevR', 'width="13" height="13"') + '<b>' + esc(c ? c.name : '—') + '</b>';
  } else crumbs = '<b>' + title[S.view] + '</b>';
  const pri = (lbl, a, extra) => '<button class="btn pri" data-act="' + a + '" ' + (extra || '') + '>' + ic('plus') + '<span>' + lbl + '</span></button>';
  const sec = (lbl, a, i) => '<button class="btn hide-sm" data-act="' + a + '">' + ic(i || 'plus') + '<span>' + lbl + '</span></button>';
  if(S.view === 'today') act = sec('Ραντεβού', 'new-appt', 'cal') + pri('Νέος πελάτης', 'new-client');
  else if(S.view === 'clients') act = pri('Νέος πελάτης', 'new-client');
  else if(S.view === 'calendar') act = pri('Ραντεβού', 'new-appt');
  else if(S.view === 'finance' && !finLocked()) act = sec('Πακέτο', 'new-pkg', 'box') + pri('Πληρωμή', 'new-pay');
  else if(S.view === 'expenses' && !finLocked()) act = sec('Πάγια μήνα', 'exp-recurring', 'receipt') + pri('Νέο έξοδο', 'new-exp');
  else if(S.view === 'reports' && !finLocked() && S.dl) act = '<button class="btn" data-act="rep-csv">' + ic('down') + '<span>Εξαγωγή για λογιστή</span></button>';
  if(FIN_VIEWS.indexOf(S.view) >= 0 && cfg().financePin && S.finUnlocked) act = '<button class="btn ghost hide-sm" data-act="lock">' + ic('lock') + '<span>Κλείδωμα</span></button>' + act;
  $('#crumbs').innerHTML = crumbs;
  $('#topact').innerHTML = (S.canWrite || S.view === 'reports' ? act : '') + '<button class="btn ghost icon only-sm" data-act="go" data-v="settings" aria-label="Ρυθμίσεις">' + ic('gear') + '</button>';
}

/* ---------------- Σήμερα ---------------- */
function vToday(){
  const t = today(), now = nowMin(), cur = P(t);
  const list = S.appointments.filter(a => a.date === t && a.status !== 'cancelled').sort((a, b) => a.time < b.time ? -1 : 1);
  const upcoming = list.filter(a => a.status === 'scheduled' && tmin(a.time) + (a.duration || 45) > now);
  const nxt = upcoming[0];
  const months = revenueBy(monthsBack(12));
  const rev = months[11].v, prev = months[10].v;
  const dRev = prev ? Math.round((rev - prev) / prev * 100) : null;
  const active = S.clients.filter(c => c.status !== 'inactive');
  const mk = t.slice(0, 7);
  const newThis = active.filter(c => String(c.startDate).slice(0, 7) === mk).length;
  const newPer = monthsBack(6).map(m => S.clients.filter(c => String(c.startDate).slice(0, 7) === m.key).length);
  const ws = monday(t), we = addD(ws, 7);
  const wk = S.appointments.filter(a => a.date >= ws && a.date < we && a.status !== 'cancelled');
  const perDay = [0, 1, 2, 3, 4, 5].map(i => wk.filter(a => a.date === addD(ws, i)).length);
  const debtors = active.map(c => balance(c.id)).filter(b => b > 0);
  const owed = sum(debtors);
  const expMonths = expensesBy(monthsBack(12)), expM = expMonths[11].v;
  const hr = new Date().getHours();
  const hello = hr < 13 ? 'Καλημέρα' : 'Καλησπέρα';
  const name = S.me && S.me.name ? first(S.me.name) : '';
  let summary = list.length ? 'Έχεις <b>' + list.length + ' ραντεβού</b> σήμερα' + (nxt ? ' — το επόμενο στις <b>' + esc(nxt.time) + '</b> με ' + esc((client(nxt.clientId) || {}).name || '—') + '.' : ', όλα ολοκληρώθηκαν.') : 'Δεν υπάρχουν ραντεβού σήμερα.';
  const al = alerts();

  return '<div style="margin-bottom:22px"><div class="eyebrow">' + fmtL(t) + '</div>' +
      '<h1 style="font-size:30px;font-weight:750;letter-spacing:-.035em;margin-top:6px">' + hello + (name ? ', ' + esc(name) : '') + '</h1>' +
      '<p class="muted" style="margin-top:4px;font-size:14.5px">' + summary + '</p></div>' +

    '<div class="grid g-4" style="margin-bottom:16px">' +
      kpi('Ενεργοί πελάτες', active.length, '', newThis ? '<span class="delta up">+' + newThis + '</span> νέοι τον ' + MON[cur.getMonth()] : 'σε παρακολούθηση', spark(newPer, '#A394FF'), 'users', 'violet') +
      kpi('Ραντεβού εβδομάδας', wk.length, '', wk.filter(a => a.status === 'done').length + ' ολοκληρώθηκαν', miniBars(perDay, '#6FCBFF', (cur.getDay() + 6) % 7), 'cal', 'sky') +
      (finLocked() ? kpi('Έσοδα ' + MONG[cur.getMonth()], '••••', '', '<span class="row" style="gap:5px">' + ic('lock', 'width="12" height="12"') + 'κλειδωμένο</span>', '', 'euro', 'mint') + kpi('Κέρδος ' + MONG[cur.getMonth()], '••••', '', 'κλειδωμένο', '', 'trend', 'amber') :
      kpi('Έσοδα ' + MONG[cur.getMonth()], EUR.format(rev), '', dRev == null ? 'πρώτος μήνας' : '<span class="delta ' + (dRev >= 0 ? 'up' : 'down') + '">' + (dRev >= 0 ? '▲' : '▼') + ' ' + Math.abs(dRev) + '%</span> από ' + MON[(cur.getMonth() + 11) % 12], spark(months.slice(-6).map(m => m.v), '#5CF0B0'), 'euro', 'mint') +
      kpi('Κέρδος ' + MONG[cur.getMonth()], EUR.format(rev - expM), '', (rev ? Math.round((rev - expM) / rev * 100) + '% περιθώριο · ' : '') + EUR.format(owed) + ' προς είσπραξη', '', 'trend', rev - expM >= 0 ? 'amber' : 'rose')) +
    '</div>' +

    '<div class="grid g-12" style="margin-bottom:16px">' +
      '<section class="card s-7"><div class="card-h"><h3>Πρόγραμμα ημέρας</h3><span class="sub">' + list.filter(a => a.status === 'done').length + '/' + list.length + '</span><span class="spacer"></span><button class="btn ghost sm" data-act="go" data-v="calendar">Ημερολόγιο' + ic('chevR') + '</button></div>' +
        (list.length ? '<div class="tl">' + timeline(list, now, nxt) + '</div>' : empty('cal', 'Ελεύθερη μέρα', 'Δεν υπάρχουν ραντεβού σήμερα.')) +
      '</section>' +
      '<section class="card s-5"><div class="card-h"><h3>Χρειάζονται προσοχή</h3><span class="sub">' + al.length + '</span></div><div style="padding-top:8px">' +
        (al.length ? al.slice(0, 7).map(a => '<div class="al" data-act="open" data-id="' + a.c.id + '">' +
          '<span class="ico" style="background:var(--' + a.color + '-dim);color:var(--' + a.color + ')">' + ic(a.icon) + '</span>' +
          '<span style="min-width:0"><b>' + esc(a.k === 'debt' && finLocked() ? 'Εκκρεμεί οφειλή' : a.title) + '</b><span>' + esc(a.sub) + '</span></span><span class="spacer"></span>' +
          (a.k === 'gap' ? '<button class="btn sm" data-act="new-appt" data-cid="' + a.c.id + '">Κλείσε</button>' : a.k === 'debt' ? '<button class="btn sm" data-act="new-pay" data-cid="' + a.c.id + '">Είσπραξη</button>' : a.k === 'pkg' ? '<button class="btn sm" data-act="new-pkg" data-cid="' + a.c.id + '">Ανανέωση</button>' : ic('chevR', 'width="15" height="15" style="color:var(--text-3)"')) +
        '</div>').join('') : empty('check', 'Όλα υπό έλεγχο', 'Καμία εκκρεμότητα.')) +
      '</div></section>' +
    '</div>' +

    '<div class="grid g-12">' +
      '<section class="card s-8"><div class="card-h"><h3>Έσοδα & έξοδα 12 μηνών</h3>' + (finLocked() ? '' : '<span class="sub">κέρδος ' + EUR.format(sum(months, m => m.v) - sum(expMonths, m => m.v)) + '</span>') + '<span class="spacer"></span>' + (finLocked() ? '' : pnlLegend()) + '<button class="btn ghost sm" data-act="go" data-v="reports">Αναφορές' + ic('chevR') + '</button></div>' +
        '<div class="card-b">' + (finLocked() ? lockedMini() : pnl(months.map((m, i) => ({l:m.l, tipL:MONN[m.m] + ' ' + m.y, inc:m.v, exp:expMonths[i].v})), {h:240})) + '</div></section>' +
      '<section class="card s-4">' + resultsCard() + '</section>' +
    '</div>';
}
function kpi(label, val, unit, meta, sparkHtml, icon, color){
  return '<div class="card kpi' + (sparkHtml ? ' has-spark' : '') + '"><div class="k-top"><span class="chip ' + color + '" style="height:26px;width:26px;padding:0;justify-content:center">' + ic(icon, 'width="14" height="14"') + '</span><span class="muted" style="font-size:12.5px;font-weight:550">' + esc(label) + '</span></div>' +
    '<div class="k-val">' + esc(val) + (unit ? '<small>' + unit + '</small>' : '') + '</div><div class="k-meta">' + meta + '</div>' + (sparkHtml || '') + '</div>';
}
function timeline(list, now, nxt){
  let out = '', nowDone = false;
  list.forEach(a => {
    if(now != null && !nowDone && tmin(a.time) > now){ out += nowRow(now); nowDone = true; }
    const c = client(a.clientId) || {name:'—'};
    const tc = TYPE_C[a.type] || 'mint';
    const st = STATUS[a.status] || STATUS.scheduled;
    const past = now != null && a.status === 'scheduled' && tmin(a.time) + (a.duration || 45) <= now;
    const pk = a.packageId ? S.packages.find(p => p.id === a.packageId) : null;
    out += '<div class="tl-item' + (nxt && nxt.id === a.id ? ' next' : '') + '">' +
      '<span class="tl-time">' + esc(a.time) + '</span>' +
      '<span class="tl-dot" style="background:' + (a.status === 'done' ? 'var(--mint)' : a.status === 'noshow' ? 'var(--rose)' : COLORS[tc]) + ';' + (nxt && nxt.id === a.id ? 'box-shadow:0 0 0 1px var(--mint),0 0 12px var(--mint)' : '') + '"></span>' +
      '<div class="tl-body" data-act="appt" data-id="' + a.id + '">' + av(c.name, 'sm') +
        '<span style="min-width:0;flex:1"><b>' + esc(c.name) + '</b><span>' + esc(a.type) + ' · ' + (a.duration || 45) + '′' + (pk ? ' · ' + esc(shortPkg(pk)) + ' ' + (pkgUsed(pk) + (a.status === 'scheduled' ? 1 : 0)) + '/' + pk.sessions : a.fee ? ' · ' + EUR.format(a.fee) : '') + '</span></span>' +
      '</div>' +
      (a.status === 'scheduled' && S.canWrite ? '<div class="qa">' +
          '<button class="btn sm icon" data-act="status" data-id="' + a.id + '" data-s="done" title="Ολοκληρώθηκε" aria-label="Ολοκληρώθηκε" style="' + (past ? 'border-color:rgba(92,240,176,.5);color:var(--mint)' : '') + '">' + ic('check') + '</button>' +
          '<button class="btn sm icon" data-act="status" data-id="' + a.id + '" data-s="noshow" title="Δεν προσήλθε" aria-label="Δεν προσήλθε">' + ic('x') + '</button></div>'
        : chip(st.l, st.c, true)) +
    '</div>';
  });
  if(now != null && !nowDone) out += nowRow(now);
  return out;
}
function nowRow(now){ return '<div class="tl-now"><span>ΤΩΡΑ ' + tstr(now) + '</span><i></i><hr></div>'; }
function shortPkg(p){ return /online/i.test(p.name) ? 'Online' : 'Πακέτο'; }
function resultsCard(){
  const loss = S.clients.filter(c => c.status !== 'inactive').map(c => ({c, p:progress(c)})).filter(x => x.p);
  const lost = sum(loss.filter(x => x.p.d < 0 && (x.c.goal === 'Απώλεια βάρους' || x.c.goal === 'Παθολογική διατροφή')), x => -x.p.d);
  const top = loss.filter(x => x.p.pct != null && x.c.goal !== 'Εγκυμοσύνη').sort((a, b) => b.p.pct - a.p.pct).slice(0, 5);
  return '<div class="card-h"><h3>Αποτελέσματα πελατών</h3></div><div class="card-b">' +
    '<div class="row" style="align-items:flex-end;gap:8px"><span style="font-size:40px;font-weight:750;letter-spacing:-.04em;line-height:1;background:linear-gradient(135deg,var(--mint),var(--sky));-webkit-background-clip:text;background-clip:text;color:transparent">−' + N0.format(lost) + '</span><span class="muted" style="padding-bottom:5px">kg συνολικά</span></div>' +
    '<p class="faint" style="font-size:12px;margin-top:4px">απώλεια βάρους στους ενεργούς πελάτες από την έναρξη</p>' +
    '<div class="col" style="gap:12px;margin-top:18px">' + top.map(x => '<div class="row" data-act="open" data-id="' + x.c.id + '" style="cursor:pointer">' + av(x.c.name, 'sm') +
      '<div style="flex:1;min-width:0"><div class="row" style="gap:6px;font-size:12.5px"><b style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(x.c.name) + '</b><span class="spacer"></span><span class="mono faint" style="font-size:11px">' + Math.round(x.p.pct * 100) + '%</span></div>' +
      '<div style="margin-top:6px">' + pbar(x.p.pct, COLORS[GOAL_C[x.c.goal]] || 'var(--mint)') + '</div></div></div>').join('') + '</div></div>';
}
function empty(icon, title, sub){ return '<div class="empty"><div class="e-ico">' + ic(icon) + '</div><b>' + esc(title) + '</b>' + esc(sub || '') + '</div>'; }

/* ---------------- Πελάτες ---------------- */
function clientRows(){
  const q = S.q.trim().toLowerCase();
  const t = today();
  let list = S.clients.slice();
  const F = {
    all: () => true,
    active: c => c.status !== 'inactive',
    debt: c => balance(c.id) > 0,
    nonext: c => c.status !== 'inactive' && !nextA(c.id),
    inactive: c => c.status === 'inactive'
  };
  const counts = {}; Object.keys(F).forEach(k => counts[k] = list.filter(F[k]).length);
  list = list.filter(F[S.filter] || F.all);
  if(q) list = list.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) || (c.email || '').toLowerCase().includes(q) || (c.goal || '').toLowerCase().includes(q) || (c.tags || []).join(' ').toLowerCase().includes(q));
  const S_ = {
    name: (a, b) => a.name.localeCompare(b.name, 'el'),
    progress: (a, b) => ((progress(b) || {}).pct || 0) - ((progress(a) || {}).pct || 0),
    recent: (a, b) => String(lastVisit(b.id)).localeCompare(String(lastVisit(a.id))),
    balance: (a, b) => balance(b.id) - balance(a.id)
  };
  list.sort(S_[S.sort] || S_.name);
  return {list, counts};
}
function vClients(){
  const {list, counts} = clientRows();
  const fl = [['active','Ενεργοί'],['all','Όλοι'],['debt','Με οφειλή'],['nonext','Χωρίς ραντεβού'],['inactive','Ανενεργοί']];
  return '<div class="row wrap" style="margin-bottom:16px;gap:12px">' +
      '<div class="filters">' + fl.map(f => '<button class="fchip" data-act="filter" data-f="' + f[0] + '" aria-pressed="' + (S.filter === f[0]) + '">' + f[1] + '<span class="n">' + counts[f[0]] + '</span></button>').join('') + '</div>' +
      '<span class="spacer"></span>' +
      '<label class="search">' + ic('search') + '<input id="cq" type="text" placeholder="Όνομα, τηλέφωνο, στόχος…" value="' + esc(S.q) + '" autocomplete="off" aria-label="Αναζήτηση πελατών"></label>' +
      '<select class="in" id="csort" style="width:auto;height:34px" aria-label="Ταξινόμηση">' + [['name','Όνομα'],['recent','Τελευταία επίσκεψη'],['progress','Πρόοδος'],['balance','Υπόλοιπο']].map(o => '<option value="' + o[0] + '"' + (S.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>' +
    '</div>' +
    '<section class="card"><div class="tw"><table><thead><tr>' +
      '<th>Πελάτης</th><th>Στόχος</th><th class="r">Βάρος</th><th class="hide-sm">Τάση</th><th class="hide-sm" style="min-width:120px">Πρόοδος</th><th class="hide-sm">Πακέτο</th><th>Επόμενο</th><th class="r">Υπόλοιπο</th>' +
    '</tr></thead><tbody>' +
    (list.length ? list.map(c => {
      const lm = lastM(c.id), pr = progress(c), na = nextA(c.id), b = balance(c.id), ap = activePkg(c.id);
      const ws = meas(c.id).slice(-8).map(m => m.weight);
      const gc = GOAL_C[c.goal] || 'mint';
      const good = pr && ((c.goal === 'Αύξηση μυϊκής μάζας' || c.goal === 'Εγκυμοσύνη') ? pr.d >= 0 : pr.d <= 0);
      return '<tr class="click" data-act="open" data-id="' + c.id + '">' +
        '<td><div class="row">' + av(c.name) + '<span class="cname"><b>' + esc(c.name) + '</b><span>' + esc(c.phone || '') + (c.status === 'inactive' ? ' · ανενεργός' : '') + '</span></span></div></td>' +
        '<td>' + chip(c.goal || '—', gc) + '</td>' +
        '<td class="r num">' + (lm ? '<b style="font-weight:600">' + N1.format(lm.weight) + '</b> <span class="faint">kg</span>' : '<span class="faint">—</span>') +
          (pr && pr.d ? '<div class="mono" style="font-size:11px;color:' + (good ? 'var(--mint)' : 'var(--amber)') + '">' + (pr.d > 0 ? '+' : '') + N1.format(pr.d) + '</div>' : '') + '</td>' +
        '<td class="hide-sm">' + inlineSpark(ws, COLORS[gc]) + '</td>' +
        '<td class="hide-sm">' + (pr && pr.pct != null ? '<div class="row" style="gap:8px"><div style="flex:1">' + pbar(pr.pct, COLORS[gc]) + '</div><span class="mono faint" style="font-size:11px;width:32px;text-align:end">' + Math.round(pr.pct * 100) + '%</span></div>' : '<span class="faint">—</span>') + '</td>' +
        '<td class="hide-sm">' + (ap ? '<span class="mono" style="font-size:12px">' + pkgUsed(ap) + '<span class="faint">/' + ap.sessions + '</span></span>' : '<span class="faint">—</span>') + '</td>' +
        '<td>' + (na ? '<span style="font-weight:550">' + esc(rel(na.date)) + '</span> <span class="mono faint" style="font-size:11.5px">' + esc(na.time) + '</span>' : '<span class="faint">—</span>') + '</td>' +
        '<td class="r">' + (b > 0 ? chip(EUR.format(b), 'rose') : b < 0 ? chip('+' + EUR.format(-b), 'mint') : '<span class="faint" style="font-size:12px">εξοφλημένο</span>') + '</td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="8">' + empty('users', 'Δεν βρέθηκαν πελάτες', S.q ? 'Δοκιμάστε άλλη αναζήτηση.' : 'Προσθέστε τον πρώτο σας πελάτη.') + '</td></tr>') +
    '</tbody></table></div></section>';
}

/* ---------------- Καρτέλα πελάτη ---------------- */
function vClient(){
  const c = client(S.cid);
  if(!c) return empty('users', 'Ο πελάτης δεν βρέθηκε', 'Μπορεί να διαγράφηκε.');
  const lm = lastM(c.id), fm = firstM(c.id), w = lm ? lm.weight : null;
  const b = bmi(w, c.height), bc = bmiCat(b), fc = fatCat(lm && lm.bodyFat, c.sex), vc = visCat(lm && lm.visceral);
  const tk = targetK(c, w), ap = activePkg(c.id), bal = balance(c.id);
  const gc = GOAL_C[c.goal] || 'mint';
  const dW = lm && fm && lm.id !== fm.id ? lm.weight - fm.weight : null;
  const dF = lm && fm && lm.id !== fm.id && lm.bodyFat && fm.bodyFat ? lm.bodyFat - fm.bodyFat : null;
  const tabs = [['overview','Επισκόπηση'],['meas','Μετρήσεις', meas(c.id).length],['fin','Οικονομικά'],['info','Στοιχεία']];
  let body = '';
  if(S.ctab === 'overview') body = cOverview(c);
  else if(S.ctab === 'meas') body = cMeas(c);
  else if(S.ctab === 'fin') body = finLocked() ? lockScreen() : cFin(c);
  else body = cInfo(c);
  const wr = S.canWrite;

  return '<section class="card hero" style="--hero-tint:' + ({mint:'rgba(92,240,176,.1)', violet:'rgba(163,148,255,.12)', sky:'rgba(111,203,255,.1)', amber:'rgba(255,196,107,.1)', rose:'rgba(255,122,147,.1)'}[gc]) + '">' +
      '<div class="hero-top">' + av(c.name, 'lg') +
        '<div style="min-width:0;flex:1 1 260px"><div class="row wrap" style="gap:8px"><h1>' + esc(c.name) + '</h1>' + chip(c.status === 'inactive' ? 'Ανενεργός' : 'Ενεργός', c.status === 'inactive' ? '' : 'mint', true) + '</div>' +
          '<div class="row wrap" style="gap:6px;margin-top:8px">' + chip(c.goal || '—', gc) +
            chip((c.sex === 'Γ' ? 'Γυναίκα' : 'Άνδρας') + (age(c.birthdate) ? ' · ' + age(c.birthdate) + ' ετών' : '')) +
            (c.height ? chip(c.height + ' cm') : '') + chip('από ' + fmtS(c.startDate) + ' ' + String(c.startDate || '').slice(0, 4)) +
            (c.tags || []).map(tg => chip(tg, 'amber')).join('') + '</div>' +
          '<div class="row wrap" style="gap:4px;margin-top:10px">' +
            (c.phone ? '<button class="copy" data-act="copy" data-t="' + esc(c.phone) + '">' + ic('phone') + esc(c.phone) + '</button>' : '') +
            (c.email ? '<button class="copy" data-act="copy" data-t="' + esc(c.email) + '">' + ic('mail') + esc(c.email) + '</button>' : '') + '</div>' +
        '</div>' +
        (wr ? '<div class="row wrap" style="gap:8px">' +
          '<button class="btn" data-act="new-appt" data-cid="' + c.id + '">' + ic('cal') + 'Ραντεβού</button>' +
          '<button class="btn" data-act="new-pay" data-cid="' + c.id + '">' + ic('euro') + 'Πληρωμή</button>' +
          '<button class="btn pri" data-act="new-meas" data-cid="' + c.id + '">' + ic('scale') + 'Μέτρηση</button></div>' : '') +
      '</div>' +
      '<div class="stats">' +
        stat('Βάρος', w != null ? N1.format(w) : '—', 'kg', dW != null ? '<span class="delta ' + (goodDir(c, dW) ? 'up' : 'down') + '">' + (dW > 0 ? '+' : '') + N1.format(dW) + '</span> από την έναρξη' : (lm ? fmtS(lm.date) : 'καμία μέτρηση')) +
        stat('ΔΜΣ', b ? N1.format(b) : '—', '', b ? '<span style="color:' + (COLORS[bc[1]] || 'inherit') + '">' + bc[0] + '</span>' : '') +
        stat('Λίπος σώματος', lm && lm.bodyFat ? N1.format(lm.bodyFat) : '—', '%', dF != null ? '<span class="delta ' + (dF <= 0 ? 'up' : 'down') + '">' + (dF > 0 ? '+' : '') + N1.format(dF) + '</span> · ' + fc[0] : fc[0]) +
        stat('Σπλαχνικό λίπος', lm && lm.visceral ? lm.visceral : '—', '', '<span style="color:' + (COLORS[vc[1]] || 'inherit') + '">' + vc[0] + '</span>') +
        stat('Ημερήσιος στόχος', tk ? N0.format(tk) : '—', 'kcal', tk ? 'BMR ' + N0.format(bmr(c, w)) + ' kcal' : 'χρειάζεται ύψος & βάρος') +
        (ap ? stat('Πακέτο', pkgUsed(ap), '/' + ap.sessions, finLocked() ? ap.name : bal > 0 ? '<span style="color:var(--rose)">οφειλή ' + EUR.format(bal) + '</span>' : 'εξοφλημένο')
            : finLocked() ? stat('Υπόλοιπο', '••••', '', 'κλειδωμένο') : stat('Υπόλοιπο', EUR.format(Math.abs(bal)), '', bal > 0 ? '<span style="color:var(--rose)">οφειλή</span>' : bal < 0 ? 'προκαταβολή' : 'εξοφλημένο')) +
      '</div>' +
    '</section>' +
    '<div class="tabs" role="tablist">' + tabs.map(t => '<button class="tab" role="tab" data-act="ctab" data-t="' + t[0] + '" aria-selected="' + (S.ctab === t[0]) + '">' + t[1] + (t[2] != null ? ' <span class="mono faint" style="font-size:11px">' + t[2] + '</span>' : '') + '</button>').join('') + '</div>' +
    body;
}
function goodDir(c, d){ return (c.goal === 'Αύξηση μυϊκής μάζας' || c.goal === 'Εγκυμοσύνη') ? d >= 0 : d <= 0; }
function stat(l, v, u, m){ return '<div class="stat"><div class="eyebrow">' + esc(l) + '</div><div class="v">' + esc(String(v)) + (u ? '<small> ' + esc(u) + '</small>' : '') + '</div><div class="m">' + (m || '&nbsp;') + '</div></div>'; }

const METRICS = {weight:['Βάρος','kg','weight'], bodyFat:['Λίπος','%','bodyFat'], muscle:['Μυϊκή μάζα','kg','muscle'], waist:['Μέση','cm','waist'], visceral:['Σπλαχνικό','','visceral']};
function cOverview(c){
  const ms = meas(c.id);
  const mt = METRICS[S.metric] || METRICS.weight;
  const pts = ms.filter(m => m[mt[2]] != null && m[mt[2]] !== '').map(m => ({l:fmtS(m.date), v:Number(m[mt[2]]), tip:fmtD(m.date) + '|' + N1.format(m[mt[2]]) + ' ' + mt[1]}));
  const lm = lastM(c.id), w = lm ? lm.weight : null;
  const pr = progress(c), mac = macroT(c, w), na = nextA(c.id);
  const gc = GOAL_C[c.goal] || 'mint';
  return '<div class="grid g-12">' +
    '<div class="s-8 col" style="gap:16px">' +
      '<section class="card"><div class="card-h"><h3>Εξέλιξη</h3><span class="spacer"></span><div class="seg">' +
        Object.keys(METRICS).map(k => '<button data-act="metric" data-m="' + k + '" aria-pressed="' + (S.metric === k) + '">' + METRICS[k][0] + '</button>').join('') + '</div></div>' +
        '<div class="card-b">' + area(pts, {dots:true, color:COLORS[gc], target:S.metric === 'weight' && c.targetWeight ? Number(c.targetWeight) : null, label:'Εξέλιξη ' + mt[0], fmtY:v => N1.format(v), h:260}) + '</div></section>' +
      '<section class="card"><div class="card-h"><h3>Χρονολόγιο</h3></div><div class="card-b" style="padding-top:8px">' + feed(c).slice(0, 12).join('') + '</div></section>' +
    '</div>' +
    '<div class="s-4 col" style="gap:16px">' +
      (c.targetWeight && pr ? '<section class="card"><div class="card-b row" style="gap:18px">' +
        ring(pr.pct || 0, COLORS[gc], 118, '<div><div style="font-size:24px;font-weight:750;letter-spacing:-.03em">' + Math.round((pr.pct || 0) * 100) + '%</div><div class="eyebrow" style="font-size:9.5px">του στόχου</div></div>') +
        '<div class="col" style="gap:6px"><div class="eyebrow">Στόχος βάρους</div><div style="font-size:22px;font-weight:700;letter-spacing:-.03em">' + N1.format(c.targetWeight) + ' <small class="faint" style="font-size:13px">kg</small></div>' +
        '<div class="faint" style="font-size:12px">απομένουν ' + N1.format(Math.abs((w || 0) - c.targetWeight)) + ' kg<br>από ' + N1.format(pr.from) + ' kg στην έναρξη</div></div></div></section>' : '') +
      '<section class="card"><div class="card-h"><h3>Επόμενο ραντεβού</h3></div><div class="card-b">' +
        (na ? '<div class="row"><div style="text-align:center;padding:8px 12px;border-radius:10px;background:var(--sky-dim);border:1px solid rgba(111,203,255,.2)"><div class="eyebrow" style="color:var(--sky)">' + DAYS[P(na.date).getDay()] + '</div><div style="font-size:22px;font-weight:750;line-height:1.1">' + P(na.date).getDate() + '</div></div>' +
          '<div><b>' + esc(na.type) + '</b><div class="faint" style="font-size:12.5px">' + fmtD(na.date) + ' · <span class="mono">' + esc(na.time) + '</span> · ' + na.duration + '′</div></div></div>'
          : '<div class="row"><span class="faint" style="flex:1">Δεν έχει κλειστεί.</span>' + (S.canWrite ? '<button class="btn sm pri" data-act="new-appt" data-cid="' + c.id + '">' + ic('plus') + 'Κλείσε</button>' : '') + '</div>') +
      '</div></section>' +
      '<section class="card"><div class="card-h"><h3>Ενεργειακές ανάγκες</h3><span class="sub">Mifflin-St Jeor</span></div><div class="card-b">' +
        (mac ? '<div class="row" style="gap:16px">' + donut([{v:mac.p * 4, color:'var(--mint)', l:'Πρωτεΐνη'}, {v:mac.c * 4, color:'var(--sky)', l:'Υδατάνθρακες'}, {v:mac.f * 9, color:'var(--violet)', l:'Λίπος'}], 104,
            '<div><div style="font-size:18px;font-weight:750">' + N0.format(mac.k) + '</div><div class="eyebrow" style="font-size:9px">kcal</div></div>') +
          '<div class="col" style="gap:7px;flex:1;font-size:12.5px">' +
            macroLine('Πρωτεΐνη', mac.p, 'var(--mint)', mac.gpk + ' g/kg') + macroLine('Υδατάνθρακες', mac.c, 'var(--sky)') + macroLine('Λίπος', mac.f, 'var(--violet)', '28%') +
          '</div></div><div class="faint" style="font-size:11.5px;margin-top:12px">BMR ' + N0.format(bmr(c, w)) + ' · TDEE ' + N0.format(tdee(c, w)) + ' kcal (×' + c.activity + ')</div>'
          : '<span class="faint">Καταχωρίστε ύψος και μέτρηση βάρους.</span>') +
      '</div></section>' +
      (c.notes ? '<section class="card"><div class="card-h"><h3>Σημειώσεις</h3></div><div class="card-b muted" style="font-size:13px;white-space:pre-wrap">' + esc(c.notes) + '</div></section>' : '') +
    '</div></div>';
}
function macroLine(l, g, color, extra){ return '<div class="row" style="gap:8px"><i style="width:8px;height:8px;border-radius:3px;background:' + color + '"></i><span class="muted">' + l + '</span><span class="spacer"></span><b class="num">' + g + ' g</b>' + (extra ? '<span class="faint mono" style="font-size:10.5px;min-width:52px;text-align:end;white-space:nowrap">' + extra + '</span>' : '') + '</div>'; }
function feed(c){
  const ev = [];
  appts(c.id).forEach(a => ev.push({d:a.date + a.time, date:a.date, icon:'cal', color:a.status === 'noshow' ? 'rose' : a.status === 'cancelled' ? '' : TYPE_C[a.type] || 'mint', t:a.type, s:(STATUS[a.status] || {}).l + ' · ' + a.time, r:rel(a.date)}));
  meas(c.id).forEach(m => ev.push({d:m.date + '99', date:m.date, icon:'scale', color:'sky', t:'Μέτρηση · ' + N1.format(m.weight) + ' kg', s:[m.bodyFat ? 'λίπος ' + N1.format(m.bodyFat) + '%' : '', m.muscle ? 'μυς ' + N1.format(m.muscle) + ' kg' : '', m.waist ? 'μέση ' + m.waist + ' cm' : ''].filter(Boolean).join(' · '), r:rel(m.date)}));
  if(!finLocked()) pays(c.id).forEach(p => ev.push({d:p.date + '98', date:p.date, icon:'euro', color:'mint', t:'Πληρωμή ' + EUR2.format(p.amount), s:[p.method, p.note].filter(Boolean).join(' · '), r:rel(p.date)}));
  pkgs(c.id).forEach(p => ev.push({d:p.startDate + '97', date:p.startDate, icon:'box', color:'amber', t:p.name, s:EUR.format(p.price) + ' · ' + pkgUsed(p) + '/' + p.sessions + ' συνεδρίες', r:rel(p.startDate)}));
  const t = today();
  return ev.filter(e => e.date <= addD(t, 30)).sort((a, b) => a.d < b.d ? 1 : -1).map(e =>
    '<div class="feed-i"><span class="fi" style="background:var(--' + (e.color || 'panel-3') + (e.color ? '-dim' : '') + ');color:' + (COLORS[e.color] || 'var(--text-3)') + '">' + ic(e.icon) + '</span>' +
    '<div style="min-width:0"><b>' + esc(e.t) + '</b><div><span>' + esc(e.s) + '</span></div></div><span class="mono faint" style="font-size:11px;white-space:nowrap">' + esc(e.r) + '</span></div>');
}
function cMeas(c){
  const ms = meas(c.id).slice().reverse();
  return '<section class="card"><div class="card-h"><h3>Ιστορικό μετρήσεων</h3><span class="sub">Tanita / InBody</span><span class="spacer"></span>' +
    (S.canWrite ? '<button class="btn sm pri" data-act="new-meas" data-cid="' + c.id + '">' + ic('plus') + 'Νέα μέτρηση</button>' : '') + '</div>' +
    '<div class="tw" style="margin-top:12px"><table><thead><tr><th>Ημερομηνία</th><th class="r">Βάρος</th><th class="r">ΔΜΣ</th><th class="r">Λίπος %</th><th class="r">Μυϊκή</th><th class="r">Νερό %</th><th class="r">Σπλαχν.</th><th class="r">Μέση</th><th class="r">Ισχία</th><th class="r hide-sm">WHR</th><th></th></tr></thead><tbody>' +
    (ms.length ? ms.map((m, i) => {
      const pv = ms[i + 1], d = pv ? m.weight - pv.weight : null, b = bmi(m.weight, c.height);
      const whr = m.waist && m.hip ? m.waist / m.hip : null;
      return '<tr><td><b style="font-weight:600">' + fmtD(m.date) + '</b>' + (m.notes ? '<div class="faint" style="font-size:11.5px">' + esc(m.notes) + '</div>' : '') + '</td>' +
        '<td class="r num"><b style="font-weight:600">' + N1.format(m.weight) + '</b>' + (d != null ? ' <span class="mono" style="font-size:11px;color:' + (d === 0 ? 'var(--text-3)' : goodDir(c, d) ? 'var(--mint)' : 'var(--amber)') + '">' + (d > 0 ? '+' : '') + N1.format(d) + '</span>' : '') + '</td>' +
        '<td class="r num">' + (b ? N1.format(b) : '—') + '</td><td class="r num">' + (m.bodyFat ? N1.format(m.bodyFat) : '—') + '</td><td class="r num">' + (m.muscle ? N1.format(m.muscle) : '—') + '</td>' +
        '<td class="r num">' + (m.water ? N1.format(m.water) : '—') + '</td><td class="r num">' + (m.visceral || '—') + '</td><td class="r num">' + (m.waist || '—') + '</td><td class="r num">' + (m.hip || '—') + '</td>' +
        '<td class="r num hide-sm">' + (whr ? whr.toFixed(2) : '—') + '</td>' +
        '<td class="r">' + (S.canWrite ? '<button class="btn ghost sm icon" data-act="del" data-col="measurements" data-id="' + m.id + '" aria-label="Διαγραφή μέτρησης">' + ic('trash') + '</button>' : '') + '</td></tr>';
    }).join('') : '<tr><td colspan="11">' + empty('scale', 'Καμία μέτρηση', 'Καταχωρίστε την πρώτη μέτρηση σύστασης σώματος.') + '</td></tr>') +
    '</tbody></table></div></section>';
}
function cPlans(c){
  const ps = cplans(c.id);
  return '<div class="row" style="margin-bottom:14px"><span class="spacer"></span>' + (S.canWrite ? '<button class="btn pri sm" data-act="new-plan" data-cid="' + c.id + '">' + ic('plus') + 'Νέο πλάνο</button>' : '') + '</div>' +
    (ps.length ? '<div class="grid g-3">' + ps.map(p => planCard(p, false)).join('') + '</div>' : '<section class="card">' + empty('plan', 'Κανένα πλάνο', 'Δημιουργήστε το πρώτο διατροφικό πλάνο.') + '</section>');
}
function cFin(c){
  const ps = pkgs(c.id).slice().reverse(), py = pays(c.id), ch = charges(c.id), pd = paid(c.id), bal = ch - pd;
  const singles = appts(c.id).filter(a => a.status === 'done' && !a.packageId && a.fee);
  return '<div class="grid g-3" style="margin-bottom:16px">' +
      kpi('Χρεώσεις', EUR.format(ch), '', ps.length + ' πακέτα · ' + singles.length + ' μεμονωμένες', '', 'box', 'amber') +
      kpi('Πληρωμές', EUR.format(pd), '', py.length + ' κινήσεις', '', 'euro', 'mint') +
      kpi('Υπόλοιπο', EUR.format(Math.abs(bal)), '', bal > 0 ? '<span style="color:var(--rose)">οφειλή πελάτη</span>' : bal < 0 ? 'προκαταβολή' : 'εξοφλημένο', '', 'wallet', bal > 0 ? 'rose' : 'sky') +
    '</div><div class="grid g-12">' +
    '<section class="card s-5"><div class="card-h"><h3>Πακέτα</h3><span class="spacer"></span>' + (S.canWrite ? '<button class="btn sm" data-act="new-pkg" data-cid="' + c.id + '">' + ic('plus') + 'Πακέτο</button>' : '') + '</div><div class="card-b col" style="gap:12px">' +
      (ps.length ? ps.map(p => { const u = pkgUsed(p), done = u >= p.sessions; return '<div style="padding:12px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.015)"><div class="row"><b style="font-size:13px">' + esc(p.name) + '</b><span class="spacer"></span>' + (done ? chip('Ολοκληρώθηκε') : chip('Ενεργό', 'mint', true)) + '</div>' +
        '<div class="row faint" style="font-size:12px;margin:4px 0 9px"><span>από ' + fmtD(p.startDate) + '</span><span class="spacer"></span><span class="mono">' + EUR.format(p.price) + '</span></div>' +
        '<div class="row" style="gap:10px"><div style="flex:1">' + pbar(u / p.sessions, done ? 'var(--text-3)' : 'var(--mint)') + '</div><span class="mono" style="font-size:12px">' + u + '/' + p.sessions + '</span>' +
        (S.canWrite ? '<button class="btn ghost sm icon" data-act="del" data-col="packages" data-id="' + p.id + '" aria-label="Διαγραφή πακέτου">' + ic('trash') + '</button>' : '') + '</div></div>'; }).join('') : '<span class="faint">Χρεώνεται ανά συνεδρία (' + EUR.format(cfg().sessionPrice) + ').</span>') +
    '</div></section>' +
    '<section class="card s-7"><div class="card-h"><h3>Πληρωμές</h3><span class="spacer"></span>' + (S.canWrite ? '<button class="btn sm pri" data-act="new-pay" data-cid="' + c.id + '">' + ic('plus') + 'Πληρωμή</button>' : '') + '</div>' +
      '<div class="tw" style="margin-top:10px"><table><thead><tr><th>Ημερομηνία</th><th>Περιγραφή</th><th>Τρόπος</th><th class="r">Ποσό</th><th></th></tr></thead><tbody>' +
      (py.length ? py.map(p => '<tr><td class="mono" style="font-size:12.5px">' + fmtD(p.date) + '</td><td>' + esc(p.note || '—') + '</td><td><span class="row" style="gap:7px"><i style="width:7px;height:7px;border-radius:50%;background:' + (METHOD_C[p.method] || 'var(--text-3)') + '"></i>' + esc(p.method || '—') + '</span></td>' +
        '<td class="r num" style="font-weight:600;color:var(--mint)">' + EUR2.format(p.amount) + '</td><td class="r">' + (S.canWrite ? '<button class="btn ghost sm icon" data-act="del" data-col="payments" data-id="' + p.id + '" aria-label="Διαγραφή πληρωμής">' + ic('trash') + '</button>' : '') + '</td></tr>').join('')
        : '<tr><td colspan="5">' + empty('euro', 'Καμία πληρωμή', '') + '</td></tr>') +
      '</tbody></table></div></section></div>';
}
function cInfo(c){
  const kv = (k, v) => '<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="muted" style="width:170px;flex:none">' + esc(k) + '</span><span>' + (v ? esc(v) : '<span class="faint">—</span>') + '</span></div>';
  const actL = (ACT.find(a => String(a.v) === String(c.activity)) || {}).l;
  return '<div class="grid g-12"><section class="card s-7"><div class="card-h"><h3>Στοιχεία πελάτη</h3><span class="spacer"></span>' + (S.canWrite ? '<button class="btn sm" data-act="edit-client" data-id="' + c.id + '">' + ic('edit') + 'Επεξεργασία</button>' : '') + '</div><div class="card-b" style="padding-top:6px">' +
    kv('Ονοματεπώνυμο', c.name) + kv('Τηλέφωνο', c.phone) + kv('Email', c.email) + kv('Ημ. γέννησης', c.birthdate ? fmtD(c.birthdate) + ' (' + age(c.birthdate) + ' ετών)' : '') +
    kv('Φύλο', c.sex === 'Γ' ? 'Γυναίκα' : 'Άνδρας') + kv('Ύψος', c.height ? c.height + ' cm' : '') + kv('Βάρος-στόχος', c.targetWeight ? N1.format(c.targetWeight) + ' kg' : '') +
    kv('Στόχος', c.goal) + kv('Δραστηριότητα', actL) + kv('Έναρξη', fmtD(c.startDate)) + kv('Ετικέτες', (c.tags || []).join(', ')) +
    '</div></section><section class="card s-5"><div class="card-h"><h3>Ιστορικό & σημειώσεις</h3></div><div class="card-b" style="white-space:pre-wrap;font-size:13.5px;line-height:1.65">' + (c.notes ? esc(c.notes) : '<span class="faint">Καμία σημείωση.</span>') + '</div></section></div>';
}

/* ---------------- Ημερολόγιο ---------------- */
const H0 = 8, H1 = 21, HH = 64;
function vCalendar(){
  const ws = S.week, t = today();
  const days = []; for(let i = 0; i < 7; i++) days.push(addD(ws, i));
  const inWeek = S.appointments.filter(a => a.date >= ws && a.date < addD(ws, 7));
  const showSun = inWeek.some(a => a.date === days[6]);
  const vis = showSun ? days : days.slice(0, 6);
  const cols = '56px repeat(' + vis.length + ', minmax(0,1fr))';
  const booked = inWeek.filter(a => a.status !== 'cancelled');
  const mins = sum(booked, a => a.duration || 45);
  const d0 = P(ws), d1 = P(addD(ws, 6));
  const label = d0.getDate() + (d0.getMonth() !== d1.getMonth() ? ' ' + MON[d0.getMonth()] : '') + ' – ' + d1.getDate() + ' ' + MON[d1.getMonth()] + ' ' + d1.getFullYear();
  const now = nowMin();
  const hours = []; for(let h = H0; h < H1; h++) hours.push(h);

  const grid = '<div class="cal" style="grid-template-columns:' + cols + ';--hh:' + HH + 'px">' +
    '<div></div>' + vis.map(d => '<div class="cal-dh' + (d === t ? ' today' : '') + '"><div class="eyebrow">' + DAYS[P(d).getDay()] + '</div><b>' + P(d).getDate() + '</b> <span class="faint mono" style="font-size:11px">' + inWeek.filter(a => a.date === d && a.status !== 'cancelled').length + ' ραντ.</span></div>').join('') +
    '<div class="cal-hours" style="padding-top:0">' + hours.map(h => '<div>' + String(h).padStart(2, '0') + ':00</div>').join('') + '</div>' +
    vis.map(d => {
      const sat = P(d).getDay() === 6;
      const brk = sat ? '' : ' break';
      const bt = (14 - H0) * HH, bh = 3 * HH;
      const evs = inWeek.filter(a => a.date === d).sort((a, b) => a.time < b.time ? -1 : 1).map(a => {
        const c = client(a.clientId) || {name:'—'};
        const top = (tmin(a.time) - H0 * 60) / 60 * HH, h = Math.max(22, (a.duration || 45) / 60 * HH - 3);
        const tc = TYPE_C[a.type] || 'mint';
        return '<div class="ev ' + a.status + (h < 40 ? ' short' : '') + '" data-act="appt" data-id="' + a.id + '" title="' + esc(a.time + ' · ' + c.name + ' · ' + a.type) + '" style="top:' + top.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px;background:var(--' + tc + '-dim);border-color:color-mix(in srgb, ' + COLORS[tc] + ' 38%, transparent);color:' + COLORS[tc] + '">' +
          '<div style="min-width:0;width:100%"><div class="ev-l"><span class="t">' + esc(a.time) + (a.status === 'done' ? ' ✓' : a.status === 'noshow' ? ' ✕' : '') + '</span><b style="color:var(--text)">' + esc(c.name) + '</b></div>' + (h >= 40 ? '<span class="ty">' + esc(a.type) + '</span>' : '') + '</div></div>';
      }).join('');
      const nl = d === t && now >= H0 * 60 && now <= H1 * 60 ? '<div class="nowline" style="top:' + ((now - H0 * 60) / 60 * HH).toFixed(1) + 'px"></div>' : '';
      return '<div class="cal-col' + (d === t ? ' today' : '') + brk + '" data-act="slot" data-d="' + d + '" style="height:' + ((H1 - H0) * HH) + 'px;--bt:' + bt + 'px;--bh:' + bh + 'px">' + evs + nl + '</div>';
    }).join('') + '</div>';

  const dayList = S.appointments.filter(a => a.date === S.calDay && a.status !== 'cancelled').sort((a, b) => a.time < b.time ? -1 : 1);
  const mobile = '<div class="daystrip">' + vis.map(d => '<button data-act="calday" data-d="' + d + '" aria-pressed="' + (S.calDay === d) + '"><span>' + DAYS[P(d).getDay()] + '</span><b>' + P(d).getDate() + '</b></button>').join('') + '</div>' +
    '<div class="only-sm" style="margin-top:12px">' + (dayList.length ? '<section class="card"><div class="tl">' + timeline(dayList, S.calDay === t ? now : null, null) + '</div></section>' : '<section class="card">' + empty('cal', 'Κανένα ραντεβού', fmtL(S.calDay)) + '</section>') + '</div>';

  return '<div class="row wrap" style="margin-bottom:16px;gap:10px">' +
      '<div class="row" style="gap:6px"><button class="btn icon" data-act="week" data-n="-1" aria-label="Προηγούμενη εβδομάδα">' + ic('chevL') + '</button><button class="btn" data-act="week" data-n="0">Σήμερα</button><button class="btn icon" data-act="week" data-n="1" aria-label="Επόμενη εβδομάδα">' + ic('chevR') + '</button></div>' +
      '<h2 style="font-size:18px;font-weight:700;letter-spacing:-.02em">' + label + '</h2>' +
      '<span class="spacer"></span>' +
      '<div class="legend hide-sm">' + TYPES.map(tp => '<span><i style="background:' + COLORS[TYPE_C[tp]] + '"></i>' + tp + '</span>').join('') + '</div>' +
      chip(booked.length + ' ραντεβού · ' + N1.format(mins / 60) + ' ώρες', 'mint') +
    '</div>' +
    '<section class="card cal-wrap" style="padding:0 0 8px">' + grid + '</section>' + mobile +
    '<p class="faint hide-sm" style="font-size:12px;margin-top:10px">Κλικ σε κενό σημείο για νέο ραντεβού · διαγραμμισμένη ζώνη: μεσημεριανό διάλειμμα 14:00–17:00</p>';
}

/* ---------------- Πλάνα ---------------- */
function vPlans(){
  const tpl = S.ptab === 'tpl';
  const ps = S.plans.filter(p => tpl ? p.isTemplate : !p.isTemplate).sort((a, b) => a.date < b.date ? 1 : -1);
  return '<div class="row wrap" style="margin-bottom:16px;gap:10px"><div class="seg">' +
      '<button data-act="ptab" data-t="client" aria-pressed="' + !tpl + '">Πλάνα πελατών · ' + S.plans.filter(p => !p.isTemplate).length + '</button>' +
      '<button data-act="ptab" data-t="tpl" aria-pressed="' + tpl + '">Πρότυπα · ' + S.plans.filter(p => p.isTemplate).length + '</button></div>' +
      '<span class="spacer"></span><span class="faint" style="font-size:12.5px">' + FOODS.length + ' τρόφιμα στη βάση</span></div>' +
    (ps.length ? '<div class="grid g-3">' + ps.map(p => planCard(p, !tpl)).join('') + '</div>' :
      '<section class="card">' + empty('plan', tpl ? 'Κανένα πρότυπο' : 'Κανένα πλάνο', tpl ? 'Αποθηκεύστε ένα πλάνο ως πρότυπο για να το ξαναχρησιμοποιείτε.' : 'Δημιουργήστε το πρώτο διατροφικό πλάνο.') + '</section>');
}
function planCard(p, showClient){
  const t = planTot(p), c = client(p.clientId), dev = p.targetKcal ? t.k - p.targetKcal : null;
  const kp = t.p * 4, kc = t.c * 4, kf = t.f * 9, kt = kp + kc + kf || 1;
  return '<section class="card hover" data-act="edit-plan" data-id="' + p.id + '" style="cursor:pointer;display:flex;flex-direction:column">' +
    '<div class="card-h" style="align-items:flex-start"><div style="min-width:0;flex:1"><h3 style="font-size:15px">' + esc(p.title) + '</h3>' +
      '<div class="faint" style="font-size:12px;margin-top:2px">' + (showClient && c ? esc(c.name) + ' · ' : p.isTemplate ? 'Πρότυπο · ' : '') + fmtD(p.date) + '</div></div>' +
      (p.isTemplate ? chip('Πρότυπο', 'violet') : '') + '</div>' +
    '<div class="card-b row" style="gap:16px;padding-top:14px">' +
      donut([{v:kp, color:'var(--mint)', l:'Πρωτεΐνη'}, {v:kc, color:'var(--sky)', l:'Υδατάνθρακες'}, {v:kf, color:'var(--violet)', l:'Λίπος'}], 92,
        '<div><div style="font-size:16px;font-weight:750;letter-spacing:-.02em">' + N0.format(t.k) + '</div><div class="eyebrow" style="font-size:8.5px">kcal</div></div>') +
      '<div class="col" style="gap:5px;flex:1;font-size:12px">' +
        '<div class="row"><i style="width:7px;height:7px;border-radius:2px;background:var(--mint)"></i><span class="muted">Π</span><span class="spacer"></span><b class="num">' + t.p + ' g</b><span class="faint mono" style="width:34px;text-align:end;font-size:10.5px">' + Math.round(kp / kt * 100) + '%</span></div>' +
        '<div class="row"><i style="width:7px;height:7px;border-radius:2px;background:var(--sky)"></i><span class="muted">Υ</span><span class="spacer"></span><b class="num">' + t.c + ' g</b><span class="faint mono" style="width:34px;text-align:end;font-size:10.5px">' + Math.round(kc / kt * 100) + '%</span></div>' +
        '<div class="row"><i style="width:7px;height:7px;border-radius:2px;background:var(--violet)"></i><span class="muted">Λ</span><span class="spacer"></span><b class="num">' + t.f + ' g</b><span class="faint mono" style="width:34px;text-align:end;font-size:10.5px">' + Math.round(kf / kt * 100) + '%</span></div>' +
      '</div></div>' +
    '<div style="padding:0 18px 16px;margin-top:auto" class="row wrap">' + (dev != null ? chip('στόχος ' + N0.format(p.targetKcal) + ' · ' + (dev > 0 ? '+' : '') + dev, Math.abs(dev) <= 80 ? 'mint' : 'amber') : '') +
      '<span class="faint" style="font-size:12px">' + (p.meals || []).filter(m => (m.items || []).length).length + ' γεύματα · ' + sum(p.meals || [], m => (m.items || []).length) + ' τρόφιμα</span></div>' +
  '</section>';
}

/* ---------------- Οικονομικά ---------------- */
function vFinance(){
  const t = today(), cur = P(t);
  const months = revenueBy(monthsBack(S.finRange));
  const m12 = revenueBy(monthsBack(12));
  const rev = m12[11].v, prev = m12[10].v, dRev = prev ? Math.round((rev - prev) / prev * 100) : null;
  const ytd = sum(S.payments.filter(p => String(p.date).startsWith(String(cur.getFullYear()))), p => p.amount);
  const doneYTD = S.appointments.filter(a => a.status === 'done' && a.date.slice(0, 7) === t.slice(0, 7)).length;
  const debt = S.clients.map(c => ({c, b:balance(c.id)})).filter(x => x.b > 0).sort((a, b) => b.b - a.b);
  const owed = sum(debt, x => x.b);
  const act = S.packages.filter(p => pkgUsed(p) < p.sessions && (client(p.clientId) || {}).status !== 'inactive').sort((a, b) => (pkgUsed(b) / b.sessions) - (pkgUsed(a) / a.sessions));
  const last90 = S.payments.filter(p => ddiff(p.date, t) <= 90);
  const byM = {}; last90.forEach(p => byM[p.method || '—'] = (byM[p.method || '—'] || 0) + (+p.amount || 0));
  const mTot = sum(Object.values(byM)) || 1;
  const q = S.paySearch.trim().toLowerCase();
  const rows = S.payments.slice().sort((a, b) => a.date < b.date ? 1 : -1).filter(p => !q || ((client(p.clientId) || {}).name || '').toLowerCase().includes(q) || (p.note || '').toLowerCase().includes(q) || (p.method || '').toLowerCase().includes(q)).slice(0, 40);

  return '<div class="grid g-4" style="margin-bottom:16px">' +
      kpi('Έσοδα ' + MONG[cur.getMonth()], EUR.format(rev), '', dRev == null ? '' : '<span class="delta ' + (dRev >= 0 ? 'up' : 'down') + '">' + (dRev >= 0 ? '▲' : '▼') + ' ' + Math.abs(dRev) + '%</span> από ' + MON[(cur.getMonth() + 11) % 12], spark(m12.slice(-6).map(m => m.v), '#5CF0B0'), 'euro', 'mint') +
      kpi('Έσοδα ' + cur.getFullYear(), EUR.format(ytd), '', 'από 1 Ιανουαρίου', '', 'trend', 'sky') +
      kpi('Συνεδρίες μήνα', doneYTD, '', doneYTD ? '≈ ' + EUR.format(rev / doneYTD) + ' ανά συνεδρία' : '—', '', 'cal', 'violet') +
      kpi('Προς είσπραξη', EUR.format(owed), '', debt.length + ' πελάτες', '', 'wallet', 'rose') +
    '</div>' +
    '<div class="grid g-12" style="margin-bottom:16px">' +
      '<section class="card s-8"><div class="card-h"><h3>Εισπράξεις ανά μήνα</h3><span class="spacer"></span><div class="seg">' + [6, 12].map(n => '<button data-act="fin" data-n="' + n + '" aria-pressed="' + (S.finRange === n) + '">' + n + ' μήνες</button>').join('') + '</div></div>' +
        '<div class="card-b">' + bars(months.map(m => ({l:m.l, v:m.v, tip:MONN[m.m] + ' ' + m.y + '|' + EUR.format(m.v)})), {fmtY:v => v >= 1000 ? N1.format(v / 1000) + 'k' : Math.round(v), label:'Εισπράξεις ανά μήνα', h:250}) + '</div></section>' +
      '<section class="card s-4"><div class="card-h"><h3>Τρόποι πληρωμής</h3><span class="sub">90 ημέρες</span></div><div class="card-b">' +
        '<div class="row" style="justify-content:center;margin:4px 0 16px">' + donut(Object.keys(byM).map(k => ({v:byM[k], color:METHOD_C[k] || 'var(--text-3)', l:k})), 138, '<div><div style="font-size:19px;font-weight:750;letter-spacing:-.02em">' + EUR.format(mTot) + '</div><div class="eyebrow" style="font-size:9px">σύνολο</div></div>') + '</div>' +
        '<div class="col" style="gap:9px">' + Object.keys(byM).sort((a, b) => byM[b] - byM[a]).map(k => '<div class="row" style="font-size:12.5px"><i style="width:8px;height:8px;border-radius:3px;background:' + (METHOD_C[k] || 'var(--text-3)') + '"></i><span class="muted">' + esc(k) + '</span><span class="spacer"></span><b class="num">' + EUR.format(byM[k]) + '</b><span class="faint mono" style="width:40px;text-align:end;font-size:11px">' + Math.round(byM[k] / mTot * 100) + '%</span></div>').join('') + '</div>' +
      '</div></section>' +
    '</div>' +
    '<div class="grid g-12" style="margin-bottom:16px">' +
      '<section class="card s-6"><div class="card-h"><h3>Ενεργά πακέτα</h3><span class="sub">' + act.length + '</span></div><div class="card-b col" style="gap:13px;max-height:390px;overflow-y:auto">' +
        (act.length ? act.map(p => { const c = client(p.clientId) || {name:'—'}, u = pkgUsed(p), left = p.sessions - u; return '<div class="row" data-act="open" data-id="' + p.clientId + '" style="cursor:pointer">' + av(c.name, 'sm') +
          '<div style="flex:1;min-width:0"><div class="row" style="font-size:12.5px;gap:6px"><b style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(c.name) + '</b><span class="faint" style="white-space:nowrap">' + esc(shortPkg(p)) + ' ' + p.sessions + '</span><span class="spacer"></span><span class="mono" style="font-size:11.5px;color:' + (left <= 1 ? 'var(--amber)' : 'var(--text-2)') + '">' + u + '/' + p.sessions + '</span></div>' +
          '<div style="margin-top:6px">' + pbar(u / p.sessions, left <= 1 ? 'var(--amber)' : 'var(--mint)') + '</div></div></div>'; }).join('') : empty('box', 'Κανένα ενεργό πακέτο', '')) +
      '</div></section>' +
      '<section class="card s-6"><div class="card-h"><h3>Οφειλές</h3><span class="sub">' + EUR.format(owed) + '</span></div><div style="padding-top:8px;max-height:398px;overflow-y:auto">' +
        (debt.length ? debt.map(x => '<div class="al" data-act="open" data-id="' + x.c.id + '">' + av(x.c.name, 'sm') + '<span style="min-width:0"><b>' + esc(x.c.name) + '</b><span>τελευταία πληρωμή ' + (pays(x.c.id)[0] ? fmtS(pays(x.c.id)[0].date) : '—') + '</span></span><span class="spacer"></span>' + chip(EUR.format(x.b), 'rose') +
          (S.canWrite ? '<button class="btn sm" data-act="new-pay" data-cid="' + x.c.id + '">Είσπραξη</button>' : '') + '</div>').join('') : empty('check', 'Καμία οφειλή', 'Όλοι οι πελάτες είναι εξοφλημένοι.')) +
      '</div></section>' +
    '</div>' +
    '<section class="card"><div class="card-h"><h3>Κινήσεις</h3><span class="spacer"></span><label class="search" style="min-width:200px">' + ic('search') + '<input id="payq" type="text" placeholder="Πελάτης, περιγραφή…" value="' + esc(S.paySearch) + '" aria-label="Αναζήτηση κινήσεων"></label></div>' +
      '<div class="tw" style="margin-top:12px"><table><thead><tr><th>Ημερομηνία</th><th>Πελάτης</th><th class="hide-sm">Περιγραφή</th><th>Τρόπος</th><th class="r">Ποσό</th></tr></thead><tbody>' +
      (rows.length ? rows.map(p => { const c = client(p.clientId) || {name:'—'}; return '<tr class="click" data-act="open" data-id="' + p.clientId + '"><td class="mono" style="font-size:12.5px;white-space:nowrap">' + fmtD(p.date) + '</td><td><div class="row">' + av(c.name, 'sm') + '<span style="white-space:nowrap">' + esc(c.name) + '</span></div></td>' +
        '<td class="hide-sm muted">' + esc(p.note || '—') + '</td><td><span class="row" style="gap:7px;white-space:nowrap"><i style="width:7px;height:7px;border-radius:50%;background:' + (METHOD_C[p.method] || 'var(--text-3)') + '"></i>' + esc(p.method || '—') + '</span></td><td class="r num" style="font-weight:600">' + EUR2.format(p.amount) + '</td></tr>'; }).join('')
        : '<tr><td colspan="5">' + empty('euro', 'Καμία κίνηση', '') + '</td></tr>') +
      '</tbody></table></div></section>';
}

/* ---------------- Ρυθμίσεις ---------------- */
function vSettings(){
  const s = cfg();
  const demo = S.clients.filter(c => c.demo).length;
  return '<div class="grid g-12">' +
    '<div class="s-7 col" style="gap:16px">' +
      '<section class="card"><div class="card-h"><h3>Γραφείο & τιμές</h3></div><div class="card-b"><div class="fields three">' +
        '<label class="f full"><span>Όνομα γραφείου</span><input class="in" type="text" id="set-name" value="' + esc(s.practiceName) + '"></label>' +
        '<label class="f"><span>Συνεδρία (€)</span><input class="in" type="number" id="set-price" value="' + esc(s.sessionPrice) + '"></label>' +
        '<label class="f"><span>Πρώτη επίσκεψη (€)</span><input class="in" type="number" id="set-first" value="' + esc(s.firstVisitPrice) + '"></label>' +
        '<div class="f" style="justify-content:flex-end"><button class="btn pri" data-act="save-settings"' + (S.canWrite ? '' : ' disabled') + '>Αποθήκευση</button></div>' +
      '</div></div></section>' +
      '<section class="card"><div class="card-h"><h3>Πακέτα συνεδριών</h3><span class="sub">εμφανίζονται στη χρέωση πακέτου</span></div><div class="card-b col" style="gap:10px" id="presets">' +
        s.presets.map((p, i) => presetRow(p, i)).join('') +
        '<div class="row"><button class="btn sm" data-act="preset-add">' + ic('plus') + 'Προσθήκη</button><span class="spacer"></span><button class="btn sm pri" data-act="save-settings"' + (S.canWrite ? '' : ' disabled') + '>Αποθήκευση πακέτων</button></div>' +
      '</div></section>' +
      '<section class="card"><div class="card-h"><h3>Πώς υπολογίζονται</h3></div><div class="card-b col" style="gap:10px;font-size:13px" >' +
        '<div><b>ΔΜΣ</b> <span class="muted">— βάρος / ύψος². ΠΟΥ: &lt;18,5 ελλιποβαρής · 18,5–24,9 φυσιολογικό · 25–29,9 υπέρβαρος · ≥30 παχυσαρκία.</span></div>' +
        '<div><b>BMR</b> <span class="muted">— Mifflin-St Jeor: 10×kg + 6,25×cm − 5×ηλικία, +5 άνδρες / −161 γυναίκες.</span></div>' +
        '<div><b>Ημερήσιος στόχος</b> <span class="muted">— BMR × δραστηριότητα (1,2–1,9), −500 kcal για απώλεια, −300 παθολογική, +300 μυϊκή μάζα, +340 εγκυμοσύνη (2ο τρίμηνο).</span></div>' +
        '<div><b>Σπλαχνικό λίπος</b> <span class="muted">— κλίμακα Tanita 1–59· υγιές 1–12.</span></div>' +
        '<div><b>Κέρδος</b> <span class="muted">— εισπράξεις μείον έξοδα του διαστήματος (ταμειακή βάση). Νεκρό σημείο: πάγια έξοδα μήνα ÷ μέσο έσοδο ανά συνεδρία.</span></div>' +
        '<div><b>Πακέτα</b> <span class="muted">— κάθε ολοκληρωμένη συνεδρία ή μη προσέλευση αφαιρεί μία από το ενεργό πακέτο. Όσοι δεν έχουν πακέτο χρεώνονται ανά συνεδρία.</span></div>' +
        '<div class="faint" style="font-size:12px;padding-top:8px;border-top:1px solid var(--line)">Εκτιμήσεις για χρήση από επαγγελματία υγείας· δεν αντικαθιστούν την κλινική κρίση.</div>' +
      '</div></section>' +
    '</div>' +
    '<div class="s-5 col" style="gap:16px">' +
      '<section class="card"><div class="card-h"><h3>Δεδομένα</h3></div><div class="card-b col" style="gap:0">' +
        [['Πελάτες', S.clients.length], ['Μετρήσεις', S.measurements.length], ['Ραντεβού', S.appointments.length], ['Πακέτα', S.packages.length], ['Πληρωμές', S.payments.length], ['Έξοδα', S.expenses.length]].map(r => '<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line)"><span class="muted">' + r[0] + '</span><span class="spacer"></span><b class="num">' + r[1] + '</b></div>').join('') +
        '<p class="faint" style="font-size:12px;margin-top:12px">' + (S.db ? 'Αποθηκεύεται στη βάση του artifact, ορατή μόνο στον οργανισμό σας. Οι αλλαγές συγχρονίζονται ζωντανά σε κάθε ανοιχτή καρτέλα.' : 'Αυτή η προβολή δεν έχει πρόσβαση στη βάση — οι αλλαγές δεν αποθηκεύονται.') + '</p>' +
      '</div></section>' +
      pinCard() +
      (demo ? '<section class="card" style="border-color:rgba(255,196,107,.25)"><div class="card-h"><h3>Δεδομένα επίδειξης</h3></div><div class="card-b col" style="gap:12px">' +
        '<p class="muted" style="font-size:13px">' + demo + ' από τους πελάτες είναι δείγμα, για να δείτε την εφαρμογή γεμάτη. Διαγράψτε τα πριν περάσετε πραγματικούς πελάτες.</p>' +
        (S.canWrite ? '<button class="btn danger" data-act="wipe" data-step="0">' + ic('trash') + 'Διαγραφή δεδομένων επίδειξης</button>' : '') + '</div></section>' : '') +
      '<section class="card"><div class="card-h"><h3>Συντομεύσεις</h3></div><div class="card-b col" style="gap:9px;font-size:13px">' +
        [['Αναζήτηση & εντολές', '⌘K'], ['Αναζήτηση', '/'], ['Σήμερα … Ρυθμίσεις', '1 – 7'], ['Νέος πελάτης', 'N'], ['Κλείσιμο παραθύρου', 'Esc']].map(r => '<div class="row"><span class="muted">' + r[0] + '</span><span class="spacer"></span><kbd>' + r[1] + '</kbd></div>').join('') +
      '</div></section>' +
    '</div></div>';
}
function presetRow(p, i){
  return '<div class="row preset" data-i="' + i + '" style="gap:8px"><input class="in" type="text" data-k="name" value="' + esc(p.name) + '" aria-label="Όνομα πακέτου" style="flex:2">' +
    '<input class="in" type="number" data-k="sessions" value="' + esc(p.sessions) + '" aria-label="Συνεδρίες" style="width:84px">' +
    '<input class="in" type="number" data-k="price" value="' + esc(p.price) + '" aria-label="Τιμή" style="width:96px">' +
    '<button class="btn ghost icon" data-act="preset-del" data-i="' + i + '" aria-label="Αφαίρεση">' + ic('x') + '</button></div>';
}

/* ---------------- render ---------------- */
function render(){
  if(dirty) reindex();
  renderSide(); renderTop();
  const el = $('#view');
  if(S.loading){
    el.innerHTML = '<div class="skel" style="height:70px;width:340px;margin-bottom:22px;border:0;background-color:transparent"></div><div class="grid g-4" style="margin-bottom:16px">' + '<div class="skel" style="height:124px"></div>'.repeat(4) + '</div><div class="grid g-12"><div class="skel s-7" style="height:360px"></div><div class="skel s-5" style="height:360px"></div></div>';
    return;
  }
  const V = {today:vToday, clients:vClients, client:vClient, calendar:vCalendar, finance:vFinance, expenses:vExpenses, reports:vReports, settings:vSettings};
  let html = (FIN_VIEWS.indexOf(S.view) >= 0 && finLocked()) ? lockScreen() : (V[S.view] || vToday)();
  if(!S.db) html = '<div class="banner">' + ic('alert') + '<span>Η βάση δεδομένων δεν είναι διαθέσιμη σε αυτή την προβολή. Ανοίξτε το artifact από το claude.ai για να δείτε και να αποθηκεύσετε δεδομένα.</span></div>' + html;
  else if(!S.canWrite) html = '<div class="banner">' + ic('alert') + '<span>Προβολή μόνο για ανάγνωση — δεν μπορείτε να κάνετε αλλαγές.</span></div>' + html;
  const focus = document.activeElement && document.activeElement.id;
  const sel = focus && document.activeElement.selectionStart;
  el.innerHTML = html;
  if(focus && (focus === 'cq' || focus === 'payq' || focus === 'expq' || focus === 'pinin')){ const f = $('#' + focus); if(f){ f.focus(); try{ f.setSelectionRange(sel, sel); }catch(e){} } }
}

/* ---------------- PIN lock ---------------- */
function lockScreen(){
  return '<section class="card" style="max-width:420px;margin:40px auto 0;text-align:center"><div class="card-b" style="padding:34px 28px">' +
    '<div class="e-ico" style="width:54px;height:54px;border-radius:16px;margin:0 auto 16px;display:grid;place-items:center;background:var(--amber-dim);color:var(--amber);border:1px solid rgba(255,196,107,.25)">' + ic('lock', 'width="24" height="24"') + '</div>' +
    '<h2 style="font-size:20px;font-weight:700;letter-spacing:-.02em">Τα οικονομικά είναι κλειδωμένα</h2>' +
    '<p class="muted" style="margin:6px 0 20px;font-size:13.5px">Πληκτρολογήστε το PIN για να δείτε έσοδα, έξοδα και αναφορές.</p>' +
    '<form data-form="unlock" class="col" style="gap:12px;align-items:center"><input class="in mono" id="pinin" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="• • • • • •" aria-label="PIN οικονομικών" style="max-width:220px;text-align:center;font-size:20px;letter-spacing:.35em;height:48px">' +
    '<button class="btn pri" type="submit" style="width:220px;height:40px">' + ic('unlock') + 'Ξεκλείδωμα</button></form>' +
    '<p class="faint" style="font-size:11.5px;margin-top:16px">Το ξεκλείδωμα ισχύει μέχρι να κλείσετε τη σελίδα.</p></div></section>';
}
function lockedMini(){ return '<div class="empty" style="padding:56px 20px"><div class="e-ico" style="color:var(--amber)">' + ic('lock') + '</div><b>Κλειδωμένο</b><button class="btn sm" data-act="go" data-v="reports" style="margin-top:10px">Ξεκλείδωμα</button></div>'; }
function pinCard(){
  const has = !!cfg().financePin;
  return '<section class="card"><div class="card-h"><h3>Κλείδωμα οικονομικών</h3>' + (has ? chip('Ενεργό', 'mint', true) : chip('Ανενεργό')) + '</div><div class="card-b col" style="gap:12px">' +
    '<p class="muted" style="font-size:13px">Κρύβει έσοδα, έξοδα, αναφορές και υπόλοιπα πίσω από PIN — χρήσιμο όταν τη σελίδα βλέπει και η γραμματεία ή είναι ανοιχτή στο ιατρείο. Είναι κλείδωμα προβολής· δεν αντικαθιστά τα δικαιώματα πρόσβασης του artifact.</p>' +
    (S.canWrite ? (has && finLocked() ? '<button class="btn" data-act="go" data-v="reports">' + ic('unlock') + 'Ξεκλειδώστε για να αλλάξετε το PIN</button>' :
      '<form data-form="setpin" class="row wrap" style="gap:8px"><input class="in mono" id="pin1" type="password" inputmode="numeric" maxlength="8" placeholder="Νέο PIN (4–8 ψηφία)" aria-label="Νέο PIN" style="flex:1 1 150px">' +
      '<input class="in mono" id="pin2" type="password" inputmode="numeric" maxlength="8" placeholder="Επανάληψη" aria-label="Επανάληψη PIN" style="flex:1 1 120px">' +
      '<button class="btn pri" type="submit">' + (has ? 'Αλλαγή PIN' : 'Ενεργοποίηση') + '</button></form>' +
      (has ? '<button class="btn danger sm" data-act="pin-off" data-step="0" style="align-self:flex-start">' + ic('trash') + 'Απενεργοποίηση κλειδώματος</button>' : '')) : '') +
  '</div></section>';
}

/* ---------------- Έξοδα ---------------- */
function vExpenses(){
  const t = today(), cur = P(t), yr = String(cur.getFullYear());
  const m12 = expensesBy(monthsBack(12));
  const mE = m12[11].v, pE = m12[10].v, dE = pE ? Math.round((mE - pE) / pE * 100) : null;
  const ytdL = S.expenses.filter(e => String(e.date).startsWith(yr));
  const ytd = sum(ytdL, e => e.amount);
  const fixed = sum(S.expenses.filter(e => e.recurring && String(e.date).slice(0, 7) === m12[10].key), e => e.amount);
  const byC = {}; ytdL.forEach(e => { const k = e.category || 'Άλλο'; byC[k] = (byC[k] || 0) + (+e.amount || 0); });
  const cats = Object.keys(byC).sort((a, b) => byC[b] - byC[a]);
  const q = S.expQ.trim().toLowerCase();
  const all = S.expenses.slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  const rows = all.filter(e => (S.expFilter === 'all' || e.category === S.expFilter) && (!q || [e.vendor, e.note, e.category, e.method].join(' ').toLowerCase().includes(q)));
  const counts = {}; all.forEach(e => counts[e.category] = (counts[e.category] || 0) + 1);
  const chips = [['all', 'Όλα', all.length]].concat(EXP_CATS.filter(k => counts[k]).map(k => [k, k, counts[k]]));
  const pendingFixed = (() => { const prevKey = m12[10].key, curKey = m12[11].key; const have = new Set(S.expenses.filter(e => String(e.date).slice(0, 7) === curKey).map(e => (e.category + '|' + (e.vendor || '')).toLowerCase())); return S.expenses.filter(e => e.recurring && String(e.date).slice(0, 7) === prevKey && !have.has((e.category + '|' + (e.vendor || '')).toLowerCase())); })();

  return (pendingFixed.length && S.canWrite ? '<div class="banner" style="background:var(--sky-dim);border-color:rgba(111,203,255,.25);color:var(--sky)">' + ic('receipt') + '<span style="flex:1">' + pendingFixed.length + ' πάγια έξοδα του ' + MONG[(cur.getMonth() + 11) % 12] + ' δεν έχουν καταχωριστεί ακόμη για τον ' + MONN[cur.getMonth()].toLowerCase() + ' (' + EUR.format(sum(pendingFixed, e => e.amount)) + ').</span><button class="btn sm" data-act="exp-recurring">Καταχώριση</button></div>' : '') +
    '<div class="grid g-4" style="margin-bottom:16px">' +
      kpi('Έξοδα ' + MONG[cur.getMonth()], EUR.format(mE), '', dE == null ? '' : '<span class="delta ' + (dE <= 0 ? 'up' : 'down') + '">' + (dE >= 0 ? '▲' : '▼') + ' ' + Math.abs(dE) + '%</span> από ' + MON[(cur.getMonth() + 11) % 12], spark(m12.slice(-6).map(m => m.v), '#FF7A93'), 'receipt', 'rose') +
      kpi('Έξοδα ' + yr, EUR.format(ytd), '', ytdL.length + ' κινήσεις από 1 Ιανουαρίου', '', 'trend', 'amber') +
      kpi('Πάγια μηνιαία', EUR.format(fixed), '', 'ενοίκιο, εισφορές, λογιστής κ.ά.', '', 'cal', 'sky') +
      kpi('Μεγαλύτερη κατηγορία', cats[0] || '—', '', cats[0] ? EUR.format(byC[cats[0]]) + ' · ' + Math.round(byC[cats[0]] / (ytd || 1) * 100) + '% του έτους' : '', '', 'pie', 'violet') +
    '</div>' +
    '<div class="grid g-12" style="margin-bottom:16px">' +
      '<section class="card s-8"><div class="card-h"><h3>Έξοδα ανά μήνα</h3><span class="sub">' + EUR.format(sum(m12, m => m.v)) + ' σε 12 μήνες</span></div><div class="card-b">' +
        bars(m12.map(m => ({l:m.l, v:m.v, tip:MONN[m.m] + ' ' + m.y + '|' + EUR.format(m.v)})), {color:'#FF7A93', fmtY:v => kfmt(v), label:'Έξοδα ανά μήνα', h:250}) + '</div></section>' +
      '<section class="card s-4"><div class="card-h"><h3>Κατανομή ' + yr + '</h3></div><div class="card-b">' +
        '<div class="row" style="justify-content:center;margin:2px 0 16px">' + donut(cats.map(k => ({v:byC[k], color:expCol(k), l:k})), 138, '<div><div style="font-size:18px;font-weight:750;letter-spacing:-.02em">' + EUR.format(ytd) + '</div><div class="eyebrow" style="font-size:9px">σύνολο</div></div>') + '</div>' +
        '<div class="col" style="gap:8px">' + cats.slice(0, 7).map(k => '<div class="row" style="font-size:12.5px;cursor:pointer" data-act="exp-filter" data-c="' + esc(k) + '"><i style="width:8px;height:8px;border-radius:3px;background:' + expCol(k) + '"></i><span class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(k) + '</span><span class="spacer"></span><b class="num">' + EUR.format(byC[k]) + '</b><span class="faint mono" style="width:36px;text-align:end;font-size:11px">' + Math.round(byC[k] / (ytd || 1) * 100) + '%</span></div>').join('') + '</div>' +
      '</div></section>' +
    '</div>' +
    '<section class="card"><div class="card-h"><h3>Κινήσεις</h3><span class="sub">' + rows.length + ' · ' + EUR2.format(sum(rows, e => e.amount)) + '</span><span class="spacer"></span><label class="search" style="min-width:200px">' + ic('search') + '<input id="expq" type="text" placeholder="Προμηθευτής, περιγραφή…" value="' + esc(S.expQ) + '" aria-label="Αναζήτηση εξόδων"></label></div>' +
      '<div class="filters" style="padding:12px 18px 0">' + chips.map(ch => '<button class="fchip" data-act="exp-filter" data-c="' + esc(ch[0]) + '" aria-pressed="' + (S.expFilter === ch[0]) + '">' + (ch[0] !== 'all' ? '<i style="width:7px;height:7px;border-radius:50%;background:' + expCol(ch[0]) + '"></i>' : '') + esc(ch[1]) + '<span class="n">' + ch[2] + '</span></button>').join('') + '</div>' +
      '<div class="tw" style="margin-top:10px"><table><thead><tr><th>Ημερομηνία</th><th>Κατηγορία</th><th>Περιγραφή</th><th class="hide-sm">Τρόπος</th><th class="r">Ποσό</th><th></th></tr></thead><tbody>' +
      (rows.length ? rows.slice(0, 50).map(e => '<tr class="click" data-act="edit-exp" data-id="' + e.id + '"><td class="mono" style="font-size:12.5px;white-space:nowrap">' + fmtD(e.date) + '</td>' +
        '<td><span class="row" style="gap:8px;white-space:nowrap"><i style="width:8px;height:8px;border-radius:3px;background:' + expCol(e.category) + '"></i>' + esc(e.category || 'Άλλο') + '</span></td>' +
        '<td>' + esc(e.vendor || '—') + (e.recurring ? ' ' + chip('πάγιο', 'sky') : '') + (e.note ? '<div class="faint" style="font-size:11.5px">' + esc(e.note) + '</div>' : '') + '</td>' +
        '<td class="hide-sm muted" style="white-space:nowrap">' + esc(e.method || '—') + '</td>' +
        '<td class="r num" style="font-weight:600;color:var(--rose);white-space:nowrap">−' + EUR2.format(e.amount) + '</td>' +
        '<td class="r">' + (S.canWrite ? '<button class="btn ghost sm icon" data-act="del" data-col="expenses" data-id="' + e.id + '" aria-label="Διαγραφή εξόδου">' + ic('trash') + '</button>' : '') + '</td></tr>').join('')
        : '<tr><td colspan="6">' + empty('receipt', 'Κανένα έξοδο', S.expQ || S.expFilter !== 'all' ? 'Δοκιμάστε άλλο φίλτρο.' : 'Καταχωρίστε το πρώτο έξοδο του γραφείου.') + '</td></tr>') +
      '</tbody></table></div>' + (rows.length > 50 ? '<p class="faint" style="font-size:12px;padding:10px 18px 14px">Εμφανίζονται οι 50 πιο πρόσφατες — χρησιμοποιήστε φίλτρο ή αναζήτηση.</p>' : '') + '</section>';
}

/* ---------------- Αναφορές & κερδοφορία ---------------- */
const RANGES = [['month','Μήνας'],['3m','3 μήνες'],['ytd','Φέτος'],['12','12 μήνες']];
function repMonths(key){
  const cur = P(today());
  const n = key === 'month' ? 1 : key === '3m' ? 3 : key === 'ytd' ? cur.getMonth() + 1 : 12;
  const all = monthsBack(n * 2);
  return {cur:all.slice(n), prev:all.slice(0, n), n};
}
function repData(months){
  const inc = revenueBy(months), exp = expensesBy(months);
  return months.map((m, i) => {
    const ap = S.appointments.filter(a => String(a.date).slice(0, 7) === m.key);
    return {key:m.key, l:m.l, tipL:MONN[m.m] + ' ' + m.y, inc:inc[i].v, exp:exp[i].v,
      done:ap.filter(a => a.status === 'done').length, newc:S.clients.filter(c => String(c.startDate).slice(0, 7) === m.key).length};
  });
}
function paySource(p){ if(!p.packageId) return 'Μεμονωμένες συνεδρίες'; const pk = S.packages.find(k => k.id === p.packageId); return pk && /online/i.test(pk.name) ? 'Online προγράμματα' : 'Πακέτα συνεδριών'; }
function repLabel(){ const r = repMonths(S.repRange); const a = r.cur[0], b = r.cur[r.cur.length - 1]; return r.n === 1 ? MONN[a.m] + ' ' + a.y : a.l + (a.y !== b.y ? ' ' + a.y : '') + ' – ' + b.l + ' ' + b.y; }
function vReports(){
  const t = today(), r = repMonths(S.repRange);
  const rows = repData(r.cur), prow = repData(r.prev);
  const I = sum(rows, x => x.inc), E = sum(rows, x => x.exp), Pf = I - E, M = I ? Pf / I : 0;
  const pI = sum(prow, x => x.inc), pE = sum(prow, x => x.exp), pP = pI - pE;
  const cover = prow.every(x => x.inc > 0 || x.exp > 0);
  const dl = (a, b, invert) => { if(!b || !cover) return r.n === 1 ? '' : 'πρώτη περίοδος λειτουργίας'; const d = Math.round((a - b) / Math.abs(b) * 100); const good = invert ? d <= 0 : d >= 0; return '<span class="delta ' + (good ? 'up' : 'down') + '">' + (d >= 0 ? '▲' : '▼') + ' ' + Math.abs(d) + '%</span> vs προηγ.'; };
  const from = r.cur[0].key + '-01';
  const pays_ = payIn(from, t), exps_ = expIn(from, t);
  const src = {}; pays_.forEach(p => { const k = paySource(p); src[k] = (src[k] || 0) + (+p.amount || 0); });
  const srcK = Object.keys(src).sort((a, b) => src[b] - src[a]);
  const SRC_C = {'Πακέτα συνεδριών':'#5CF0B0', 'Μεμονωμένες συνεδρίες':'#6FCBFF', 'Online προγράμματα':'#FFC46B'};
  const byC = {}; exps_.forEach(e => { const k = e.category || 'Άλλο'; byC[k] = (byC[k] || 0) + (+e.amount || 0); });
  const catK = Object.keys(byC).sort((a, b) => byC[b] - byC[a]);
  const byCl = {}; pays_.forEach(p => byCl[p.clientId] = (byCl[p.clientId] || 0) + (+p.amount || 0));
  const topCl = Object.keys(byCl).sort((a, b) => byCl[b] - byCl[a]).slice(0, 8);
  const topMax = topCl.length ? byCl[topCl[0]] : 1;
  // operations — last 30 days
  const d30 = addD(t, -30);
  const ap30 = S.appointments.filter(a => a.date > d30 && a.date <= t);
  const done30 = ap30.filter(a => a.status === 'done').length, ns30 = ap30.filter(a => a.status === 'noshow').length, cx30 = ap30.filter(a => a.status === 'cancelled').length;
  const inc30 = sum(payIn(addD(d30, 1), t), p => p.amount), exp30 = sum(expIn(addD(d30, 1), t), e => e.amount);
  const perS = done30 ? inc30 / done30 : 0;
  const prevKey = monthsBack(2)[0].key;
  const fixedM = sum(S.expenses.filter(e => e.recurring && String(e.date).slice(0, 7) === prevKey), e => e.amount);
  const be = perS ? Math.ceil(fixedM / perS) : null;
  const doneMonth = S.appointments.filter(a => a.status === 'done' && String(a.date).slice(0, 7) === t.slice(0, 7)).length;
  const op = (l, v, m, color) => '<div style="padding:14px;border-radius:11px;border:1px solid var(--line);background:rgba(255,255,255,.015)"><div class="eyebrow" style="font-size:9.5px">' + esc(l) + '</div><div style="font-size:21px;font-weight:700;letter-spacing:-.03em;margin-top:5px;font-variant-numeric:tabular-nums;color:' + (color || 'var(--text)') + '">' + esc(v) + '</div><div class="faint" style="font-size:11.5px;margin-top:1px">' + m + '</div></div>';
  const hbar = (label, v, tot, color, extra) => '<div><div class="row" style="font-size:12.5px;gap:8px"><i style="width:8px;height:8px;border-radius:3px;background:' + color + '"></i><span class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(label) + '</span><span class="spacer"></span><b class="num">' + EUR.format(v) + '</b><span class="faint mono" style="width:38px;text-align:end;font-size:11px">' + Math.round(v / (tot || 1) * 100) + '%</span></div><div style="margin-top:6px">' + pbar(v / (tot || 1), color) + '</div>' + (extra || '') + '</div>';

  return '<div class="row wrap" style="margin-bottom:16px;gap:10px"><div class="seg">' + RANGES.map(x => '<button data-act="rep-range" data-r="' + x[0] + '" aria-pressed="' + (S.repRange === x[0]) + '">' + x[1] + '</button>').join('') + '</div>' +
      '<h2 style="font-size:17px;font-weight:700;letter-spacing:-.02em">' + esc(repLabel()) + '</h2><span class="spacer"></span><span class="faint" style="font-size:12px">ταμειακή βάση · εισπράξεις − έξοδα</span></div>' +
    '<div class="grid g-4" style="margin-bottom:16px">' +
      kpi('Έσοδα', EUR.format(I), '', dl(I, pI), spark(rows.map(x => x.inc), '#5CF0B0'), 'euro', 'mint') +
      kpi('Έξοδα', EUR.format(E), '', dl(E, pE, true), spark(rows.map(x => x.exp), '#FF7A93'), 'receipt', 'rose') +
      kpi('Καθαρό κέρδος', EUR.format(Pf), '', dl(Pf, pP), spark(rows.map(x => x.inc - x.exp), '#FFC46B'), 'trend', Pf >= 0 ? 'amber' : 'rose') +
      kpi('Περιθώριο κέρδους', I ? Math.round(M * 100) + '%' : '—', '', 'κέρδος ανά €100 εσόδων: ' + (I ? EUR.format(M * 100) : '—'), '', 'pie', 'violet') +
    '</div>' +
    (r.n > 1 ? '<section class="card" style="margin-bottom:16px"><div class="card-h"><h3>Έσοδα, έξοδα & κέρδος</h3><span class="spacer"></span>' + pnlLegend() + '</div><div class="card-b">' + pnl(rows, {h:270}) + '</div></section>' : '') +
    '<div class="grid g-12" style="margin-bottom:16px">' +
      '<section class="card s-4"><div class="card-h"><h3>Πηγές εσόδων</h3></div><div class="card-b col" style="gap:14px">' +
        (srcK.length ? srcK.map(k => hbar(k, src[k], I, SRC_C[k] || '#A394FF')).join('') : '<span class="faint">Καμία είσπραξη στο διάστημα.</span>') + '</div></section>' +
      '<section class="card s-4"><div class="card-h"><h3>Έξοδα ανά κατηγορία</h3></div><div class="card-b col" style="gap:12px">' +
        (catK.length ? catK.slice(0, 7).map(k => hbar(k, byC[k], E, expCol(k))).join('') + (catK.length > 7 ? '<span class="faint" style="font-size:12px">+ ' + (catK.length - 7) + ' ακόμη κατηγορίες · ' + EUR.format(sum(catK.slice(7), k => byC[k])) + '</span>' : '') : '<span class="faint">Κανένα έξοδο στο διάστημα.</span>') + '</div></section>' +
      '<section class="card s-4"><div class="card-h"><h3>Κορυφαίοι πελάτες</h3><span class="sub">εισπράξεις</span></div><div class="card-b col" style="gap:11px">' +
        (topCl.length ? topCl.map(id => { const c = client(id) || {name:'—'}; return '<div class="row" data-act="open" data-id="' + id + '" style="cursor:pointer;gap:10px">' + av(c.name, 'sm') + '<div style="flex:1;min-width:0"><div class="row" style="font-size:12.5px;gap:6px"><b style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(c.name) + '</b><span class="spacer"></span><span class="num" style="font-weight:600">' + EUR.format(byCl[id]) + '</span></div><div style="margin-top:5px">' + pbar(byCl[id] / topMax, 'var(--violet)') + '</div></div></div>'; }).join('') : '<span class="faint">—</span>') + '</div></section>' +
    '</div>' +
    '<section class="card" style="margin-bottom:16px"><div class="card-h"><h3>Λειτουργία γραφείου</h3><span class="sub">τελευταίες 30 ημέρες</span></div><div class="card-b"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">' +
      op('Συνεδρίες', done30, 'ολοκληρωμένες') +
      op('Έσοδο / συνεδρία', perS ? EUR.format(perS) : '—', 'εισπράξεις ÷ συνεδρίες') +
      op('Κόστος / συνεδρία', done30 ? EUR.format(exp30 / done30) : '—', 'έξοδα ÷ συνεδρίες') +
      op('Μη προσέλευση', ap30.length ? Math.round(ns30 / Math.max(1, done30 + ns30) * 100) + '%' : '—', ns30 + ' ραντεβού', ns30 / Math.max(1, done30 + ns30) > .08 ? 'var(--rose)' : '') +
      op('Ακυρώσεις', ap30.length ? Math.round(cx30 / ap30.length * 100) + '%' : '—', cx30 + ' ραντεβού') +
      op('Νεκρό σημείο', be != null ? be + ' συν.' : '—', 'τον μήνα για τα πάγια (' + EUR.format(fixedM) + ')' + (be != null ? ' · φέτος τον μήνα: ' + doneMonth : ''), be != null && doneMonth >= be ? 'var(--mint)' : '') +
    '</div></div></section>' +
    '<section class="card"><div class="card-h"><h3>Αποτελέσματα ανά μήνα</h3><span class="spacer"></span>' + (S.dl ? '<button class="btn sm" data-act="rep-csv">' + ic('down') + 'CSV για λογιστή</button>' : '') + '</div>' +
      '<div class="tw" style="margin-top:10px"><table><thead><tr><th>Μήνας</th><th class="r">Έσοδα</th><th class="r">Έξοδα</th><th class="r">Κέρδος</th><th class="r">Περιθώριο</th><th class="r hide-sm">Νέοι πελάτες</th></tr></thead><tbody>' +
      rows.slice().reverse().map(x => { const p = x.inc - x.exp; return '<tr><td style="white-space:nowrap"><b style="font-weight:600">' + esc(x.tipL) + '</b></td><td class="r num">' + EUR.format(x.inc) + '</td><td class="r num" style="color:var(--rose)">' + EUR.format(x.exp) + '</td>' +
        '<td class="r num" style="font-weight:650;color:' + (p >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (p < 0 ? '−' : '') + EUR.format(Math.abs(p)) + '</td><td class="r num">' + (x.inc ? Math.round(p / x.inc * 100) + '%' : '—') + '</td><td class="r num hide-sm">' + x.newc + '</td></tr>'; }).join('') +
      (rows.length > 1 ? '<tr style="background:rgba(255,255,255,.025)"><td><b>Σύνολο</b></td><td class="r num"><b>' + EUR.format(I) + '</b></td><td class="r num" style="color:var(--rose)"><b>' + EUR.format(E) + '</b></td><td class="r num" style="color:' + (Pf >= 0 ? 'var(--mint)' : 'var(--rose)') + '"><b>' + (Pf < 0 ? '−' : '') + EUR.format(Math.abs(Pf)) + '</b></td><td class="r num"><b>' + (I ? Math.round(M * 100) + '%' : '—') + '</b></td><td class="r num hide-sm"><b>' + sum(rows, x => x.newc) + '</b></td></tr>' : '') +
      '</tbody></table></div></section>';
}
function reportCsv(){
  const r = repMonths(S.repRange), rows = repData(r.cur), t = today();
  const f = v => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';
  let out = '﻿' + q(cfg().practiceName + ' — Αναφορά ' + repLabel()) + '\r\n\r\n';
  out += ['Μήνας', 'Έσοδα', 'Έξοδα', 'Κέρδος', 'Περιθώριο %'].map(q).join(';') + '\r\n';
  rows.forEach(x => { out += [q(x.tipL), f(x.inc), f(x.exp), f(x.inc - x.exp), x.inc ? Math.round((x.inc - x.exp) / x.inc * 100) : ''].join(';') + '\r\n'; });
  const I = sum(rows, x => x.inc), E = sum(rows, x => x.exp);
  out += [q('Σύνολο'), f(I), f(E), f(I - E), I ? Math.round((I - E) / I * 100) : ''].join(';') + '\r\n\r\n';
  out += [q('Ημερομηνία'), q('Κατηγορία'), q('Περιγραφή'), q('Τρόπος'), q('Ποσό')].join(';') + '\r\n';
  expIn(r.cur[0].key + '-01', t).sort((a, b) => a.date < b.date ? -1 : 1).forEach(e => { out += [q(e.date), q(e.category || ''), q(e.vendor || ''), q(e.method || ''), f(e.amount)].join(';') + '\r\n'; });
  out += '\r\n' + [q('Ημερομηνία'), q('Πελάτης'), q('Περιγραφή'), q('Τρόπος'), q('Ποσό')].join(';') + '\r\n';
  payIn(r.cur[0].key + '-01', t).sort((a, b) => a.date < b.date ? -1 : 1).forEach(p => { out += [q(p.date), q((client(p.clientId) || {}).name || ''), q(p.note || ''), q(p.method || ''), f(p.amount)].join(';') + '\r\n'; });
  return out;
}
