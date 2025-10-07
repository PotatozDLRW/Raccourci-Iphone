// API temporaire à la racine pour tester Vercel
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Test simple sans récupération ICS
    const scheduleText = `🎉 Salut ! Test de l'API

📚 08:30 - 10:00 (1h30)
   Cours de test

☕ 12:30 - 13:30 (1h)
   Pause déjeuner

💪 Bonne journée ! 🌟`;

    res.status(200).json({
        success: true,
        schedule: scheduleText,
        message: "✅ API de test fonctionnelle !",
        timestamp: new Date().toISOString()
    });
};