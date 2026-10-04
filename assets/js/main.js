(function () {
  const P = window.BMSPlates;
  const page = document.body.dataset.page || '';
  const root = document.body.dataset.root || '';

  /* En-tête, pied, bandeau démo et pastille */
  const links = [
    ['gammes.html', 'Gammes', 'gammes'],
    ['produit.html', 'Optima', 'produit'],
    ['revendeurs.html', 'Revendeurs', 'revendeurs'],
    ['contact.html', 'Contact', 'contact']
  ];
  const navHTML = links.map(([h, t, k]) => `<a href="${root}${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const logo = `<a class="logo" href="${root}index.html" aria-label="BMS Electric, accueil"><b>BMS</b><span>electric<br>Alger</span></a>`;
  const header = document.createElement('header');
  header.className = 'top';
  header.innerHTML = `<div class="wrap">${logo}<nav class="nav" aria-label="Navigation principale">${navHTML}</nav>
  <button class="burger" aria-label="Ouvrir le menu" aria-expanded="false"><span></span></button></div>
  <nav class="menu-mobile" aria-label="Menu mobile"><a href="${root}index.html">Accueil</a>${navHTML}</nav>`;
  document.body.prepend(header);
  const burger = header.querySelector('.burger');
  const mm = header.querySelector('.menu-mobile');
  burger.addEventListener('click', () => {
    const open = mm.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  const footer = document.createElement('footer');
  footer.innerHTML = `<div class="wrap">
    <div>${logo}<p style="margin-top:14px;max-width:40ch">Fabricant algérien d'appareillages et d'accessoires électriques depuis 2001.</p></div>
    <div><b style="color:#fff">Showroom</b><br>Route de Douéra, Baba Hassen, Alger<br><br><b style="color:#fff">Usine</b><br>Rue Hamidi Saïd, Birkhadem, Alger</div>
    <div><a href="tel:+213660571693">+213 660 57 16 93</a><br><a href="tel:028323110">028 32 31 10</a><br><a href="mailto:contact@bms-electric.com">contact@bms-electric.com</a><br><br>
    <a href="https://www.facebook.com/bmselectric/" target="_blank" rel="noopener">Facebook</a> &nbsp; <a href="https://www.instagram.com/bmselectricdz/" target="_blank" rel="noopener">Instagram</a> &nbsp; <a href="https://www.linkedin.com/company/bmselectric/" target="_blank" rel="noopener">LinkedIn</a></div>
    <small>© BMS Electric. Maquette de proposition réalisée par Webminds.</small></div>`;
  document.body.append(footer);

  const demo = document.createElement('div');
  demo.className = 'demo';
  demo.textContent = 'Maquette de démonstration réalisée par Webminds · aucun formulaire n\u2019est enregistré';
  document.body.append(demo);

  const sw = document.createElement('a');
  sw.className = 'switcher';
  sw.href = root + 'courant/index.html';
  sw.innerHTML = '<span class="dot"></span>Découvrir la version immersive';
  document.body.append(sw);

  /* Formulaires factices */
  document.querySelectorAll('form.fake').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const ok = f.querySelector('.ok');
      if (ok) { ok.classList.add('show'); ok.focus(); }
      f.querySelectorAll('input,textarea').forEach(i => { if (i.type !== 'submit') i.value = ''; });
    });
  });

  /* Plaques statiques : <div data-plate="optima" data-mechs="simple,prise"> */
  document.querySelectorAll('[data-plate]').forEach(el => {
    el.innerHTML = P.plate({ gamme: el.dataset.plate, mechs: (el.dataset.mechs || 'simple').split(','), frame: el.dataset.frame });
  });

  /* Hero : l'interrupteur allume la scène */
  const stage = document.querySelector('.hero-stage');
  if (stage) {
    const btn = stage.querySelector('.hero-plate');
    let on = false;
    const draw = () => { btn.innerHTML = P.plate({ gamme: 'continuum', mechs: ['simple'], on }); };
    draw();
    btn.addEventListener('click', () => {
      on = !on; draw();
      stage.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', on);
      const hint = stage.querySelector('.hero-hint');
      if (hint) hint.textContent = on ? 'Allumé. Interrupteur simple allumage, gamme Continuum.' : 'Appuyez sur l\u2019interrupteur.';
    });
  }

  /* Configurateur Optima */
  const conf = document.querySelector('[data-configurateur]');
  if (conf) {
    const view = conf.querySelector('.cview');
    const label = conf.querySelector('.clabel');
    const state = { mech: 'simple', on: false };
    const names = { simple: 'Interrupteur simple allumage, réf. OP001', double: 'Interrupteur double allumage, réf. OP003', poussoir: 'Bouton poussoir, réf. OP006', voyant: 'Bouton poussoir avec voyant, réf. OP007', combo: 'Prise terre + interrupteur, réf. OPT115' };
    const render = () => {
      const mechs = state.mech === 'combo' ? ['simple', 'prise'] : [state.mech];
      view.innerHTML = P.plate({ gamme: 'optima', mechs, on: state.on });
      label.textContent = names[state.mech];
    };
    conf.querySelectorAll('[data-mech]').forEach(b => b.addEventListener('click', () => {
      state.mech = b.dataset.mech;
      conf.querySelectorAll('[data-mech]').forEach(x => x.setAttribute('aria-pressed', x === b));
      render();
    }));
    view.addEventListener('click', () => { state.on = !state.on; render(); });
    render();
  }

  /* Calculateur */
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const rooms = { chambre: 2, sejour: 1, cuisine: 1, sdb: 1, couloir: 1 };
    const R = {
      chambre: { prise: 3, simple: 1 },
      sejour: { prise: 5, tv: 1, va: 2 },
      cuisine: { prise: 6, simple: 1 },
      sdb: { prise: 1, double: 1 },
      couloir: { prise: 1, va: 2 }
    };
    const out = calc.querySelector('.resultat ul');
    const compute = () => {
      const t = { simple: 0, double: 0, va: 0, prise: 0, tv: 0, sonnette: 1 };
      Object.keys(rooms).forEach(k => Object.entries(R[k]).forEach(([m, n]) => { t[m] += n * rooms[k]; }));
      const rows = [
        ['Prises 2P+T', t.prise], ['Interrupteurs simple allumage', t.simple], ['Interrupteurs va-et-vient', t.va],
        ['Interrupteurs double allumage', t.double], ['Prises TV', t.tv], ['Commande de sonnette', t.sonnette]
      ].filter(r => r[1] > 0);
      const total = rows.reduce((s, r) => s + r[1], 0);
      out.innerHTML = rows.map(([l, n]) => `<li><span>${l}</span><strong>${n}</strong></li>`).join('') +
        `<li style="border:0"><span>Total appareillages</span><strong>${total}</strong></li>`;
    };
    calc.querySelectorAll('.stepper').forEach(s => {
      const k = s.dataset.room, o = s.querySelector('output');
      o.value = rooms[k];
      s.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        rooms[k] = Math.max(0, Math.min(12, rooms[k] + Number(b.dataset.d)));
        o.value = rooms[k]; compute();
      }));
    });
    compute();
  }

  /* Wilayas */
  const W = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\u2019Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M\u2019Ghair','El Meniaa'];
  document.querySelectorAll('select[data-wilayas]').forEach(s => {
    s.innerHTML = '<option value="">Choisir une wilaya</option>' + W.map((w, i) => `<option>${String(i + 1).padStart(2, '0')} ${w}</option>`).join('');
  });
})();
