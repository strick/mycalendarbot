// controllers/indexController.js

const { initGraphClient } = require('../utils/graphClientHelper');
const { getToken } = require('../utils/msalHelper'); // Assuming you have a helper to get token
const jwt = require('jsonwebtoken');


exports.getIndex = async (req, res) => {

    if (req.session.accessToken) {
        
        try {

            const accessToken = await getToken(req, ["User.Read"]);
            const client = initGraphClient(req, accessToken);

            // Decode the JWT token
            const decodedToken = jwt.decode(req.session.accessToken);
            const grantedScopes = decodedToken.scp.split(' ');
       
            const userDetails = await client.api('/me').select('id,displayName').get();

            console.log(grantedScopes);

            req.session.username = userDetails.displayName;
            res.render('index', { user: userDetails, grantedPermissions: grantedScopes });

        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else {
        res.render('index', {user: null, grantedPermissions: []});
    }
};