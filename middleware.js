const db = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "data/comp2406_project.db",
    },
    useNullAsDefault: false,
});

exports.checkLoggedIn = function (req, res, next) {
    if (req.session.user === undefined) {
        res.render("index", {
            message: "log in to use factify.",
        });
        // res.status(403);
        // return res.send("you need to log in");
    } else {
        next();
    }
};

exports.checkAdmin = async function (req, res, next) {
    if (req.session.user === undefined) {
        res.render("index", {
            message: "no admin privileges.",
        });
        return;
    }
    try {
        let user = await db("users")
            .first("*")
            .where({ username: req.session.user });

        console.log(user.role);

        if (!user || user.role !== "admin") {
            res.render("index", {
                message: "no admin privileges.",
            });
            return;
        }
        next();
    } catch {
        return res.status(400);
    }
};
