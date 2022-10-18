if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Joi = require("joi");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
// const mongoSanitize = require("express-mongo-sanitize");
// const helmet = require("helmet");

//Routs
const productRoutes = require("./routes/productRoutes");
const reviewRouts = require("./routes/review");
const authRouts = require("./routes/auth");
const { date } = require("joi");
const cartRoutes = require("./routes/cart");
const paymentRouts = require("./routes/payment");

// Apis
const productApis = require("./routes/api/productapi");
const MongoStore = require("connect-mongo");

// Connect MongoDB DataBase

const dbUrl = process.env.dbUrl || "mongodb://localhost:27017/e-commerce";

mongoose
  .connect(dbUrl)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

// Set templating engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

// Set path
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// To endcoding the body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const secret = process.env.SECRET || "weneedsomebettersecret";

// Again and again login strore more session so we use fix time to creat session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, // Session store at least for 24 hours
  secret: secret,
});

const sessionConfig = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() * 1000 * 60 * 60 * 24 * 7 * 1,
    maxAge: 1000 * 60 * 60 * 24 * 7 * 1,
  },
};

app.use(session(sessionConfig));
//use to show flash messages
app.use(flash());

// Initialising middleware for passport
app.use(passport.initialize());
app.use(passport.session());

// push or remove the user from the session
passport.serializeUser(User.serializeUser()); // Run when login
passport.deserializeUser(User.deserializeUser()); // Run when logout

//Telling the passport to check for username and password using authenticate method provided by the passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

// Run for every rout
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Home Rout
app.get("/", (req, res) => {
  res.render("home");
});

app.use(productRoutes);
app.use(reviewRouts);
app.use(authRouts);
app.use(productApis);
app.use(cartRoutes);
app.use(paymentRouts);
// app.use(mongoSanitize);
// app.use(helmet({ contentSecurityPolicy: false }));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
