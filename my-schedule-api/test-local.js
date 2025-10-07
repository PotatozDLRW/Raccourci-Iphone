// Test local de l'API (optionnel)
// Pour tester : node test-local.js

const scheduleHandler = require('./api/schedule.js');

// Mock des objets req et res pour tester localement
const mockReq = {
    method: 'GET'
};

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

console.log('🧪 Test de l\'API Schedule...\n');

// Exécuter le test
scheduleHandler(mockReq, mockRes)
    .catch(error => {
        console.error('❌ Erreur lors du test:', error);
    });