const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // expiry date of cookie -> 1 week from now
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // for preventing from cross-scripting attacks
    }
};

app.get("/", (req, res) => {
    res.send("I am Groot!");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy (User.authenticate()));

passport.serializeUser(User.serializeUser());  // to store info of user
passport.deserializeUser(User.deserializeUser());  // to remove stored info

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "freethinker232004@gmail.com",
//         username: "nothingcmf",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// all routes of listings:-
app.use("/listings", listingsRouter);

// all routes of reviews:-
app.use("/listings/:id/reviews", reviewsRouter);

// all routes of signup:-
app.use("/", userRouter);

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