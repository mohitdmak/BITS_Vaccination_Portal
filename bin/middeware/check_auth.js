"use strict";
const check_auth = async (req, res, next) => {
    console.log(req.session);
    if (req.session["student"]) {
        console.log('FORWARDED FROM MIDDLEWARE');
        next();
    }
    else {
        res.status(400).json({ "error": "Student has not logged in yet" });
        res.end();
    }
};
module.exports = check_auth;
