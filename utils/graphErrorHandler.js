// /utils/graphErrorHandler.js

const handleGraphError = (error) => {
    if (error.body && typeof error.body.getReader === 'function') {
        const reader = error.body.getReader();
        reader.read().then((result) => {
            const text = new TextDecoder("utf-8").decode(result.value);
            console.error("Graph API detailed error:", text);
        });
    } else {
        console.error("Error:", error);
    }
};

module.exports = handleGraphError;
