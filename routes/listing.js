const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

// index route
router.get("/", wrapAsync(listingController.index));

// Create route:- New
router.get("/new", isLoggedIn ,listingController.renderNewForm);

// show route 
router.get("/:id", wrapAsync(listingController.showListing));

// Create route:- create - actual creation of instance
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// update route :- EDIT 
router.get("/:id/edit",isLoggedIn, isOwner, validateListing, wrapAsync(listingController.renderEditForm));

// update route :- update (put req)
router.put("/:id",isLoggedIn, isOwner, wrapAsync(listingController.updateListing));

// delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;