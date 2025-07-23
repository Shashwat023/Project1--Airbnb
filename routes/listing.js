const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

// for server side validation of listings (data of newly entered listing)
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

// index route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});

// Create route:- New
router.get("/new",  (req, res) => {
    res.render("./listings/new.ejs");   
});

// show route 
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));

// Create route:- create - actual creation of instance
router.post("/", validateListing ,wrapAsync(async (req, res, next) => {
    
    let listing = req.body.listing;
    const newListing = new Listing(listing); // new Listing(listing) - instance
    await newListing.save();
    res.redirect("/listings");
})
);

// update route :- EDIT 
router.get("/:id/edit",validateListing, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));

// update route :- update (put req)
router.put("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); // {...req.body.listing} - deconstructing app parameters and updating the values
    res.redirect("/listings");
}));

// delete route
router.delete("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;