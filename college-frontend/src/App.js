import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";


function App() {
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState({ students: [], courses: [], fees: [] });
  const [msg, setMsg] = useState("");

  // Forms
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });
  const [newStudent, setNewStudent] = useState({ name: "", course_id: "", marks: "" });
  const [newFee, setNewFee] = useState({ student_id: "", amount: "", status: "" });

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password });
      setToken(res.data.token);
      setPage("dashboard");
      setMsg("");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Login failed");
    }
  };

  // ---------------- LOAD DASHBOARD ----------------
  const loadDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: token },
      });
      setDashboard(res.data);
    } catch (err) {
      setMsg("Failed to load dashboard");
    }
  };

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  // ---------------- ADD COURSE ----------------
  const handleAddCourse = async () => {
    if (!newCourse.name) return alert("Course name required");
    try {
      await axios.post(
        "http://localhost:5000/api/course",
        newCourse,
        { headers: { Authorization: token } }
      );
      setNewCourse({ name: "", description: "" });
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add course");
    }
  };

  // ---------------- ADD STUDENT ----------------
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.course_id) return alert("Name and course required");
    try {
      await axios.post(
        "http://localhost:5000/api/student",
        {
          name: newStudent.name,
          course_id: Number(newStudent.course_id),
          marks: Number(newStudent.marks || 0),
        },
        { headers: { Authorization: token } }
      );
      setNewStudent({ name: "", course_id: "", marks: "" });
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add student");
    }
  };

  // ---------------- ADD FEE ----------------
  const handleAddFee = async () => {
    if (!newFee.student_id || !newFee.amount) return alert("Student and amount required");
    try {
      await axios.post(
        "http://localhost:5000/api/fee",
        {
          student_id: Number(newFee.student_id),
          amount: Number(newFee.amount),
          status: newFee.status || "Pending",
        },
        { headers: { Authorization: token } }
      );
      setNewFee({ student_id: "", amount: "", status: "" });
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add fee");
    }
  };

  // ---------------- RENDER ----------------
  if (page === "login")
    return (
      <div style={{ padding: "50px" }}>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br /><br />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
        <button onClick={handleLogin}>Login</button>
        <p style={{ color: "red" }}>{msg}</p>
        <p>Use <b>admin@example.com / 123456</b></p>
      </div>
    );

  if (page === "dashboard")
    return (
      <div style={{ padding: "20px" }}>
        <h2>Dashboard</h2>
        <button onClick={() => { setPage("login"); setToken(""); }}>Logout</button>
        <hr />

        {/* Add Course */}
        <h3>Add Course</h3>
        <input
          placeholder="Course Name"
          value={newCourse.name}
          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
        />
        <input
          placeholder="Description"
          value={newCourse.description}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
        />
        <button onClick={handleAddCourse}>Add Course</button>

        {/* Add Student */}
        <h3>Add Student</h3>
        {dashboard.courses.length === 0 && <p style={{ color: "red" }}>Add a course first!</p>}
        <input
          placeholder="Student Name"
          value={newStudent.name}
          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
          disabled={dashboard.courses.length === 0}
        />
        <select
          value={newStudent.course_id}
          onChange={(e) => setNewStudent({ ...newStudent, course_id: e.target.value })}
          disabled={dashboard.courses.length === 0}
        >
          <option value="">Select Course</option>
          {dashboard.courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          placeholder="Marks"
          value={newStudent.marks}
          onChange={(e) => setNewStudent({ ...newStudent, marks: e.target.value })}
          disabled={dashboard.courses.length === 0}
        />
        <button onClick={handleAddStudent} disabled={dashboard.courses.length === 0}>Add Student</button>

        {/* Add Fee */}
        <h3>Add Fee</h3>
        {dashboard.students.length === 0 && <p style={{ color: "red" }}>Add a student first!</p>}
        <select
          value={newFee.student_id}
          onChange={(e) => setNewFee({ ...newFee, student_id: e.target.value })}
          disabled={dashboard.students.length === 0}
        >
          <option value="">Select Student</option>
          {dashboard.students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          placeholder="Amount"
          value={newFee.amount}
          onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
          disabled={dashboard.students.length === 0}
        />
        <input
          placeholder="Status"
          value={newFee.status}
          onChange={(e) => setNewFee({ ...newFee, status: e.target.value })}
          disabled={dashboard.students.length === 0}
        />
        <button onClick={handleAddFee} disabled={dashboard.students.length === 0}>Add Fee</button>

        <hr />

        {/* Dashboard */}
        <h3>Students</h3>
        <ul>
          {dashboard.students.map((s) => <li key={s.id}>{s.name} | {s.course} | Marks: {s.marks}</li>)}
        </ul>

        <h3>Courses</h3>
        <ul>
          {dashboard.courses.map((c) => <li key={c.id}>{c.name} - {c.description}</li>)}
        </ul>

        <h3>Fees</h3>
        <ul>
          {dashboard.fees.map((f) => <li key={f.id}>{f.student} | Amount: {f.amount} | {f.status}</li>)}
        </ul>
      </div>
    );
}

export default App;
