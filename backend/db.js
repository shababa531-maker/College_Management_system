const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",      // your MySQL password
    database: "college_db"
});

db.connect((err) => {
    if (err) console.log("DB connection error:", err.message);
    else console.log("MySQL connected");
});

module.exports = db;
