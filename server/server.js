const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});

connection.connect(err => {
  if (err) {
      console.error('Error connecting to the database:', err);
      return;
  }
  console.log('Connected to the database.');
});

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// Cache setup for Route 5


// Route handler for the homepage
app.get("/homepage", routes.homepage);



// Route: GET /applicant/:applicant_id
app.get("/applicant/:applicant_id", routes.applicant);

// Route: GET /applicant/late_payment/:applicant_id
app.get("/applicant/late_payment/:applicant_id", routes.late_payment);

// Route: GET /applicant/previous_applications/:applicant_id
app.get(
  "/applicant/previous_applications/:applicant_id",
  routes.previous_applications
);

// Route: GET /applicant/assess_loyalty/:applicant_id
app.get("/applicant/assess_loyalty/:applicant_id", routes.assess_loyalty);

// Route: GET /application_frequency
app.get("/application_frequency", routes.application_frequency);

// Route: GET /advance_search
app.get("/advance_search", routes.advance_search_applications);

// Route: GET /applicant/more/:applicant_id
app.get("/applicant/more/:applicant_id", routes.applicant_more);

// Route: GET /analytics/applications_count
app.get("/analytics/applications_count", routes.applications_count);

// Route: GET /analytics/approval_rate
app.get("/analytics/approval_rate", routes.approval_rate);

// Route: GET /applicant/applicant_trends/:applicant_id
app.get("/applicant/applicant_trends/:applicant_id", routes.applicant_trends);

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});

module.exports = app;
