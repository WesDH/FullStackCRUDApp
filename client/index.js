document.addEventListener('DOMContentLoaded', function () {
    // Create initial API call to backend to get any database information for current session,
    // then render the table
    fetch('http://localhost:5000/getAll',
    {
        credentials: 'include', // Include cookie in request , needed for development on localhost (differing ports)
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => renderTable(data));
});


// Create an event listener to handle mouse click events on the table's EDIT or DELETE buttons.
document.getElementById('exercise-table-body').addEventListener('click',
    function (event)
    {
        console.log(event.target);

        // Grab the ID attribute that was attached to the Edit and Delete buttons
        // this is the MySQL database ID to edit/delete.
        let row_id = event.target.getAttribute('data-id');


        if (event.target.className === "delete-row-button")
        {

            if (row_id === null) {
                console.log("Error: The row ID to delete is null")
                return;
            }
            delete_row(row_id);
        }

        if (event.target.className === "edit-row-button")
        {

            if (row_id === null) {
                console.log("Error: The row ID to delete is null")
                return;
            }
            edit_row(row_id);
        }
    })

// Delete the respective row given the ID
function delete_row(row_id)
{
    fetch('http://localhost:5000/del/' + row_id,
        {
            credentials: 'include',
            method: 'DELETE'
                    })
        .then (response => response.json())
        .then(data => {
            // If we successfully deleted the row, fetch the session's database info again and redraw the table:
            if (data.success) {
                console.log("(Deletion request successful, reload table)")
                fetch('http://localhost:5000/getAll',
                    {
                        // Include cookie in request , needed for development on localhost (differing ports):
                        credentials: 'include',
                        method: 'GET'
                    })
                    .then(response => response.json())
                    .then(data => renderTable(data));
            } else
            {
                console.log("Error with deletion request: ");
                console.log(data);
            }

        });
}

function edit_row(row_id)
{
    const edit_section = document.querySelector('#update-section');
    updateSection.hidden = false;
    document.querySelector('#update-row-btn').dataset.id = id
    document.querySelector('#update-name-input').dataset.id = id
}



const add_button = document.querySelector('#add-data-btn');
const delete_button = document.querySelector('#delete-row-button');
const edit_button = document.querySelector('#add-data-btn');

// Define functionality for the "submit" button to send the user input data to the backend
add_button.onclick = function ()
{
    // Grab the input data from the forms, then reset form input data to be empty again
    const nameInput = document.querySelector('#name-input')
    const name = nameInput.value;
    nameInput.value = "";

    const repsInput = document.querySelector('#reps-input')
    const reps = repsInput.value;
    repsInput.value = "";

    const dateInput = document.querySelector('#date-input')
    const date = dateInput.value;
    dateInput.value = "";

    const weightInput = document.querySelector('#weight-input')
    const weight = weightInput.value;
    weightInput.value = "";

    let unit = ""; // In the event neither weight unit is checked set it to blank
    let unitInput = document.querySelector('#lbs-weight')
    if (unitInput.checked) { unit = unitInput.value };

    unitInput = document.querySelector('#kgs-weight')
    if (unitInput.checked) { unit = unitInput.value };

    // Send the user input data to the backend
    fetch
    ('http://localhost:5000/insert',
    {
            headers:
            {
                'Content-type' : 'application/json'
            },
            method: 'POST',
            body : JSON.stringify(
                {
                    name: name,
                    reps: reps,
                    date: date,
                    weight: weight,
                    unit: unit
                }
            ),
            credentials: 'include'
        }
    )  // End of fetch arguments
        .then(response => response.json())
        .then(data => insertRowIntoTable(data['data']))
    ;
}  // End of add_data.onclick definition

function insertRowIntoTable(data)
{
    // console.log('data for insert row: ')
    // console.log(data)
    // Point the DOM to the exercise table <tbody> (The tbody is empty by default)
    const table = document.getElementById('exercise-table-body');
    const is_table_empty = table.querySelector('.no-data');
    //
    // renderTable([data])
    let tableHtml = "<tr>";

    Object.keys(data).forEach(key => {
        if (key === "id") {
            return; // We don't have a column for the MySQL InsertionID (Auto Increment), so skip this iteration
        }
        tableHtml += `<td>${data[key]}</td>`;
    });

    // But we do want to tag the edit and delete buttons with an attribute "data-id"
    // Using this MySQL autoincrement ID, so that we know which data in the MySQL table to edit or delete
    tableHtml += `<td><button class="delete-row-button" data-id=${data.id}>Delete</button></td>`;
    tableHtml += `<td><button class="edit-row-button" data-id=${data.id}>Edit</button></td>`;
    tableHtml += "<tr>";

    if (is_table_empty) {
        table.innerHTML = tableHtml; // Table is empty, so overwrite the "empty table" message row
    } else {
        table.innerHTML += tableHtml; // Otherwise append html to the existing table, which already has data
    }

}

function renderTable(data)
{

    // Point the DOM to the exercise table <tbody> (The tbody is empty by default)
    const table = document.getElementById('exercise-table-body');
    table.innerHTML = ""
    // console.log("Render table 'datas':  ")
    // console.log(data)
    // console.log("got here");
    // Create inner HTML to be added to the <tbody>:


    // No database information sent to the renderTable function: Render an empty table
    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='7'>Your session's exercise database is empty</td><tr>";
        return;
    }

    let table_body_append = "";
    data.forEach(function ({id, name, reps, weight, date, units}) {
        table_body_append += "<tr>";
        table_body_append += `<td>${name}</td>`;
        table_body_append += `<td>${reps}</td>`;
        table_body_append += `<td>${weight}</td>`;
        table_body_append += `<td>${date}</td>`;
        table_body_append += `<td>${units}</td>`;
        table_body_append += `<td><button class="delete-row-button" data-id=${id}>Delete</button></td>`;
        table_body_append += `<td><button class="edit-row-button" data-id=${id}>Edit</button></td>`;
        table_body_append += "<tr>";
    });

    table.innerHTML = table_body_append;
    // data.forEach(element => {
    //     Object.keys(element).forEach(key => {
    //         //console.log(key, element[key])
    //         if (key === 'id') { return }
    //         tableHtml += "<tr>";
    //         tableHtml += `<td></td>`;
    //
    //     });
    // });
}