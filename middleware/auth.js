function ensureScope(scope) {

    console.log("Ensuring scope");
    // Attach the scope directly to the req object. This way, each request will have its own set of scopes
    return (req, res, next) => {
        if (!req.scopes) {
            req.scopes = [];
        }
        if (!req.scopes.some(s => s.toLowerCase() === scope.toLowerCase())) {
            req.scopes.push(scope);
        }
        next();
    };
}


function checkLoginStatus(req, res, next) {
    console.log("checking log8in");
    res.locals.isLoggedIn = req.session && req.session.msalAccount;
    next();
}

module.exports = {
    ensureScope,
    checkLoginStatus
};
