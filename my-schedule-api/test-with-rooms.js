// Test avec des données fictives pour tester l'affichage des salles
const scheduleHandler = require('./api/schedule.js');

// Mock avec des événements qui contiennent des informations de lieu
const mockEvents = [
    {
        type: 'VEVENT',
        start: new Date(2025, 9, 7, 8, 30), // 7 octobre 2025, 8h30
        end: new Date(2025, 9, 7, 10, 0),   // 10h00
        summary: 'Cours de Programmation',
        location: 'Salle A204'
    },
    {
        type: 'VEVENT', 
        start: new Date(2025, 9, 7, 10, 15), // 10h15
        end: new Date(2025, 9, 7, 12, 0),    // 12h00
        summary: 'Atelier Agile',
        description: 'Atelier pratique\nLieu: Salle B301\nMatériel requis: PC portable'
    },
    {
        type: 'VEVENT',
        start: new Date(2025, 9, 7, 14, 0),  // 14h00
        end: new Date(2025, 9, 7, 16, 0),   // 16h00
        summary: 'Projet tutoré',
        description: 'Travail en groupe\nSalle : Lab Informatique'
    }
];

// Override de la fonction fromURL pour utiliser nos données de test
const originalIcal = require('node-ical');
originalIcal.fromURL = async (url, options) => {
    console.log('🧪 Utilisation des données de test...');
    
    // Simuler la structure de données de node-ical
    const mockData = {};
    mockEvents.forEach((event, index) => {
        mockData[`event${index}`] = event;
    });
    
    return mockData;
};

// Mock des objets req et res
const mockReq = { method: 'GET' };
const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log('🚀 Réponse de l\'API :');
            console.log('📊 Status Code:', code);
            console.log('📄 Data:', JSON.stringify(data, null, 2));
            
            if (data.schedule) {
                console.log('\n📅 Planning formaté :');
                console.log(data.schedule);
            }
        }
    }),
    setHeader: () => {},
    end: () => {}
};

console.log('🧪 Test avec données fictives pour vérifier l\'affichage des salles...\n');

// Exécuter le test
scheduleHandler(mockReq, mockRes)
    .catch(error => {
        console.error('❌ Erreur lors du test:', error);
    });