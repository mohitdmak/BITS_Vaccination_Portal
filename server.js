// importing express app
const app = require("./app").app;

// importing redis session client
const redisClient = require("./app").redisClient;

// importing mongoose
const mongoose = require("mongoose");


//* Configuring port
let port = process.env.PORT || 3000; 


//* mongoose settings for depraciation errors
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Importing Creds for Mongo access
const username = require("./config/mongo.js").MONGO_INITDB_ROOT_USERNAME;
const password = require("./config/mongo.js").MONGO_INITDB_ROOT_PASSWORD;

// setting db uri
const db_uri = `mongodb://${username}:${password}@MongoContainer:27017/Portal?authSource=admin`;


// Open port for node app, once redis and mongodb is connected
redisClient.on('connect', async function () {
    console.log('\n     Connected to redis successfully\n');
    
    try{
        //* Wait for connection to db
        await mongoose.connect(db_uri);
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