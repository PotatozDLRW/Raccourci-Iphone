module.exports = (req, res) => {
    res.status(200).json({ 
        message: "✅ Test API fonctionne !",
        timestamp: new Date().toISOString(),
        path: req.url
    });
};