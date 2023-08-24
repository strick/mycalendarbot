const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {

    const message = req.body.message;

    // For simplicity, let's just echo back the received message:
    const responseMessage = `Received: ${message}`;

    const { getOpenAIResponseConverstation} = require('./openaiHandler');
    const response = await getOpenAIResponseConverstation(responseMessage);

    console.log(response);

    // Send back a response
    res.json({ response: response.choices[0].message.content });
});

module.exports = router;
