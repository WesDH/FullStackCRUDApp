# FullStackCRUDApp
Web-Based implementation of a Create, Read, Update, Delete App.

Uses HTML/CSS/Javascript for front end.
And Node.JS/MySQL for backend.

User session-id tied to SQL database (try refreshing the page or opening a new window, it should still display the current session's exercise database), holding the user's exercise name, reps, weight, date, and units. The user can add, edit, and delete exercises from his exercise table, which updates the corresponding entry in the database. Opening a new browser window in incognito, or using a different web browser such as Firefox vs Chrome will generate a new session ID, thus a new exercise table tied to that session.

Live version of app: http://weshavens.info/CS290HW6/
(DigitalOcean cloud hosting using a LEMP stack: Ubuntu Linux cloud OS running NGINX server, with MySQL (But no PHP in the app source code).
