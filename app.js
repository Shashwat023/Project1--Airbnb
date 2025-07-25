const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.set("view engine", "ejs");                      // |
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

// all routes of listings:-
app.use("/listings", listings);

// all routes of reviews:-
app.use("/listings/:id/reviews", reviews);

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