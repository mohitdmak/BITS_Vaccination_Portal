// auth requirements
var {google} = require('googleapis');
const ClientId = require("../config/oauth2-api-creds.json").web.client_id;
const ClientSecret = require("../config/oauth2-api-creds.json").web.client_secret;

// Setting appropriate callback url
var RedirectionUrl;
RedirectionUrl = "http://localhost:1370/auth/oauthCallback";


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
        hd: 'pilani.bits-pilani.ac.in'
    });

    return url;
}

// Obtaining token from Oauth2 client and setting it in sessions dict
const set_tokens = (req, res) => {

    // setting new details in oauth2Client
    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code;

    // embedding tokens in session and oauth2Client
    oauth2Client.getToken(code, function(err, tokens) {

      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;
        console.log(tokens);
       
        // redirecting to user details page
        res.redirect('/auth/details');
      }
      else{
        console.log(err);
        res.status(500).json(err);
      }
    });
};

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
    else{
        res.status(401).json({"error":"No tokens found"});
    }
};

// landing page
const get_auth_url = (req, res) => {

    try{
        var url = getAuthUrl();
        res.status(200).json({"authentication_url": url});
        // res.redirect(url);
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
};

const get_logout = (req, res) => {

    // removing tokens from session
    req.session.destroy();

    res.status(200).json({"logout": "success"});
};

module.exports = {
    get_user_details,
    get_auth_url,
    set_tokens,
    get_logout,
    getOAuthClient
}
