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

const add_button = document.querySelector('#add-data-btn');
//const delete_button = document.querySelector('#delete-row-button');
const update_row_button = document.querySelector('#update-row-button');

// Monitor for mouse click events on the exercise table,
// Create an event listener to handle mouse click events on the table's DELETE or EDIT buttons.
document.getElementById('exercise-table-body').addEventListener('click',
    function (event)
    {
        //console.log(event.target);

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

            // Point to the parent <tr> of the "edit" button, for the purpose of grabbing
            // The text in the children <td>'s and passing this data to the edit function, to
            // pre-populate the edit row's values with existing values
            // Not sure if this "nextSibling.nextSibling" stuff is best coding practice, but it works
            let parent_tr = event.target.parentElement.parentElement;
            //console.log(parent_tr.firstChild.textContent);
            let edit_name = parent_tr.firstChild.textContent;
            let edit_reps = parent_tr.firstChild.nextSibling.textContent;
            let edit_weight = parent_tr.firstChild.nextSibling.nextSibling.textContent;
            let edit_date = parent_tr.firstChild.nextSibling.nextSibling.nextSibling.textContent;
            let edit_units = parent_tr.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.textContent;
            //console.log(edit_name + ' ' + edit_reps + ' ' + edit_weight + ' ' + edit_date + ' ' + edit_units );
            edit_row(row_id, edit_name, edit_reps, edit_weight, edit_date, edit_units);
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

// Helper function to un-hide the edit section and
// populates the input fields with the row whose "edit" button was clicked
function edit_row(row_id, edit_name, edit_reps, edit_weight, edit_date, edit_units)
{
    const edit_section = document.querySelector('#edit-section');
    edit_section.hidden = false;

    // Set update <input> attribute's value's to the corresponding row's values whose "edit" button was clicked.
    document.querySelector('#update-name-input').value = edit_name;
    document.querySelector('#update-reps-input').value = edit_reps;
    document.querySelector('#update-weight-input').value = edit_weight;
    document.querySelector('#update-date-input').value = edit_date;

    // Check kgs radio button if it was checked, otherwise default behavior: Set lbs to checked.
    if (edit_units === 'kgs'){
        document.querySelector('#update-kgs-weight').checked = true;
    } else {
        document.querySelector('#update-lbs-weight').checked = true;
    }

    // Tag the update button "dataset" attribute with the SQL insertion row ID.
    // So that we know which row to edit in SQL query when this button is clicked
    document.querySelector('#update-row-button').dataset.id = row_id;
}

// Function to send fetch request when update_row_button is clicked:
update_row_button.onclick = function ()
{
    // Grab the input data from the forms, then reset form input data to be empty again
    const edit_nameInput = document.querySelector('#update-name-input')
    const edit_name = edit_nameInput.value;
    edit_nameInput.value = "";

    const edit_repsInput = document.querySelector('#update-reps-input')
    const edit_reps = edit_repsInput.value;
    edit_repsInput.value = "";

    const edit_weightInput = document.querySelector('#update-weight-input')
    const edit_weight = edit_weightInput.value;
    edit_weightInput.value = "";

    const edit_dateInput = document.querySelector('#update-date-input')
    const edit_date = edit_dateInput.value;
    edit_dateInput.value = "";

    let edit_unit = ""; // In the event neither weight unit is checked set it to blank
    let edit_unitInput = document.querySelector('#update-lbs-weight')
    if (edit_unitInput.checked) { edit_unit = edit_unitInput.value };

    edit_unitInput = document.querySelector('#update-kgs-weight')
    if (edit_unitInput.checked) { edit_unit = edit_unitInput.value };

    // Grab the MySQL row ID that was tagged onto the edit-row-button prior in helper function
    let edit_row_id = document.querySelector('#update-row-button').getAttribute('data-id');

    // Send the user data that was input for the edit section to the backend
    fetch
    ('http://localhost:5000/edit',
        {
            headers:
                {
                    'Content-type' : 'application/json'
                },
            method: 'PATCH',
            body : JSON.stringify(
                {
                    id: edit_row_id,
                    name: edit_name,
                    reps: edit_reps,
                    weight: edit_weight,
                    date: edit_date,
                    unit: edit_unit
                }
            ),
            credentials: 'include'
        }
    )  // End of fetch PATCH arguments
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("(Edit request successful, reload table)")
                fetch('http://localhost:5000/getAll',
                    {
                        // Include cookie in request , needed for development on localhost (differing ports):
                        credentials: 'include',
                        method: 'GET'
                    })
                    .then(response => response.json())
                    .then(data => {
                        const edit_section = document.querySelector('#edit-section');
                        edit_section.hidden = true;
                        renderTable(data)
                    });
            } else {
                console.log("Error with edit fetch PATCH request:");
                console.log(data);
            }
        })
    ;

}





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