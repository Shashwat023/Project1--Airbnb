module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error","you need to be looged in!");
        return res.redirect("/login");
    }
    next();
};