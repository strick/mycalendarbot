// controllers/indexController.js

const { initGraphClient } = require('../utils/graphClientHelper');

exports.getIndex = (req, res) => {
    res.render('index');
};

exports.getHome = async (req, res) => {
    if (req.query.code) {
        const client = initGraphClient(req);

        try {
            const userDetails = await client.api('/me').select('id,displayName').get();
            res.render('home', { user: userDetails });
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else {
        res.render('home');
    }
};
