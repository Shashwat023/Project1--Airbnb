const Listing = require("../models/listing");
const geoToken = process.env.MAP_TOKEN;
const geoapifyBaseUrl = `https://api.geoapify.com/v1/geocode/search?apiKey=${geoToken}`;

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");   
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist!");
        return res.redirect("/listings");
    }

    // Fetch geoapify data for this listing's location
    const response = await fetch(`${geoapifyBaseUrl}&text=${encodeURIComponent(listing.location)}&limit=1`, { method: "GET" });
    const data = await response.json();

    res.render("./listings/show.ejs", {listing, data});
};

module.exports.createListing = async (req, res, next) => {
    // to add map according to given location in newly added listing
    const response = await fetch(`${geoapifyBaseUrl}&text=${encodeURIComponent(req.body.listing.location)}&limit=1`, { method: "GET" }); // response here is still a ReadableStream object from fetch — not the actual parsed JSON.
    const data = await response.json(); // You must first convert it using .json()

    let url = req.file.path;
    let filename = req.file.filename;
    let listing = req.body.listing;
    const newListing = new Listing(listing); // new Listing(listing) - instance
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = data.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("./listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}); // {...req.body.listing} - deconstructing app parameters and updating the values

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}