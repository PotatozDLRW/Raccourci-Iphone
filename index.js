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

app.get('/api/schedule', async (req, res) => {
  try {
    const data = await ical.fromURL(ICS_URL, { defaultTimezone: 'Europe/Paris' });
    const all = Object.values(data).filter(e => e && e.type === 'VEVENT');

    const now = new Date();
    const todayKey = dateKeyParis(now);
    const weekday = weekdayParis(now); // ex: "mardi"

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

      todayEvents.push({
        summary: (e.summary || '').trim(),
        emoji: getEmoji(e.summary || ''),
        startMin,
        endMin,
        location: extractLocation(e)
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

    // Construire le texte
    let text = '';
    if (todayEvents.length) {
      const dayName = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      text += `🎉 Salut ! Voici ton programme pour aujourd'hui, ${dayName} :\n\n`;
      for (const ev of todayEvents) {
        const start = toHHMM(ev.startMin);
        const end = toHHMM(ev.endMin);
        const dur = formatDuration(ev.endMin - ev.startMin);
        const loc = ev.location ? ` 📍 ${ev.location}` : '';
        text += `${ev.emoji} ${start} - ${end} (${dur})\n   ${ev.summary}${loc}\n`;
      }
      text += `\n💪 Bonne journée et bon courage ! 🌟`;
    } else {
      const dayName = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      text = `Rien de prévu aujourd'hui (${dayName}) ! 🎉 Profite bien de ta journée libre !`;
    }

    res.json({ schedule: text, date: todayKey, count: todayEvents.length });
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