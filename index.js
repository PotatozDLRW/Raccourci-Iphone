const express = require('express');
const ical = require('node-ical');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

// URL de votre calendrier CESI
const ICS_URL = 'https://outlook.office365.com/owa/calendar/29140af7ee51428eac1e181824f9b023@cesi.fr/dc5dc8265ae4484e892dec582582180116350832411436285999/calendar.ics';

// Emojis pour les cours
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

const getEmoji = (summary) => {
    const lowerSummary = (summary || '').toLowerCase();
    for (const [keyword, icon] of Object.entries(EMOJI_MAP)) {
        if (lowerSummary.includes(keyword)) {
            return icon;
        }
    }
    return '➡️';
};

const formatDuration = (start, end) => {
    const duration = (end - start) / (1000 * 60);
    if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`;
    }
    return `${duration}min`;
};

// API principale
app.get('/api/schedule', async (req, res) => {
    try {
        console.log('🔄 Récupération du calendrier...');
        
        // Date d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Récupérer et analyser le calendrier
        const data = await ical.fromURL(ICS_URL, { 
            defaultTimezone: 'Europe/Paris',
            timeout: 8000
        });
        
        const events = Object.values(data).filter(item => item.type === 'VEVENT');
        
        // Filtrer les événements d'aujourd'hui
        const todayEvents = events.filter(event => {
            if (!event.start) return false;
            const eventDate = new Date(event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        });

        console.log(`📅 ${todayEvents.length} événements trouvés pour aujourd'hui`);

        // Ajouter pause déjeuner (sauf jeudi)
        const dayOfWeek = today.getDay();
        const isThursday = dayOfWeek === 4;
        
        if (!isThursday && todayEvents.length > 0) {
            const lunchBreak = {
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30),
                summary: 'Pause déjeuner',
                type: 'VEVENT'
            };
            
            const hasLunchConflict = todayEvents.some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return (eventStart < lunchBreak.end && eventEnd > lunchBreak.start);
            });
            
            if (!hasLunchConflict) {
                todayEvents.push(lunchBreak);
                console.log('☕ Pause déjeuner ajoutée');
            }
        }

        // Formater le résultat
        let scheduleText = '';
        
        if (todayEvents.length > 0) {
            todayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

            const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dateStr = today.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long'
            });
            
            scheduleText += `🎉 Salut ! Voici ton programme pour ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateStr} :\n\n`;

            todayEvents.forEach((event, index) => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                
                const startTime = start.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Europe/Paris'
                });
                const endTime = end.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Europe/Paris'
                });
                
                const emoji = getEmoji(event.summary || '');
                const duration = formatDuration(start, end);
                
                // Extraire lieu/salle
                let locationInfo = '';
                if (event.location && event.location.trim()) {
                    locationInfo = ` 📍 ${event.location.trim()}`;
                }
                
                const eventTitle = event.summary || 'Événement sans titre';
                
                scheduleText += `${emoji} ${startTime} - ${endTime} (${duration})\n`;
                scheduleText += `   ${eventTitle}${locationInfo}\n`;
                
                if (index < todayEvents.length - 1) {
                    scheduleText += '\n';
                }
            });
            
            scheduleText += "\n\n💪 Bonne journée et bon courage ! 🌟";
            
        } else {
            const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
            scheduleText = `🎉 Rien de prévu aujourd'hui (${dayName.charAt(0).toUpperCase() + dayName.slice(1)}) !\n\n🏖️ Profite bien de ta journée libre ! ✨`;
        }
        
        console.log('✅ Formatage terminé');
        
        res.json({
            success: true,
            eventsCount: todayEvents.length,
            schedule: scheduleText,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ 
            success: false,
            schedule: "⚠️ Erreur lors de la récupération de l'emploi du temps. Réessayez dans quelques instants.",
            error: error.message
        });
    }
});

// Route de test
app.get('/test', (req, res) => {
    res.json({ 
        message: "✅ API fonctionnelle !",
        timestamp: new Date().toISOString()
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: "📅 API Emploi du Temps CESI",
        endpoints: [
            "/api/schedule - Emploi du temps du jour",
            "/test - Test de l'API"
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API démarrée sur le port ${PORT}`);
});

module.exports = app;