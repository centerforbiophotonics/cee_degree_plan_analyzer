import express from "express";
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const port = 8081;

// Set up local database
const fpath = './db/DegreePlanPenalties.db'
const db = new sqlite3.Database(fpath, (err) => {
  if (err) {
    return console.log(err.message);
  }

  console.log('Connected to SQlite3 database at', fpath);
});



// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });
app.use(cors({
  methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  optionsSuccessStatus: 200,
  origin: 'http://localhost:3000'
}));
// Server routes
app.get("/", (req, res) => {
  res.send("hello father");
});

// Populate drop-down selection of degree_plans
// Sends the entire degree_plan table
app.get("/api/degree_plans", async (req, res) => {
  const sql = `SELECT * FROM degree_plan`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    // rows.forEach((row) => {
    //   console.log(row.name);
    // });
    res.send(rows);
  });
});

// For a specific Degree plan, get all course info
app.get("/api/degree_plan_info", async (req, res) => {
  console.log(req.query);
  const plan_id  = req.query.id;
  // JOIN degree_plan ON degree_course_association.degree_plan_id = degree_plan.id
  db.all(
    `SELECT id, course_name, prefix, number, prerequisites, corequisites, strict_corequisites,
    credit_hours, institution, canonical_name, term, avg_c_gpao_pen, avg_s_gpao_pen, total_students,
    most_recent_term, earliest_term_offered, grades
    FROM course
    JOIN degree_course_association ON course.id = degree_course_association.course_id
    WHERE degree_course_association.degree_plan_id = ?
    ;`, 
    [ plan_id ], 
    (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
      res.send(rows);
    }
  );
  
});

app.listen(port, () => {
  console.log("Server running on port: ", port);
});