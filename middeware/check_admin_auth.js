const check_admin_auth = async (req, res, next) => {

    // DEVELOPERS WITH ADMINISTRATOR ACCESS :P
    const ADMINISTRATORS = [
        "f20200048@pilani.bits-pilani.ac.in",  // MOHIT MAKWANA
        "f20201229@pilani.bits-pilani.ac.in",  // PARTH SHARMA
        "f20190024@pilani.bits-pilani.ac.in",  // NIDHEESH JAIN
        "f20190663@pilani.bits-pilani.ac.in",  // DARSH MISHRA
        "f20190363@pilani.bits-pilani.ac.in"   // ANSHAL SHUKLA
    ];

    // ALLOW ONLY ADMINS
    if(req.session["student"]){
        if(ADMINISTRATORS.indexOf(req.session["student"].email) > -1){
            console.log('ALLOWED ADMIN');
            next();
        }
        else{
            console.log('ADMIN ACCESS DENIED');
            res.status(400).json({"error": "ACCESS DENIED TO ADMIN PAGE :p"});
        }
    }
    else{
        res.status(400).json({"error": "ACCESS NOT GRANTED TO ADMIN PAGE"});
        res.end();
    }
}


module.exports = check_admin_auth;
