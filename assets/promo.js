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
