import { hashed } from "../config/admin.js";

const check_admin_auth = async (req, res, next) => {

    console.log(req.headers);
    var authHeader = req.headers.authorization;
    if(!authHeader){
        console.log("NO AUTH HEADER");
        res.status(400).json({"error": "NO AUTH HEADER"});
    }
    else{
        console.log(authHeader);
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            const token = req.headers.authorization.split(' ')[1];

            if(token === hashed){
                console.log("ADMIN ALLOWED");
                next();
            }
            else{
                console.log("INVALID TOKEN");
                res.status(400).json({"error": "TOKEN IS INCORRECT"});
            }
        }
        else{
            console.log("AUTH HEADER IS NOT BEARER AUTH");
            res.status(400).json({"error": "NO BEARER AUTH IN AUTH HEADER"});
        }
    }

    // // DEVELOPERS WITH ADMINISTRATOR ACCESS :P
    // const ADMINISTRATORS = [
    //     "f20200048@pilani.bits-pilani.ac.in",  // MOHIT MAKWANA
    //     "f20201229@pilani.bits-pilani.ac.in",  // PARTH SHARMA
    //     "f20190024@pilani.bits-pilani.ac.in",  // NIDHEESH JAIN
    //     "f20190663@pilani.bits-pilani.ac.in",  // DARSH MISHRA
    //     "f20190363@pilani.bits-pilani.ac.in"   // ANSHAL SHUKLA
    // ];

    // // ALLOW ONLY ADMINS
    // if(req.session["student"]){
    //     if(ADMINISTRATORS.indexOf(req.session["student"].email) > -1){
    //         console.log('ALLOWED ADMIN');
    //         next();
    //     }
    //     else{
    //         console.log('ADMIN ACCESS DENIED');
    //         res.status(400).json({"error": "ACCESS DENIED TO ADMIN PAGE :p"});
    //     }
    // }
    // else{
    //     res.status(400).json({"error": "ACCESS NOT GRANTED TO ADMIN PAGE"});
    //     res.end();
    // }
}


export default check_admin_auth;
