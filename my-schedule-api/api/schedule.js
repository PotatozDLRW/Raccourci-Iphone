const fetch = require('node-fetch');
const ical = require('node-ical');

// L'URL de votre calendrier Outlook .ics
const ICS_URL = 'https://outlook.office365.com/owa/calendar/29140af7ee51428eac1e181824f9b023@cesi.fr/dc5dc8265ae4484e892dec582582180116350832411436285999/calendar.ics';

// --- Logique de Formatage (Gratuite) ---
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
    'pause déjeuner': '🍽️',
    'examen': '📝',
    'controle': '📝',
    'contrôle': '📝',
    'test': '📝',
    'tp': '🔬',
    'travaux pratiques': '🔬',
    'stage': '🎯',
    'entreprise': '🏢',
    'formation': '🎓',
    'conférence': '🎤',
    'présentation': '📊',
    'atelier': '🛠️',
    'workshop': '🛠️'
};

const getEmoji = (summary) => {
    const lowerSummary = (summary || '').toLowerCase();
    for (const [keyword, icon] of Object.entries(EMOJI_MAP)) {
        if (lowerSummary.includes(keyword)) {
            return icon;
        }
    }
    return '➡️'; // Emoji par défaut
};

// Fonction pour formater la durée
const formatDuration = (start, end) => {
    const duration = (end - start) / (1000 * 60); // durée en minutes
    if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`;
    }
    return `${duration}min`;
};

// ----------------------------------------

module.exports = async (req, res) => {
    // Configurer les headers CORS pour permettre les requêtes depuis l'iPhone
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Définir la date d'aujourd'hui sans l'heure pour la comparaison
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const isToday = (date) => {
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
    };

    try {
        console.log('🔄 Récupération du calendrier ICS...');
        
        // 1. Télécharger et Analyser l'ICS
        const data = await ical.fromURL(ICS_URL, { 
            defaultTimezone: 'Europe/Paris',
            timeout: 10000 // timeout de 10 secondes
        }); 
        
        console.log('📅 Analyse des événements...');
        const events = Object.values(data).filter(item => item.type === 'VEVENT');
        console.log(`📊 ${events.length} événements trouvés au total`);
        
        // 2. Filtrer les événements pour aujourd'hui
        const todayEvents = events.filter(event => {
            if (!event.start) return false;
            return isToday(event.start);
        });

        console.log(`🎯 ${todayEvents.length} événements trouvés pour aujourd'hui`);

        // 3. Ajouter automatiquement la pause déjeuner (sauf le jeudi)
        const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 4 = jeudi
        const isThursday = dayOfWeek === 4;
        
        if (!isThursday && todayEvents.length > 0) {
            // Créer un événement pause déjeuner automatique
            const lunchBreak = {
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30),
                summary: 'Pause déjeuner',
                type: 'VEVENT',
                isAutomatic: true
            };
            
            // Vérifier s'il n'y a pas déjà un événement qui chevauche cette période
            const hasLunchConflict = todayEvents.some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                const lunchStart = lunchBreak.start;
                const lunchEnd = lunchBreak.end;
                
                // Vérifier le chevauchement
                return (eventStart < lunchEnd && eventEnd > lunchStart);
            });
            
            // Ajouter la pause déjeuner seulement s'il n'y a pas de conflit
            if (!hasLunchConflict) {
                todayEvents.push(lunchBreak);
                console.log('🍽️ Pause déjeuner automatique ajoutée (12h30-13h30)');
            } else {
                console.log('⚠️ Pause déjeuner non ajoutée - conflit détecté avec un autre événement');
            }
        } else if (isThursday) {
            console.log('📅 Jeudi détecté - pas de pause déjeuner automatique');
        }

        // 4. Formater le résultat
        let scheduleText = '';
        
        if (todayEvents.length > 0) {
            // Trier les événements par heure de début
            todayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

            const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dateStr = today.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
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
                
                // Extraire les informations de lieu (plusieurs sources possibles)
                let locationInfo = '';
                if (event.location && event.location.trim()) {
                    locationInfo = ` 📍 ${event.location.trim()}`;
                } else if (event.description && event.description.includes('Salle')) {
                    // Chercher "Salle" dans la description
                    const salleMatch = event.description.match(/Salle[:\s]*([^\n\r,]+)/i);
                    if (salleMatch) {
                        locationInfo = ` 📍 Salle ${salleMatch[1].trim()}`;
                    }
                } else if (event.description && event.description.includes('Lieu')) {
                    // Chercher "Lieu" dans la description
                    const lieuMatch = event.description.match(/Lieu[:\s]*([^\n\r,]+)/i);
                    if (lieuMatch) {
                        locationInfo = ` 📍 ${lieuMatch[1].trim()}`;
                    }
                }
                
                const eventTitle = event.summary || 'Événement sans titre';
                
                // Formatage final sans Markdown, optimisé pour iPhone
                scheduleText += `${emoji} ${startTime} - ${endTime} (${duration})\n`;
                scheduleText += `   ${eventTitle}${locationInfo}\n`;
                
                // Ajouter une ligne vide entre les événements sauf pour le dernier
                if (index < todayEvents.length - 1) {
                    scheduleText += '\n';
                }
            });
            
            scheduleText += "\n\n💪 Bonne journée et bon courage ! 🌟";
            
        } else {
            const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
            scheduleText = `🎉 Rien de prévu aujourd'hui (${dayName.charAt(0).toUpperCase() + dayName.slice(1)}) !\n\n🏖️ Profite bien de ta journée libre ! ✨`;
        }
        
        console.log('✅ Formatage terminé, envoi de la réponse');
        
        // 4. Renvoyer le JSON
        res.status(200).json({
            success: true,
            date: today.toISOString().split('T')[0],
            eventsCount: todayEvents.length,
            schedule: scheduleText,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Erreur de traitement ICS:", error);
        
        let errorMessage = "⚠️ Erreur serveur. ";
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage += "Impossible de se connecter au calendrier. Vérifiez l'URL du calendrier.";
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage += "Timeout lors de la récupération du calendrier.";
        } else {
            errorMessage += "Vérifiez l'URL du calendrier ou le code Vercel.";
        }
        
        res.status(500).json({ 
            success: false,
            schedule: errorMessage,
            error: error.message,
            lastUpdated: new Date().toISOString()
        });
    }
};