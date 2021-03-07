const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');

// Connect to the environment file
dotenv.config();

const database_service = require('./database_service');

const app = express();

// Set CORS "preflight" options: Valid for all Express routes '*'
// Allows localhost to send requests from a different port number (cross origin)
// Allows the preflight request(POST,DELETE... etc) to send cookie credentials (custom headers)
app.options('*', cors({
    origin: 'http://localhost:63342',
    credentials: true
    }));

// To prevent CORS errors
app.use(cors());

app.use(session(
    {secret: 'mysecrets'}));
// 1. Client receives a request (no cookie)
// 2. Server receives request and creates a new session with a cookie and sessionID
// 3. Server sends new session's cookie back to client under the connect.sid name
// 4. Client makes request with connect.sid cookie
// 5. Server retrieves session associated with the value of the connect.sid cookie that the client sent


// Middleware function, fixes CORS errors
// Troubleshooting the problem of differing client and host ports when developing on localhost.
// Differing host and client ports is a cross-origin request
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json()); // App to parse request body
app.use(express.urlencoded( {extended: false }));


// app.get
// ('/', (request, response) =>
// {
//     console.log("hellloopo")
//     console.log('Cookies: ', request.cookies);
//     console.log('app.get : / : session ID: ' + request.sessionID);
//     //console.log(response)
//     response.send(null)
// });



// Insert route
app.post
('/insert', (request, response) =>
{
    //console.log(request.body);
    //response.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
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


// Read route
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


// Update (edit) route
app.patch
('/edit', (request, response) =>
{
    console.log(request.body)
    const {id} = request.body;
    const {name} = request.body;
    const {reps} = request.body;
    const {weight} = request.body;
    const {date} = request.body;
    const {unit} = request.body;

    const db = database_service.get_db_service_instance();
    const result = db.editRow
    (request.sessionID, id, name, reps, weight, date, unit);

    result
        .then(data => response.json({success : data}))
        .catch(err => console.log(err));
});


// Delete route
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