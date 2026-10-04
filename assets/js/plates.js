/* Plaques BMS dessinées en SVG — visuels d'illustration en attendant les photos produits */
(function () {
  let uid = 0;

  const GAMMES = {
    continuum: { nom: 'Continuum', rx: 26, frame: '#F6F6F3', key: '#FBFBF9', edge: '#D9DAD5' },
    color:     { nom: 'Continuum Color', rx: 26, frame: '#2D3A4A', key: '#F6F6F3', edge: '#1E2833' },
    optima:    { nom: 'Optima', rx: 44, frame: '#F4F4F0', key: '#FAFAF7', edge: '#D6D6D0' },
    kbs:       { nom: 'KBS Silverline', rx: 22, frame: '#F3F3F1', key: '#FAFAF8', edge: '#CFCFCB', line: '#A9ADB2' },
    eco:       { nom: 'Eco Plus', rx: 12, frame: '#F2F2EE', key: '#F7F7F4', edge: '#D3D3CD' },
    apolo:     { nom: 'Apolo', rx: 90, frame: '#F5F5F2', key: '#FBFBF9', edge: '#D5D5D0' },
    etoile:    { nom: 'Etoile', rx: 34, frame: '#ECEAE4', key: '#F7F6F2', edge: '#CFCBC2' },
    etanche:   { nom: 'Série étanche', rx: 30, frame: '#9AA0A6', key: '#C7CBCF', edge: '#7D838A' }
  };

  function mech(type, x, y, w, h, c, on, id) {
    const cx = x + w / 2, cy = y + h / 2;
    const shadeTop = on ? '#E4E4DF' : '#FFFFFF';
    const shadeBot = on ? '#FFFFFF' : '#E1E1DC';
    const grad = `<linearGradient id="k${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shadeTop}"/><stop offset="1" stop-color="${shadeBot}"/></linearGradient>`;
    const rocker = (rx, ry, rw, rh) =>
      `<rect class="rocker" x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="${Math.min(rw, rh) * 0.14}" fill="url(#k${id})" stroke="${c.edge}" stroke-width="1"/>` +
      `<line x1="${rx + rw * 0.38}" x2="${rx + rw * 0.62}" y1="${ry + (on ? rh * 0.78 : rh * 0.22)}" y2="${ry + (on ? rh * 0.78 : rh * 0.22)}" stroke="${c.edge}" stroke-width="2" stroke-linecap="round"/>`;
    const socketRecess = (r) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.key}" stroke="${c.edge}"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${r * 0.84}" fill="#E9E9E4"/>`;
    switch (type) {
      case 'double':
        return grad + rocker(x, y, w / 2 - 2, h) + rocker(x + w / 2 + 2, y, w / 2 - 2, h);
      case 'va':
        return grad + rocker(x, y, w, h) +
          `<path d="M${cx - 9} ${y + h - 14} l-6 4 6 4 M${cx + 9} ${y + h - 14} l6 4 -6 4" fill="none" stroke="${c.edge}" stroke-width="1.6"/>`;
      case 'poussoir':
        return grad + rocker(x, y, w, h) + `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${c.edge}" stroke-width="1.6"/>`;
      case 'voyant':
        return grad + rocker(x, y, w, h) + `<circle class="led" cx="${cx}" cy="${y + 14}" r="3.4" fill="${on ? '#F2A33A' : '#C9B79C'}"/>`;
      case 'sonnette':
        return grad + rocker(x, y, w, h) +
          `<path d="M${cx - 7} ${cy + 5} q0 -13 7 -13 q7 0 7 13 z M${cx - 2} ${cy + 7} h4" fill="none" stroke="${c.edge}" stroke-width="1.6"/>`;
      case 'prise':
        return socketRecess(Math.min(w, h) * 0.5) +
          `<circle cx="${cx - 11}" cy="${cy}" r="4.2" fill="#3A3C3F"/><circle cx="${cx + 11}" cy="${cy}" r="4.2" fill="#3A3C3F"/>` +
          `<rect x="${cx - 4}" y="${cy - Math.min(w, h) * 0.42}" width="8" height="5" rx="1" fill="#B8BCC0"/>` +
          `<rect x="${cx - 4}" y="${cy + Math.min(w, h) * 0.42 - 5}" width="8" height="5" rx="1" fill="#B8BCC0"/>`;
      case 'tv':
        return socketRecess(Math.min(w, h) * 0.5) +
          `<circle cx="${cx}" cy="${cy}" r="11" fill="#D8D8D2" stroke="#9DA1A5"/><circle cx="${cx}" cy="${cy}" r="2.6" fill="#3A3C3F"/>`;
      case 'tel':
        return `<rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="10" fill="${c.key}" stroke="${c.edge}"/>` +
          `<rect x="${cx - 12}" y="${cy - 9}" width="24" height="18" rx="2" fill="#3A3C3F"/><rect x="${cx - 5}" y="${cy + 7}" width="10" height="4" fill="#3A3C3F"/>`;
      default:
        return grad + rocker(x, y, w, h);
    }
  }

  /* opts: { gamme, mechs:[type...], on:bool, frame:hex (optionnel) } */
  function plate(opts) {
    const id = ++uid;
    const g = GAMMES[opts.gamme] || GAMMES.continuum;
    const c = Object.assign({}, g, opts.frame ? { frame: opts.frame } : {});
    const mechs = opts.mechs && opts.mechs.length ? opts.mechs : ['simple'];
    const n = mechs.length;
    const W = 200 + (n - 1) * 150, H = 200;
    const rx = Math.min(c.rx, 90);
    let inner = '';
    mechs.forEach((m, i) => {
      inner += mech(m, 52 + i * 150, 52, 96, 96, c, !!opts.on, id + '_' + i);
    });
    const kbsLine = c.line
      ? `<rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="${Math.max(rx - 8, 4)}" fill="none" stroke="${c.line}" stroke-width="3"/>`
      : '';
    return `<svg class="plate" viewBox="0 0 ${W} ${H}" role="img" aria-label="Plaque ${g.nom}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="f${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></linearGradient></defs>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="${rx}" fill="${c.frame}" stroke="${c.edge}" stroke-width="1.2"/>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="${rx}" fill="url(#f${id})"/>
${kbsLine}${inner}</svg>`;
  }

  window.BMSPlates = { plate, GAMMES };
})();
