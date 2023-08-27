// controllers/chatController.js

const { getOpenAIResponseConverstation } = require('../utils/openaiHandler'); // Assuming that the path is correct

exports.postMessage = async (req, res) => {
    const message = req.body.message;
    const responseMessage = `Received: ${message}`;
    const response = await getOpenAIResponseConverstation(responseMessage, req.session.username);

    res.json({ response: response.choices[0].message.content });
};
