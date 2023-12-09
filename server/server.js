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
let applicationFrequencyCache = {
  data: null,
  lastUpdated: 0,
  expiryInSeconds: 3600 // 1 hour
};

// Function to update cache for Route 5
async function updateApplicationFrequencyCache() {
  // Replace with actual SQL query for Route 5
  const query = `
      WITH Application_Intervals AS (
          SELECT 
              SK_ID_CURR, 
              DAYS_DECISION, 
              LAG(DAYS_DECISION) OVER (PARTITION BY SK_ID_CURR ORDER BY DAYS_DECISION ASC) AS Previous_days_decision
          FROM previous_application
      ),
      Categorized_Intervals AS (
          SELECT 
              SK_ID_CURR, 
              CASE
                  WHEN ABS(DAYS_DECISION - Previous_DAYS_DECISION) <= 50 THEN 'Up to 50 days'
                  WHEN ABS(DAYS_DECISION - Previous_DAYS_DECISION) <= 100 THEN '51 to 100 days'
                  WHEN ABS(DAYS_DECISION - Previous_DAYS_DECISION) <= 150 THEN '101 to 150 days'
                  WHEN ABS(DAYS_DECISION - Previous_DAYS_DECISION) <= 200 THEN '151 to 200 days'
                  ELSE 'More than 200 days'
              END AS days_apart_category
          FROM Application_Intervals
          WHERE Previous_DAYS_DECISION IS NOT NULL
      )
      SELECT 
          days_apart_category,
          COUNT(*) AS application_count
      FROM Categorized_Intervals
      GROUP BY days_apart_category;
  `;
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching data for application frequency:', err);
          return;
      }
      applicationFrequencyCache = {
          data: results,
          lastUpdated: Date.now(),
          expiryInSeconds: applicationFrequencyCache.expiryInSeconds
      };
  });
}

// Route handler for the homepage
app.get('/Homepage', async (req, res) => {
  // Check if the cache for Route 5 needs updating
  if ((Date.now() - applicationFrequencyCache.lastUpdated) / 1000 > applicationFrequencyCache.expiryInSeconds) {
      await updateApplicationFrequencyCache();
  }

  // Respond with a simple HTML page or JSON, depending on your application's requirement
  res.send('<h1>Welcome to the Homepage</h1><p>Application Frequency Data is being updated in the background.</p>');
});



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
