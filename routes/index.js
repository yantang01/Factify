const url = require("url");

//connect to database
const db = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "data/comp2406_project.db",
    },
    useNullAsDefault: false,
});

//to hash password
const bcrypt = require("bcrypt");

exports.index = function (req, res) {
    // index.html

    //set flash message
    // req.flash("info", "log in to use factify.");

    if (req.session.user !== undefined) {
        res.render("index", {
            user: `logged in as ${req.session.user}`,
        });
    } else {
        res.render("index", {
            user: `user not logged in yet`,
        });
    }
};

exports.users = function (req, res) {
    db.select("username", "role")
        .from("users")
        .then(function (data) {
            res.render("users", {
                userEntries: data,
            });
            console.log(data);
        });
};

exports.getFact = function (req, res) {
    let limit = req.query.limit;
    console.log(limit);
    fetch(`https://api.api-ninjas.com/v1/facts?limit=${1}`, {
        method: "GET",
        headers: {
            "X-Api-Key": "HGCaY7Xg9KDWqK4Gg50Qng==ZEWEpEvujkHl9dVf",
        },
        contentType: "application/json",
    })
        .then((res) => {
            if (res.ok) {
                console.log("success");
            } else {
                console.log("failed");
            }
            return res.json();
        })
        .then((data) => {
            res.render("index", {
                fact: data[0].fact,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.facts = function (req, res) {
    db.select("username", "fact")
        .from("facts")
        .then(function (data) {
            res.render("facts", {
                userEntries: data,
            });
            console.log(data);
        });
};

exports.create = function (req, res) {
    res.render("createForm", {});
};

exports.createFact = async function (req, res) {
    try {
        await db("facts").insert({
            username: req.session.user,
            fact: req.body.factByUser,
        });
        res.redirect("/facts");
    } catch {
        res.status(400).send("something wrong");
    }
};

exports.login = function (req, res) {
    // login route
    res.render("login", {});
};

exports.register = function (req, res) {
    // register route
    res.render("register", {});
};

exports.loginUser = async function (req, res) {
    // login user
    try {
        let user = await db("users")
            .first("*")
            .where({ username: req.body.username });
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {
                req.session.user = req.body.username;
                res.redirect("/");
            } else {
                res.render("login", {
                    message: "wrong password!",
                });
                return;
            }
        } else {
            res.redirect("/register");
        }
    } catch {
        res.redirect("/");
    }
};

exports.registerUser = async function (req, res) {
    // register user
    try {
        let user = await db("users")
            .first("*")
            .where({ username: req.body.username });
        if (user) {
            res.render("register", {
                message: "user exists!",
            });
            return;
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await db("users").insert({
                username: req.body.username,
                password: hashedPassword,
                role: "guest",
            });
            res.redirect("./login");
        }
    } catch {
        res.redirect("/");
    }
};
