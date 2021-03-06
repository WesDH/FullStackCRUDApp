const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');

// Connect to the environment file
dotenv.config();

const database_service = require('./database_service');

const app = express();

// CORS preflight options: Valid for all Express routes '*'
// Allows localhost to send requests from a different port number (cross origin)
// Allows the request(POST,DELETE... etc) to send cookie credentials (custom headers)
app.options('*', cors({
    origin: 'http://localhost:63342',
    credentials: true
    }));

// To prevent CORs errors
app.use(cors());






app.use(session(
    {secret: 'mysecrets'}));
        // cookie: { domain:'http://localhost:5000',
        //     sameSite: 'none',
        // path: '/'},

// 1. Client receives a request (no cookie)
// 2. Server receives request and creates a new session with a cookie and sessionID
// 3. Server sends new session's cookie back to client under the connect.sid name
// 4. Client makes request with connect.sid cookie
// 5. Server retrieves session associated with the value of the connect.sid cookie that the client sent


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});



// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:63342');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//
//     // intercept OPTIONS method
//     if ('OPTIONS' === req.method) {
//         res.send(200);
//     }
//     else {
//         next();
//     }
// };
// app.use(allowCrossDomain);



app.use(express.json()); // App to parse request body
app.use(express.urlencoded( {extended: false }));


app.get
('/', (request, response) =>
{
    console.log("hellloopo")
    console.log('Cookies: ', request.cookies);
    console.log('app.get : / : session ID: ' + request.sessionID);
    //console.log(response)
    response.send(null)
});



// Insert
app.post
('/insert', (request, response) =>
{
    //console.log(request.body);
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
    const {name} = request.body;
    const {reps} = request.body;
    const {weight} = request.body;
    const {date} = request.body;
    const {unit} = request.body;

    const db = database_service.get_db_service_instance();
    const result = db.insertNewRow(request.sessionID, name, reps, weight, date, unit);

    result
        .then(data => response.json({data : data}))
        .catch(err => console.log(err));


}); // End of app.post callback


//Read
// Grab req.sessionID which is the cookie
app.get
('/getAll', (request, response) =>
{
    // response.header("Access-Control-Allow-Cross-Origin", "http://localhost:63342");
    // response.setHeader('Access-Control-Allow-Credentials', 'true')
    // console.log('Cookies: ', request.cookies);
    // console.log('app.get : getAll : session ID: ' + request.sessionID);

    const db = database_service.get_db_service_instance();

    // Function call to query the database with current sessionID
    const result = db.getData(request.sessionID)

    // console.log(request.session);
    // console.log(`===================`);
    // console.log(request.sessionID);
    // console.log(`===================`);
    // console.log(request.session.cookie);

    //console.log("Result of db.getData in app.get getAll:  ")
    //console.log(result)

    // Send the response back to the front end index.js
    result
        .then(data => response.json(data))
        .catch(err => console.log(err));
    // Send the response back to the front end index.js
    //response.json(result)
});


// Update


// Delete
app.delete
('/del/:id', (request, response) =>
{
    const { id } = request.params;

    //console.log(`Delete id: ${id}`);
    const db = database_service.get_db_service_instance();

    const result = db.deleteRow(id)

    // Send the response back to the front end index.js
    result
        .then(data => response.json({ success: true}))
        .catch(err => console.log(err));

});







app.listen(process.env.PORT, () => console.log(`App is running on port: ${process.env.PORT}`));