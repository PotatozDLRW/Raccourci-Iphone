// Serveur Express pour Railway
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import de votre API
const scheduleHandler = require('./api/schedule.js');

// Wrapper pour Express
const wrapHandler = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            console.error('Erreur API:', error);
            res.status(500).json({
                success: false,
                schedule: "⚠️ Erreur serveur. Réessayez dans quelques instants.",
                error: error.message
            });
        }
    };
};

// Routes
app.get('/api/schedule', wrapHandler(scheduleHandler));
app.get('/schedule', wrapHandler(scheduleHandler));

// Route de test
app.get('/test', (req, res) => {
    res.json({ 
        message: "✅ Railway API fonctionne !",
        timestamp: new Date().toISOString(),
        urls: {
            api: "/api/schedule",
            simple: "/schedule"
        }
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: "🚂 API Schedule Railway",
        endpoints: [
            "/api/schedule - Emploi du temps complet",
            "/schedule - Emploi du temps complet", 
            "/test - Test de l'API"
        ]
    });
});

app.listen(PORT, () => {
    console.log(`� Railway API démarrée sur le port ${PORT}`);
    console.log(`📅 Endpoints disponibles :`);
    console.log(`   - /api/schedule`);
    console.log(`   - /schedule`);
    console.log(`   - /test`);
});