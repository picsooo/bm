(function () {
  const P = window.BMSPlates;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Son (synthétisé, aucun extrait) ---------- */
  let ctx = null, sonOn = true;
  const sonBtn = document.querySelector('.son');
  sonBtn.addEventListener('click', () => {
    sonOn = !sonOn;
    sonBtn.setAttribute('aria-pressed', sonOn);
    sonBtn.querySelector('span').textContent = sonOn ? 'Son activé' : 'Son coupé';
  });
  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function clic(lourd) {
    if (!sonOn) return;
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    const len = lourd ? 0.09 : 0.035;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, lourd ? 3 : 6);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = lourd ? 1400 : 3200; f.Q.value = 0.9;
    const g = a.createGain(); g.gain.value = lourd ? 0.9 : 0.7;
    src.connect(f).connect(g).connect(a.destination); src.start(t);
    const o = a.createOscillator(), og = a.createGain();
    o.frequency.setValueAtTime(lourd ? 120 : 190, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.08);
    og.gain.setValueAtTime(lourd ? 0.5 : 0.25, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(og).connect(a.destination); o.start(t); o.stop(t + 0.12);
  }
  function bourdon() {
    if (!sonOn) return;
    const a = audio(); if (!a) return;
    const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = 'sawtooth'; o.frequency.value = 50;
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(f).connect(g).connect(a.destination); o.start(t); o.stop(t + 0.75);
  }

  /* ---------- Scène 1 : l'interrupteur ---------- */
  const big = document.querySelector('.big-switch');
  const cue = document.querySelector('.cue');
  const titre = document.querySelector('.titre');
  const PHRASE = 'Depuis 2001, nous fabriquons ce que vous touchez avant d’allumer.';
  let allume = false, ecrit = false;
  const drawBig = () => { big.innerHTML = P.plate({ gamme: 'continuum', mechs: ['simple'], on: allume }); };
  drawBig();

  function taper() {
    if (ecrit) return; ecrit = true;
    if (reduce) { titre.textContent = PHRASE; body.classList.add('revealed'); return; }
    let i = 0;
    titre.innerHTML = '<span class="txt"></span><span class="caret"></span>';
    const span = titre.querySelector('.txt');
    const step = () => {
      span.textContent = PHRASE.slice(0, ++i);
      if (i < PHRASE.length) setTimeout(step, PHRASE[i - 1] === ',' ? 220 : 34 + Math.random() * 26);
      else { setTimeout(() => { const c = titre.querySelector('.caret'); if (c) c.remove(); }, 1600); body.classList.add('revealed'); }
    };
    setTimeout(step, 450);
  }

  function setLumiere(on, flicker) {
    allume = on; drawBig();
    big.setAttribute('aria-pressed', on);
    big.setAttribute('aria-label', on ? 'Éteindre la lumière' : 'Allumer la lumière');
    clic(false);
    if (on && flicker && !reduce) {
      body.classList.add('flicker');
      bourdon();
      setTimeout(() => body.classList.remove('flicker'), 70);
      setTimeout(() => body.classList.add('flicker'), 150);
      setTimeout(() => { body.classList.remove('flicker'); body.classList.add('on'); taper(); }, 230);
    } else {
      body.classList.toggle('on', on);
      if (on) taper();
    }
    cue.textContent = on ? 'Le courant passe.' : 'Appuyez pour allumer';
    drawPetit();
  }
  big.addEventListener('click', () => setLumiere(!allume, true));

  /* ---------- Le fil qui suit le défilement ---------- */
  const flows = document.querySelectorAll('.cable .flow');
  const dot = document.querySelector('.electron-dot');
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      const shown = allume ? Math.max(p, 0.04) : 0;
      flows.forEach(l => l.setAttribute('stroke-dashoffset', 1000 * (1 - shown)));
      dot.style.top = (shown * 100) + '%';
      dot.style.opacity = allume ? 1 : 0;
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  new MutationObserver(onScroll).observe(body, { attributes: true, attributeFilter: ['class'] });

  /* ---------- Composer une plaque ---------- */
  const G = P.GAMMES;
  const MECHS = [['simple', 'Simple allumage'], ['double', 'Double allumage'], ['va', 'Va-et-vient'], ['poussoir', 'Poussoir'], ['prise', 'Prise 2P+T'], ['tv', 'Prise TV'], ['tel', 'Prise téléphone']];
  const COULEURS = [['#2D3A4A', 'Ardoise'], ['#7E2F2A', 'Brique'], ['#2F5A4C', 'Cèdre'], ['#B08A2E', 'Laiton'], ['#F6F6F3', 'Blanc']];
  const REFS = { optima: { simple: 'OP001', double: 'OP003', poussoir: 'OP006' } };
  const st = { gamme: 'continuum', mech: 'simple', couleur: COULEURS[0][0], on: false };
  const atelier = document.querySelector('.atelier');
  const vue = atelier.querySelector('.vue');
  const etat = atelier.querySelector('.etat');
  const refEl = document.querySelector('.reglages .ref');
  const couleursBox = document.querySelector('.couleurs');

  const chips = (group, items, key) => {
    const box = document.querySelector(`[data-group="${group}"]`);
    box.innerHTML = items.map(([k, l]) => `<button data-k="${k}" aria-pressed="${st[key] === k}">${l}</button>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      st[key] = b.dataset.k;
      box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      clic(false); renderAtelier();
    });
  };
  chips('gamme', Object.entries(G).map(([k, v]) => [k, v.nom]), 'gamme');
  chips('mech', MECHS, 'mech');
  const sw = couleursBox.querySelector('.swatches');
  sw.innerHTML = COULEURS.map(([c, n]) => `<button style="background:${c}" data-c="${c}" aria-label="${n}" aria-pressed="${c === st.couleur}"></button>`).join('');
  sw.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st.couleur = b.dataset.c;
    sw.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    clic(false); renderAtelier();
  });

  const isSwitch = m => ['simple', 'double', 'va', 'poussoir'].includes(m);
  function renderAtelier() {
    couleursBox.hidden = st.gamme !== 'color';
    vue.innerHTML = P.plate({ gamme: st.gamme, mechs: [st.mech], on: st.on, frame: st.gamme === 'color' ? st.couleur : undefined });
    const lit = st.on && isSwitch(st.mech);
    atelier.classList.toggle('on', lit);
    etat.textContent = isSwitch(st.mech) ? (st.on ? 'Allumé' : 'Éteint, appuyez pour essayer') : 'Prise prête à brancher';
    const nomMech = MECHS.find(m => m[0] === st.mech)[1];
    const r = REFS[st.gamme] && REFS[st.gamme][st.mech];
    refEl.textContent = `${G[st.gamme].nom}, ${nomMech.toLowerCase()}` + (r ? `, réf. ${r}` : '');
  }
  const press = () => { if (!isSwitch(st.mech)) return; st.on = !st.on; clic(false); renderAtelier(); };
  atelier.addEventListener('click', press);
  atelier.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(); } });
  renderAtelier();

  /* ---------- Tableau électrique ---------- */
  const C = { diff: true, ecl: true, pri: true, cui: true, eau: true, clim: true };
  const NOMS = { ecl: 'Éclairage', pri: 'Prises', cui: 'Cuisine', eau: 'Chauffe-eau', clim: 'Climatisation' };
  const etiq = document.querySelector('.etiquettes');
  function applique() {
    Object.keys(NOMS).forEach(k => {
      const live = C.diff && C[k];
      document.querySelectorAll('.maison .c-' + k).forEach(el => el.classList.toggle('allume', live));
    });
    document.querySelectorAll('.levier').forEach(b => b.setAttribute('aria-pressed', C[b.dataset.c]));
    if (!C.diff) etiq.textContent = 'Différentiel déclenché : toute la maison est coupée. Relevez le levier pour réarmer.';
    else {
      const off = Object.keys(NOMS).filter(k => !C[k]).map(k => NOMS[k]);
      etiq.textContent = off.length ? 'Circuit coupé : ' + off.join(', ') + '.' : 'Tous les circuits sont alimentés.';
    }
  }
  document.querySelectorAll('.levier').forEach(b => b.addEventListener('click', () => {
    C[b.dataset.c] = !C[b.dataset.c]; clic(true); applique();
  }));
  document.querySelector('.test').addEventListener('click', () => {
    if (!C.diff) return;
    C.diff = false; clic(true); setTimeout(() => clic(true), 60); applique();
  });
  applique();

  /* ---------- Fin : éteindre ---------- */
  const petit = document.querySelector('.fin .petit');
  function drawPetit() { petit.innerHTML = P.plate({ gamme: 'continuum', mechs: ['simple'], on: allume }); petit.setAttribute('aria-label', allume ? 'Éteindre' : 'Rallumer'); }
  petit.addEventListener('click', () => setLumiere(!allume, false));
  drawPetit();
  onScroll();
})();
