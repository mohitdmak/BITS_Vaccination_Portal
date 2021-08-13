// auth requirements
var {google} = require('googleapis');
const ClientId = require("../config/oauth2-api-creds.json").web.client_id;
const ClientSecret = require("../config/oauth2-api-creds.json").web.client_secret;

// Importing Student Model
var Student = require("../models/student");


// Setting appropriate callback url
var RedirectionUrl;
if(process.env.npm_lifecycle_event === 'dev_local'){
    RedirectionUrl = "http://localhost:1370/api/auth/oauthCallback";
}
else if(process.env.npm_lifecycle_event === 'dev_server'){
    RedirectionUrl = "https://vaccination.bits-dvm.org/api/auth/oauthCallback";
}

// Oauth2 client raw
var OAuth2 = google.auth.OAuth2;

// Oauth2 client with api credentials
function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}

// Obtaining auth url by specifying scopes
function getAuthUrl () {

    var oauth2Client = getOAuthClient();

    // generate a url that asks permissions for email and profile scopes
    var scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes, // If you only need one scope you can pass it as string

        // We ensure that only emails of BITS Pilani (Pilani Campus) are validated
        hd: 'pilani.bits-pilani.ac.in'
    });

    return url;
}

// Obtaining token from Oauth2 client and setting it in sessions dict
const set_tokens = async (req, res) => {

    // setting new details in oauth2Client
    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code;

    // embedding tokens in session and oauth2Client
    oauth2Client.getToken(code, async function(err, tokens) {

      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;
        console.log(tokens);

        // getting student details
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        try{
            var user = await oauth2.userinfo.get();
        }
        catch(err){
            res.status(500).json(err);
        }

        // set student data in session
        set_session_data(user, req, res);
        
      }
    });
};

// set session data of student
const set_session_data = async (user, req, res) => {
    try{
        var student = await Student.find({email: user.data.email});
        if(student.length){
            req.session["student"] = student[0];
            res.redirect('/');
        }
        else{
            // creating student model
            var student = new Student({
                "name" : user.data.name,
                "email" : user.data.email,
                "pic" : user.data.picture
            });

            // Save student data in current session
            // req.session["student"] = student;

            // saving to database
            try{
                var new_student = await student.save();
                req.session["student"] = new_student;
                res.redirect('/');
            }
            catch(err){
                console.log(err);
                res.status(500).json(err);
            }
          }
        }
    catch(err){
        console.log(err);
        res.status(500).json(err);
    }
}

// The protected page
const get_user_details = async (req, res) => {

    // getting oauth2Client
    var oauth2Client = getOAuthClient();

    if(req.session["tokens"]){
        oauth2Client.setCredentials(req.session["tokens"]);
        // getting user details
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        try{
            var user = await oauth2.userinfo.get();
            console.log(user.data);
            res.status(200).json({"user":user.data, "session": req.session});
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
    else if((process.env.npm_lifecycle_event === 'dev_local' && req.session["student"])){
        res.status(200).json(req.session["student"]);
    }
    else{
        res.status(401).json({"error":"No tokens found"});
    }
};

// The protected page
const get_data = async (req, res) => {

    // getting oauth2Client
    var oauth2Client = getOAuthClient();

    if(req.session["tokens"]){
        oauth2Client.setCredentials(req.session["tokens"]);
        // getting user details
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        try{
            var user = await oauth2.userinfo.get();
            console.log(user.data);

            var cp = require('child_process');
            var d = 'new';
            cp.exec(`cd PyDIVOC &&  python3 solve.py ${d}`, function(err, stdout, stderr) {
                  // handle err, stdout, stderr
                console.log(err);
                console.log(stdout);
                console.log(stderr);
            });

        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
    else{
        res.status(401).json({"error":"No tokens found"});
    }
};


// landing page
const get_auth_url = (req, res) => {

    try{
        var url = getAuthUrl();
        // res.status(200).json({"authentication_url": url});
        res.redirect(url);
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
};

const get_logout = (req, res) => {

    // removing tokens from session
    req.session.destroy();

    res.redirect("/");
};

const get_login = async (req, res) => {
    if(req.query.access_token && process.env.npm_lifecycle_event === 'dev_local'){
        // For testing via postman
        //// getting oauth2Client
        var oauth2Client = getOAuthClient();

        oauth2Client.setCredentials({access_token: req.query.access_token});
        // getting user details
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const user = await oauth2.userinfo.get();

        // set student data in session
        set_session_data(user, req, res);
    }
    else{
        console.log(req.query.access_token);
        res.status(400).json({"error": "no access token found"});
    }
};


module.exports = {
    get_user_details,
    get_auth_url,
    set_tokens,
    get_logout,
    getOAuthClient,
    get_data,
    get_login
}

