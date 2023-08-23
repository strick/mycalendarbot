// auth
module.exports = {
    ensureAuthenticated: (req, res, next) => {
        req.isLoggedIn = req.session && req.session.msalAccount;
        next();
    }
};
