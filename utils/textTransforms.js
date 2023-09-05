const { JSDOM } = require('jsdom');

function stripHtml(html) {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || "";
}

function transformTeamsMeetingText(text){
    return text.replace(/____[\s\S]*?________________________________________________________________________________/,
    '**Microsoft Teams Meeting**');
}

module.exports = { stripHtml, transformTeamsMeetingText };
