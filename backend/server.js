const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret123";

// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "All fields required" });

    db.query("SELECT * FROM users WHERE email=? AND password=?", [email.trim(), password.trim()], (err, result) => {
        if (err) return res.status(500).json({ msg: "Database error: " + err.message });
        if (result.length === 0) return res.status(400).json({ msg: "Incorrect email or password" });

        const token = jwt.sign({ id: result[0].id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    });
});

// ---------------- AUTH ----------------
const auth = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ msg: "Invalid token" });
        req.userId = decoded.id;
        next();
    });
};

// ---------------- DASHBOARD ----------------
app.get("/api/dashboard", auth, (req, res) => {
    const data = {};
    db.query(
        "SELECT s.id, s.name, s.marks, c.name AS course FROM students s JOIN courses c ON s.course_id=c.id",
        (err, students) => {
            if (err) return res.status(500).json({ msg: "Error fetching students: " + err.message });
            data.students = students;

            db.query("SELECT * FROM courses", (err, courses) => {
                if (err) return res.status(500).json({ msg: "Error fetching courses: " + err.message });
                data.courses = courses;

                db.query(
                    "SELECT f.id, s.name AS student, f.amount, f.status FROM fees f JOIN students s ON f.student_id=s.id",
                    (err, fees) => {
                        if (err) return res.status(500).json({ msg: "Error fetching fees: " + err.message });
                        data.fees = fees;
                        res.json(data);
                    }
                );
            });
        }
    );
});

// ---------------- ADD COURSE ----------------
app.post("/api/course", auth, (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: "Course name required" });

    db.query("INSERT INTO courses (name, description) VALUES (?, ?)", [name.trim(), description?.trim() || ""], (err, result) => {
        if (err) return res.status(500).json({ msg: "Database error: " + err.message });
        res.json({ msg: "Course added", id: result.insertId });
    });
});

// ---------------- ADD STUDENT ----------------
app.post("/api/student", auth, (req, res) => {
    const { name, course_id, marks } = req.body;
    if (!name || !course_id) return res.status(400).json({ msg: "Name and course required" });

    db.query(
        "INSERT INTO students (name, course_id, marks) VALUES (?, ?, ?)",
        [name.trim(), Number(course_id), Number(marks || 0)],
        (err, result) => {
            if (err) return res.status(500).json({ msg: "Database error: " + err.message });
            res.json({ msg: "Student added", id: result.insertId });
        }
    );
});

// ---------------- ADD FEE ----------------
app.post("/api/fee", auth, (req, res) => {
    const { student_id, amount, status } = req.body;
    if (!student_id || !amount) return res.status(400).json({ msg: "Student and amount required" });

    db.query(
        "INSERT INTO fees (student_id, amount, status) VALUES (?, ?, ?)",
        [Number(student_id), Number(amount), status?.trim() || "Pending"],
        (err, result) => {
            if (err) return res.status(500).json({ msg: "Database error: " + err.message });
            res.json({ msg: "Fee added", id: result.insertId });
        }
    );
});

// ---------------- START SERVER ----------------
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
