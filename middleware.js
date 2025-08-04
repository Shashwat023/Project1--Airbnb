const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema} = require("./schema.js");
const {listingSchema} = require("./schema.js");
const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; // saving redirect url:-
        req.flash("error","you need to be looged in!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next ) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let{id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "u r not the owner of this post");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// for server side validation of listings (data of newly entered listing)
module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};


// for server side validation of reviews (data of newly entered reviews)
module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "u r not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};