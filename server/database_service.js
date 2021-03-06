const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();


// Create connection parameters for the MySQL database, accepts an object as an arg
const connection = mysql.createConnection
    ({
        host: process.env.HOST,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        port: process.env.DB_PORT
    });

// Attempt to connect to the MySQL database.
// Callback function to console log error, otherwise console logs out current connection state
connection.connect
((error) =>
{
    if (error)
    {
        console.log(error.message)
    }
    // if NOT error: Console log the connection state (Should be "connected"):
    //console.log('Database ' + connection.state);
});

// We only want to create a single instance of the upcoming database_service class
let instance = null;

// Create a database Class to handle insertions, deletions, and edits to the MySQL database.
// Flow of information is as such:
// Front-End Html/Javascript <---> Node.js <---> Database_service.js
class database_service
{
    // Return instance if already exists (instance != null)
    // Otherwise set instance to new database_service, then return instance
    static get_db_service_instance()
    {
        return instance ? instance : new database_service
    }

    // Get the initial data in the table
    async getData(session_id)
    {
        try
        {
            // Create a MySQL query to grab tables where session_id matches the current Express session
            const response = await new Promise
            ((resolve, reject) =>
            {
                //console.log("session id in the getData Query " + session_id);
                const query = `SELECT id, name, reps, weight, date, units FROM exercises WHERE sessionID='${session_id}'`;
                //const query = "SELECT * FROM exercises;";
                //console.log(query);
                // Query the database, with callback function to handle success or error state
                connection.query
                (query, (err, results) =>
                    {
                        if (err)
                        {
                            // If error in the SQL query request: reject the Promise with the error message
                            reject(new Error(err.message));
                        }
                        resolve(results); // Return results of database query
                    } // End of "connection.query" call-back
                ) // End of "connection.query"
            }); // End of Promise "response"
            //console.log("============\nResponse of the getData MySQL Query: ");
            //console.log("getData response query:");
            //console.log(response);
            //console.log("============");
            return response;
        // Catch error sent from try block:
        } catch (error)
        {
            console.log(error);
        }
    }

    async insertNewRow(sessionID, name, reps, weight, date, unit)
    {
        if (reps === "") { reps = 0}
        if (weight === "") { weight = 0}
        try
        {
            // Create a MySQL query to grab tables where session_id matches the current Express session
            const insert_row_outer = await new Promise
            ((resolve, reject) =>
            {
                // Construct the query string to send query to the database:
                const query = `INSERT INTO exercises (sessionID, name, reps, weight, date, units) VALUES
                ('${sessionID}', '${name}', '${reps}', '${weight}', '${date}', '${unit}');`;
                //console.log(query)
                // Query the database, with callback function to handle success or error state
                connection.query
                (query, (err, result) =>
                    {
                        if (err)
                        {
                            // If error in the SQL query request: reject the Promise with the error message
                            reject(new Error(err.message));
                        }
                        // console.log(result) //gives more info
                        // console.log("Inside the insertNewRow query callback function: \n")
                        console.log(result.insertId)


                        resolve(result.insertId); // Return results of database query
                    } // End of "connection.query" call-back
                ) // End of "connection.query"
            }); // End of Promise "response"
            //console.log("============\nResponse insertID of the insertNewRow MySQL Query: ");
            //console.log(insert_row_outer);
            //console.log("============");
            //return insert_row_outer;
            // Catch error sent from try block:

            return {
                id: insert_row_outer,
                name: name,
                reps: reps,
                weight: weight,
                date: date,
                unit: unit
            }

        } catch (error)
        {
            console.log(error);
        }
    }

    async deleteRow(id) {
        try
        {
            id = (parseInt(id, 10));
            // Create a MySQL query to grab tables where session_id matches the current Express session
            const response = await new Promise
            ((resolve, reject) =>
            {
                // Construct the query string to send query to the database:
                const query = `DELETE FROM exercises WHERE id = ${id}`;
                //console.log(query)
                // Query the database, with callback function to handle success or error state
                connection.query
                (query, (err, result) =>
                    {
                        if (err)
                        {
                            // If error in the SQL query request: reject the Promise with the error message
                            reject(new Error(err.message));
                        }
                        // console.log(result) //gives more info
                        // console.log("Inside the insertNewRow query callback function: \n")
                        //console.log(result.affectedRows)

                        resolve(result.affectedRows); // Return results of database query
                    } // End of "connection.query" call-back
                ) // End of "connection.query"
            }); // End of Promise "response"
            //console.log(response);
            if (response === 1) {
                return true;
            } else
            {
                return false;
            }
        } catch (error)
        {
            console.log(error);
            return false;
        }
    }


}

module.exports = database_service;