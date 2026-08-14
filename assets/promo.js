// Popup promozionale MedWorks.
// PER CAMBIARE IL PRODOTTO PROMOSSO SI MODIFICA SOLO IL BLOCCO QUI SOTTO.
// Le 65 guide non vanno toccate. GitHub Pages propaga la modifica entro ~10 minuti.
export const PROMO = {
  attivo: true,
  immagine: '/assets/promo/masterclass-ecografia.jpg',
  alt: 'Masterclass di ecografia LinkMed',
  link: 'https://www.medworks.it/corsi/p/masterclassecografia',
  utm: '?utm_source=guide&utm_medium=popup&utm_campaign=masterclass-ecografia',
  ogniQuanteGuide: 4
};

const CHIAVE = 'mw_promo';
// Voci che finiscono con un punto (es. 'google.') sono etichette di dominio:
// corrispondono a una label intera dell'hostname, con qualunque TLD (google.it, google.co.uk).
// Voci senza punto finale (es. 'chatgpt.com') sono domini completi:
// corrispondono all'hostname esatto o a un suo sottodominio.
const MOTORI = ['google.', 'bing.', 'duckduckgo.', 'ecosia.', 'yahoo.', 'chatgpt.com', 'perplexity.ai'];

export function daMotore(referrer) {
  if (!referrer) return false;
  let host;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return false;
  }
  return MOTORI.some((m) =>
    m.endsWith('.')
      ? host.split('.').includes(m.slice(0, -1))
      : host === m || host.endsWith('.' + m)
  );
}

// contatore: numero di guide aperte dall'ultimo popup, oppure null se non è mai stato mostrato.
// Restituisce se mostrare il popup e il contatore da riscrivere.
export function decidi(cfg, contatore, referrer) {
  if (!cfg.attivo || !cfg.immagine) return { mostra: false, contatore };
  if (daMotore(referrer)) return { mostra: false, contatore };
  if (contatore === null) return { mostra: true, contatore: 0 };
  const n = contatore + 1;
  if (n >= cfg.ogniQuanteGuide) return { mostra: true, contatore: 0 };
  return { mostra: false, contatore: n };
}

/* ---------- Da qui in giù: solo browser ---------- */

const CSS = `
.mw-promo{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.82);
  display:flex;align-items:center;justify-content:center;padding:16px;
  -webkit-tap-highlight-color:transparent}
.mw-promo img{max-width:100%;max-height:82vh;width:auto;height:auto;
  object-fit:contain;border-radius:10px;cursor:pointer;display:block}
.mw-promo-x{position:fixed;top:calc(env(safe-area-inset-top, 0px) + 12px);right:12px;
  width:44px;height:44px;border-radius:50%;border:none;background:#fff;color:#111;
  font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;
  justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.35)}
.mw-promo-x:focus-visible{outline:3px solid #4C9AFF;outline-offset:2px}
body.mw-promo-open{overflow:hidden}
`;

function leggiContatore() {
  try {
    const v = localStorage.getItem(CHIAVE);
    if (v === null) return null;
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null; // navigazione privata restrittiva: si comporta come "mai visto"
  }
}

function scriviContatore(n) {
  try {
    if (n !== null) localStorage.setItem(CHIAVE, String(n));
  } catch {
    /* niente da fare */
  }
}

function mostra(cfg) {
  const overlay = document.createElement('div');
  overlay.className = 'mw-promo';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', cfg.alt);

  const img = document.createElement('img');
  img.src = cfg.immagine;
  img.alt = cfg.alt;

  const x = document.createElement('button');
  x.className = 'mw-promo-x';
  x.type = 'button';
  x.setAttribute('aria-label', 'Chiudi');
  x.textContent = '✕';

  function chiudi() {
    overlay.remove();
    x.remove();
    document.body.classList.remove('mw-promo-open');
    document.removeEventListener('keydown', suTasto);
  }

  function suTasto(e) {
    if (e.key === 'Escape') chiudi();
  }

  img.addEventListener('click', () => {
    try {
      if (window.umami) window.umami.track('promo-click', { campagna: cfg.alt });
    } catch {
      /* analytics assente: non deve mai bloccare il click */
    }
    window.open(cfg.link + cfg.utm, '_blank', 'noopener');
  });

  x.addEventListener('click', chiudi);
  document.addEventListener('keydown', suTasto);
  // Il click sul fondo NON chiude: chiusura attiva richiesta da Alessandro.
  overlay.addEventListener('click', (e) => e.stopPropagation());

  // Se l'immagine non carica, il popup non deve restare come schermo nero.
  img.addEventListener('error', chiudi);

  const stile = document.createElement('style');
  stile.textContent = CSS;
  document.head.appendChild(stile);

  overlay.appendChild(img);
  document.body.appendChild(overlay);
  document.body.appendChild(x);
  document.body.classList.add('mw-promo-open');
  x.focus();
}

function avvia() {
  const esito = decidi(PROMO, leggiContatore(), document.referrer);
  scriviContatore(esito.contatore);
  if (esito.mostra) mostra(PROMO);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avvia);
  } else {
    avvia();
  }
}
