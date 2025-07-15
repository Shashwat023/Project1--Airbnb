const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

app.set("view engine", "ejs");                    // |
app.set("views", path.join(__dirname, "views"));  // | both for index route
app.use(express.urlencoded ({extended: true}));   // | for show route
app.use(methodOverride("_method"));               // | for put and delete req
app.engine("ejs", ejsMate);                       // | for templating
app.use(express.static(path.join(__dirname, "/public"))); // | to use static files - css nd js

const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLust";

main()
    .then(() => {
        console.log("connect to DB");
    })
    .catch((err) => {
        console.log(err);
    });


async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("I am Groot!");
});

// index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});

// Create route:- New
app.get("/listings/new",  (req, res) => {
    res.render("./listings/new.ejs");   
});

// show route 
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
}));

// Create route:- create - actual creation of instance
app.post("/listings", wrapAsync(async (req, res, next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    let listing = req.body.listing;
    const newListing = new Listing(listing); // new Listing(listing) - instance
    await newListing.save();
    res.redirect("/listings");
})
);


// update route :- EDIT 
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));

// update route :- update (put req)
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); // {...req.body.listing} - deconstructing app parameters and updating the values
    res.redirect("/listings");
}));

// delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "pg nt fnd!"));
// });

// middleware:-
app.use((err, req, res, next) =>{
    let{statusCode = 500, message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("server is listening");
}); 