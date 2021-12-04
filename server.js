// import configured express app and redis client
const app = require("./app").app;
const redisClient = require("./app").redisClient;



// ########################### Mongo database and ORM configs ###########################
// import mongo ORM
const mongoose = require("mongoose");
//* mongoose settings for depraciation errors
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Importing Creds for Mongo access
const username = require("./config/mongo.js").MONGO_INITDB_ROOT_USERNAME;
const password = require("./config/mongo.js").MONGO_INITDB_ROOT_PASSWORD;

// setting db uri
const db_uri = `mongodb://MongoContainer:27017/Portal?authSource=admin`;

// mongoose connection
var db_connection;
// ########################### / ########################### / ###########################



// ########################### NOTE : We have migrated from admin bro to using custom admin panel ###########################
// INSTALL ADMIN BRO DEPENDENCIES
// const AdminBro = require('admin-bro');
// const mongooseAdminBro = require('@admin-bro/mongoose');
// const expressAdminBro = require('@admin-bro/express');


// Admin Bro and Models
// const Vaccine = require('./models/vaccine.js').Vaccine;
// const Student = require('./models/student.js');

// // import forest admin
// const forest = require('forest-express-mongoose');

// !!!!!!! ADMIN BRO CONFIGS (NOT IN USE CURRENTLY)
// ADMIN BRO ADAPTOR FOR MONGOOSE
// AdminBro.registerAdapter(mongooseAdminBro)
// const AdminBroOptions = {
//   resources: [Vaccine, Student],
//   rootPath: "/api/admin",
// }

// // ADMIN BRO ADAPTOR FOR STUDENT
// const adminBro = new AdminBro(AdminBroOptions)
// const router = expressAdminBro.buildRouter(adminBro)

// // USE ADMIN BRO ROUTER FOR EXPRESS
// app.use(adminBro.options.rootPath, router)
// ########################### / ########################### / ###########################



// ########################### Connecting to Cache and db, opening port ###########################
//* Configuring port
let port = process.env.PORT || 3000; 

// Open port for node app, once redis and mongodb is connected
redisClient.on('connect', async function () {
    console.log('\n     Connected to redis successfully\n');
    
    try{
        //* Wait for connection to db
        db_connection = await mongoose.connect(db_uri);
        console.log("\n     Connection to Mongodb Instance established.\n");

        //* Opening port for express app.
        app.listen(port, () => {
            console.log("Server started on port " + port);
        
            // Listening for requests
            if(process.env.npm_lifecycle_event === 'dev_local'){
                console.log("\n     Entering Development environment locally\n");
            }
            else if(process.env.npm_lifecycle_event === 'dev_server'){
                console.log("\n     Entering Development environment in Dev mode in server\n");
            }
        });
    }
    catch(err){
        // Stop for any redis errors
        redisClient.on('error', function (err) {
            console.log('\n     Could not establish a connection with redis. \n' + err);
        });
        console.log(err);
    }}
);
// ########################### / ########################### /###########################



// export mongoose connection for configuration in app.js forest admin
module.exports = db_connection;
