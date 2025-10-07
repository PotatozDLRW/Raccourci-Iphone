// Test de l'API schedule.js à la racine
const scheduleHandler = require('./schedule.js');

// Mock des objets req et res
const mockReq = {
    method: 'GET'
};

const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log('🚀 Réponse de l\'API racine :');
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

console.log('🧪 Test de l\'API à la racine (schedule.js)...\n');

// Exécuter le test
scheduleHandler(mockReq, mockRes);