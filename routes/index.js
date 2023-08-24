const express = require('express');
const router = express.Router();
const { ensureScope } = require('../middleware/auth');
const { initGraphClient } = require('../utils/graphClientHelper');

router.get("/", (req, res) => {

    res.render('index');
});

router.get('/home', ensureScope('user.read'), async (req, res) => {
    if (req.query.code) {

        // After acquiring the token, use it to fetch user details:
        // Initialize Graph client with a function as the authProvider
        const client = initGraphClient(req);

        try {
            const userDetails = await client.api('/me').select('id,displayName').get();
            res.render('home', { user: userDetails }); // Render the page with user details
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else {
        // Render your normal homepage or login page
        res.render('home');
    }
});

module.exports = router;