const express = require('express');
const ical = require('node-ical');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// URL ICS Outlook (publique)
const ICS_URL = 'https://outlook.office365.com/owa/calendar/29140af7ee51428eac1e181824f9b023@cesi.fr/dc5dc8265ae4484e892dec582582180116350832411436285999/calendar.ics';

// Emojis
const EMOJI_MAP = {
  'projet': '💻',
  'soutenance': '📢',
  'réunion': '👥',
  'cours': '📚',
  'td': '📖',
  'amphi': '🏛️',
  'pause': '☕',
  'dejeuner': '🍽️',
  'déjeuner': '🍽️',
  'examen': '📝',
  'tp': '🔬',
  'atelier': '🛠️',
  'présentation': '📊'
};

function getEmoji(summary = '') {
  const s = summary.toLowerCase();
  for (const [k, v] of Object.entries(EMOJI_MAP)) {
    if (s.includes(k)) return v;
  }
  return '➡️';
}

const dtfKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }); // YYYY-MM-DD
const dtfWeekday = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long' });
const dtfTime = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false });

function dateKeyParis(d) {
  return dtfKey.format(d);
}
function weekdayParis(d) {
  return dtfWeekday.format(d); // ex: "mardi"
}
function timePartsParis(d) {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
  return { h, m };
}
function toHHMM(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h${m}`;
  if (h) return `${h}h`;
  return `${m}min`;
}
function extractLocation(event) {
  let loc = (event.location || '').trim();
  if (!loc && event.description) {
    const m = /(?:Lieu|Salle)\s*:?\s*([^\n\r]+)/i.exec(event.description);
    if (m && m[1]) loc = m[1].trim();
  }
  return loc;
}

// Normalisation simple du texte (enlève HTML et espaces spéciaux)
function normalizeText(str = '') {
  return String(str)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Tente d'extraire une salle à partir d'une chaîne générique
function pickRoomFromString(input = '') {
  const s = normalizeText(input);
  if (!s) return '';
  let m;
  // 1) Mots-clés directs
  m = /(?:Salle|Room|Local|Lieu|Amphi|Bât(?:iment)?|Bat(?:iment)?)\s*[:\-]?\s*([^\n\r;|,]+)/i.exec(s);
  if (m && m[1]) return m[1].trim();
  // 2) Parenthèses avec contenu plausible (ex: B101, A203, LAB 2)
  m = /\(([A-Za-z]{1,4}\s?-?\d{1,4}[A-Za-z]?)\)/.exec(s);
  if (m && m[1]) return m[1].trim();
  // 3) Dernier segment après tirets ou barres avec longueur raisonnable
  const parts = s.split(/\s*[>|-]|\s\|\s|\s,\s/).map(t => t.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (last.length <= 24) return last;
  }
  return '';
}

// Essaie d'extraire la salle depuis le résumé
function extractRoomFromSummary(summary) {
  return pickRoomFromString(summary);
}

// Nettoie le résumé pour enlever la salle si on l'affiche séparément
function cleanSummary(summary) {
  if (!summary) return '';
  let s = normalizeText(summary);
  s = s.replace(/\((?:\s*(?:salle|room|local|lieu|amphi)\s*[:\-]?\s*)?[^()]+\)/gi, ' ').trim();
  s = s.replace(/[\-–]\s*(?:salle|room|local|lieu|amphi)\s*[:\-]?\s*[^\n\r]+$/gi, ' ').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

app.get('/api/schedule', async (req, res) => {
  try {
    const data = await ical.fromURL(ICS_URL, { defaultTimezone: 'Europe/Paris' });
    const all = Object.values(data).filter(e => e && e.type === 'VEVENT');

  const now = new Date();
  const todayKey = dateKeyParis(now);
  const weekday = weekdayParis(now); // ex: "mardi"
  const nowParts = timePartsParis(now);
  const nowMinParis = nowParts.h * 60 + nowParts.m;

    // Garder uniquement les événements qui commencent aujourd'hui (heure Paris)
    const todayEvents = [];
    for (const e of all) {
      if (!e.start || !e.end) continue;
      if (dateKeyParis(e.start) !== todayKey) continue;

      const startHM = timePartsParis(e.start);
      const endHM = timePartsParis(e.end);
      const startMin = startHM.h * 60 + startHM.m;
      const endMin = endHM.h * 60 + endHM.m;
      if (endMin <= startMin) continue;

  const rawSummary = (e.summary || '').trim();
  const locFromEvent = pickRoomFromString(e.location || '') || extractLocation(e);
  const locFromDesc = pickRoomFromString(e.description || '');
  const locFromSummary = extractRoomFromSummary(rawSummary);
  const location = (locFromEvent || locFromDesc || locFromSummary || '').trim();
      const summary = cleanSummary(rawSummary);

      todayEvents.push({
        summary,
        emoji: getEmoji(rawSummary),
        startMin,
        endMin,
        location
      });
    }

    // Ajouter la pause déjeuner 12:30-13:30 sauf jeudi (pas d’indication "ajouté automatiquement")
    const isThursday = weekday.toLowerCase() === 'jeudi';
    const LUNCH_START = 12 * 60 + 30;
    const LUNCH_END = 13 * 60 + 30;

    if (!isThursday) {
      const conflicts = todayEvents.some(ev => ev.startMin < LUNCH_END && ev.endMin > LUNCH_START);
      if (!conflicts) {
        todayEvents.push({
          summary: 'Pause déjeuner',
          emoji: getEmoji('pause dejeuner'),
          startMin: LUNCH_START,
          endMin: LUNCH_END,
          location: ''
        });
      }
    }

    // Trier chronologiquement
    todayEvents.sort((a, b) => a.startMin - b.startMin);

    // Construire le texte: une ligne par événement (idéal pour iPhone)
    let text = '';
    let lines = [];
    const dayName = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const dateFR = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris' }).format(new Date());

    if (todayEvents.length) {
      lines.push(`📅 Aujourd'hui — ${dayName} ${dateFR}`);
      for (const ev of todayEvents) {
        const start = toHHMM(ev.startMin);
        const end = toHHMM(ev.endMin);
        const dur = formatDuration(ev.endMin - ev.startMin);
        const pin = ev.location ? ` • 📍 ${ev.location}` : '';
        const nowFlag = (nowMinParis >= ev.startMin && nowMinParis < ev.endMin) ? '🟢 ' : '';
        lines.push(`${nowFlag}${ev.emoji} ${start}–${end} • ${ev.summary}${pin} • ⏱️ ${dur}`);
      }
      // Ajoute un saut de ligne entre chaque événement dans 'schedule' pour meilleure lisibilité iPhone
      const header = lines[0];
      const eventLines = lines.slice(1);
      const spacedLines = [header, ''];
      eventLines.forEach((ln, i) => {
        spacedLines.push(ln);
        if (i !== eventLines.length - 1) spacedLines.push('');
      });
      text = spacedLines.join('\n');
      // Expose aussi la version espacée séparément si besoin
      res.locals.linesSpaced = spacedLines;
    } else {
      text = `Rien de prévu aujourd'hui (${dayName}) ! 🎉`;
      lines = [text];
    }

  res.json({ schedule: text, date: todayKey, count: todayEvents.length, lines, linesSpaced: res.locals.linesSpaced });
  } catch (err) {
    console.error('Erreur /api/schedule:', err);
    res.status(500).json({ schedule: "⚠️ Erreur serveur. Vérifie l'URL ICS ou réessaie." });
    return;
  }
});

// Test
app.get('/test', (req, res) => {
  res.json({ ok: true, now: new Date().toISOString(), tip: 'GET /api/schedule' });
});

// Alias pratique
app.get('/schedule', (req, res) => res.redirect(302, '/api/schedule'));

// Racine: redirige vers l'emploi du temps
app.get('/', (req, res) => res.redirect(302, '/api/schedule'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;