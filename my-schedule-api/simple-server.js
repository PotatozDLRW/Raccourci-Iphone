// Version simplifiée pour Railway - Debug
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware basique
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Route de test ultra simple
app.get('/test', (req, res) => {
    res.json({ 
        message: "✅ Railway fonctionne !",
        timestamp: new Date().toISOString()
    });
});

// API simplifiée sans node-ical pour tester
app.get('/api/schedule', (req, res) => {
    const scheduleText = `🎉 Salut ! Voici ton programme pour aujourd'hui :

📚 08:30 - 10:00 (1h30)
   Cours de test

🛠️ 10:30 - 12:30 (2h)
   Atelier test 📍 Salle 103

☕ 12:30 - 13:30 (1h) 
   Pause déjeuner

💻 13:30 - 15:00 (1h30)
   Projet test

💪 Bonne journée et bon courage ! 🌟`;

    res.json({
        success: true,
        schedule: scheduleText,
        message: "API Railway simplifiée",
        timestamp: new Date().toISOString()
    });
});

// Route identique sur /schedule
app.get('/schedule', (req, res) => {
    const scheduleText = `🎉 Salut ! Voici ton programme pour aujourd'hui :

📚 08:30 - 10:00 (1h30)
   Cours de test

🛠️ 10:30 - 12:30 (2h)
   Atelier test 📍 Salle 103

☕ 12:30 - 13:30 (1h)
   Pause déjeuner

💻 13:30 - 15:00 (1h30)
   Projet test

💪 Bonne journée et bon courage ! 🌟`;

    res.json({
        success: true,
        schedule: scheduleText,
        message: "API Railway simplifiée",
        timestamp: new Date().toISOString()
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: "🚂 API Schedule Railway - Version Simple",
        status: "✅ Fonctionnelle",
        endpoints: [
            "/test - Test basique",
            "/api/schedule - Emploi du temps", 
            "/schedule - Emploi du temps"
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚂 Railway API simple démarrée sur le port ${PORT}`);
});

module.exports = app;