const express = require("express");
const path = require("path");
const logger = require("morgan");
const hbs = require("hbs"); //now we need this to do partials
const session = require("express-session");
const flash = require("connect-flash");

//read routes modules
const routes = require("./routes/index");
const { checkAdmin, checkLoggedIn } = require("./middleware");

const app = express(); //create express middleware dispatcher

const PORT = process.env.PORT || 3000;

// view engine setup
hbs.registerPartials(__dirname + "/views/partials");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs"); //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser

//register middleware with dispatcher
//ORDER MATTERS HERE
//middleware
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            // Session expires after 3 mins of inactivity.
            maxAge: 180000,
        },
    })
);
app.use(flash());

//routes
app.get("/", routes.index);
app.get("/users", checkAdmin, routes.users);
app.get("/fact", checkLoggedIn, routes.getFact);
app.get("/facts", checkLoggedIn, routes.facts); //get all facts users created
app.get("/create", checkLoggedIn, routes.create);
app.get("/login", routes.login);
app.get("/register", routes.register);

app.post("/register", routes.registerUser);
app.post("/login", routes.loginUser);
app.post("/create", checkLoggedIn, routes.createFact);

//start server
app.listen(PORT, (err) => {
    if (err) console.log(err);
    else {
        console.log(`Server listening on port: ${PORT} CNTL:-C to stop`);
        console.log(`To Test:`);
        console.log("http://localhost:3000");
    }
});
