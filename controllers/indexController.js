// controllers/indexController.js

const { initGraphClient } = require('../utils/graphClientHelper');

exports.getIndex = async (req, res) => {

    if (req.session.accessToken) {
        const client = initGraphClient(req);

        try {
            const userDetails = await client.api('/me').select('id,displayName').get();
            res.render('index', { user: userDetails });
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else {
        res.render('index', {user: {}});
    }
};