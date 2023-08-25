// utils/graphClientHelper.js

const MicrosoftGraph = require('@microsoft/microsoft-graph-client');
const { getToken } = require('./msalHelper');

function initGraphClient(req, token) {
    return MicrosoftGraph.Client.init({
        authProvider: async (done) => {
            if(token){
                done(null, token);
            }
            else {
                try {
                    const token = await getToken(req, req.scopes);
                    done(null, token);  // Pass the token to the SDK
                } catch (error) {
                    done(error, null); // Pass the error if there's one
                }
            }
        }
    });
}

module.exports = {
    initGraphClient
};
