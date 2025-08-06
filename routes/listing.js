const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router.route("/")
    // index route
    .get(wrapAsync(listingController.index))
    // Create route:- create - actual creation of instance
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

// Create route:- New
router.get("/new", isLoggedIn ,listingController.renderNewForm);

router.route("/:id")
    // show route 
    .get(wrapAsync(listingController.showListing))
    // update route :- update (put req)
    .put(isLoggedIn, isOwner, wrapAsync(listingController.updateListing))
    // delete route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// update route :- EDIT 
router.get("/:id/edit",isLoggedIn, isOwner, validateListing, wrapAsync(listingController.renderEditForm));

module.exports = router;