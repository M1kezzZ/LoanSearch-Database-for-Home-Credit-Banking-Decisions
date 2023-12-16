const mysql = require("mysql");
const config = require("./config.json");

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
});
connection.connect((err) => err && console.log(err));


let applicationsCountCache = {
  data: null,
  lastUpdated: 0,
  expiryInSeconds: 3600, // 1 hour
};

let approvalRateCache = {
  data: null,
  lastUpdated: 0,
  expiryInSeconds: 3600, // 1 hour
};

let applicationFrequencyCache = {
  data: null,
  lastUpdated: 0,
  expiryInSeconds: 3600, // 1 hour
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
      console.error("Error fetching data for application frequency:", err);
      return;
    }
    applicationFrequencyCache = {
      data: results,
      lastUpdated: Date.now(),
      expiryInSeconds: applicationFrequencyCache.expiryInSeconds,
    };
  });
}

// function to update route 8 cache
async function updateApplicationsCountCache() {
  const applicationsCountQuery = `WITH ApplicationDates AS (
    SELECT
        DATE_ADD(CURRENT_DATE, INTERVAL DAYS_DECISION DAY) AS application_date
    FROM previous_application
    WHERE -DAYS_DECISION <= 365 * 3
)
SELECT
    YEAR(application_date) AS Year,
    MONTH(application_date) AS Month,
    COUNT(*) AS total_applications
FROM ApplicationDates
GROUP BY YEAR(application_date), MONTH(application_date)
ORDER BY Year, Month;`; // Replace with the actual SQL query

  connection.query(applicationsCountQuery, (err, results) => {
    if (!err) {
      applicationsCountCache = {
        data: results,
        lastUpdated: Date.now(),
        expiryInSeconds: applicationsCountCache.expiryInSeconds,
      };
    }
  });
}

// Function to update approval rate cache (route 9)
async function updateApprovalRateCache() {
  const approvalRateQuery = `WITH ApplicationDates AS (
    SELECT
        DATE_ADD(CURRENT_DATE, INTERVAL DAYS_DECISION DAY) AS application_date,
        NAME_CONTRACT_STATUS as contract_status
    FROM previous_application
    WHERE -DAYS_DECISION <= 365 * 3
),
MonthlyApplications AS (
    SELECT
        YEAR(application_date) AS Year,
        MONTH(application_date) AS Month,
        COUNT(*) AS total_applications,
        SUM(CASE WHEN contract_status = 'Approved' THEN 1 ELSE 0 END) AS approved_applications
    FROM ApplicationDates
    GROUP BY YEAR(application_date), MONTH(application_date)
)
SELECT
    Year,
    Month,
    IFNULL((approved_applications / total_applications) * 100, 0) AS approval_rate
FROM MonthlyApplications
ORDER BY Year, Month;`; // Replace with the actual SQL query

  connection.query(approvalRateQuery, (err, results) => {
    if (!err) {
      approvalRateCache = {
        data: results,
        lastUpdated: Date.now(),
        expiryInSeconds: approvalRateCache.expiryInSeconds,
      };
    }
  });
}

// route 1: Return all information and application details of a current applicant 
// by its application ID, including past installment performance
const applicant = async function (req, res) {
  const query = `
      SELECT
          SK_ID_CURR AS applicant_id,  
          FLOOR(DAYS_BIRTH / 365 *(-1)) AS age,
          AMT_INCOME_TOTAL AS income,
          NAME_INCOME_TYPE AS income_type,
          OCCUPATION_TYPE AS occupation,
          DAYS_EMPLOYED AS days_employed,
          NAME_EDUCATION_TYPE AS education,
          NAME_FAMILY_STATUS AS family_status,
          CNT_CHILDREN AS cnt_children,
          NAME_HOUSING_TYPE AS housing_type,
          REGION_RATING_CLIENT AS region_rating,
          FLAG_OWN_CAR AS own_car,
          FLAG_OWN_REALTY AS own_realty, -- Profile data
          NAME_CONTRACT_TYPE AS contract_type,
          AMT_CREDIT AS amt_credit,
          AMT_ANNUITY AS amt_annuity -- Loan details
      FROM applicants
      WHERE SK_ID_CURR = ?
  `;

  connection.query(query, [req.params.applicant_id], (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else if (data.length === 0) {
      res.status(404).send("The ID does not exist");
    } else {
      res.json(data[0]);
    }
  });
};

// route 2: Compute percentage of late payment for a particular applicant from all his/her previous applications
const late_payment = async function (req, res) {
  const query = `
      SELECT 
          SK_ID_CURR AS applicant_id,
          CONCAT(FORMAT(SUM(CASE WHEN DAYS_INSTALMENT < DAYS_ENTRY_PAYMENT THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') AS percentage_late_payments,
          CONCAT(FORMAT(SUM(AMT_PAYMENT) / SUM(AMT_INSTALMENT) * 100, 2), '%') AS percentage_amount_paid
      FROM installments_payments
      WHERE SK_ID_CURR = ?
      GROUP BY SK_ID_CURR;
  `;

  connection.query(query, [req.params.applicant_id], (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else if (data.length === 0) {
      res.status(404).send("Applicant ID not found");
    } else {
      res.json(data[0]);
    }
  });
};

// route 3: Return previous loans (including % of late payments and amount paid)
// for each applicant and some key information, including status (approved, canceled, refused, etc.),
// reason for refusal if applicable; order by the time the previous application was processed (latest first and oldest last)

const previous_applications = async function (req, res) {
  const query = `
      WITH their_prev AS (
          SELECT
              SK_ID_PREV,
              -DAYS_DECISION AS processed_days_ago,
              NAME_CONTRACT_STATUS AS status, -- approved, canceled, refused, unused offer
              CODE_REJECT_REASON AS reject_reason
          FROM previous_application
          WHERE SK_ID_CURR = ?
          AND FLAG_LAST_APPL_PER_CONTRACT = 'Y' -- Retrieve only latest per application
      ), 
      prev_late AS (
          SELECT
              SK_ID_PREV,
              CONCAT(FORMAT(SUM(CASE WHEN DAYS_INSTALMENT < DAYS_ENTRY_PAYMENT THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') AS percentage_late_payments,
              CONCAT(FORMAT(SUM(AMT_PAYMENT) / SUM(AMT_INSTALMENT) * 100, 2), '%') AS percentage_amount_paid
          FROM installments_payments
          WHERE SK_ID_CURR = ?
          GROUP BY SK_ID_PREV
      )
      SELECT
          tp.SK_ID_PREV,
          tp.processed_days_ago,
          tp.status,
          tp.reject_reason,
          pl.percentage_late_payments,
          pl.percentage_amount_paid
      FROM their_prev tp 
      JOIN prev_late pl ON tp.SK_ID_PREV = pl.SK_ID_PREV
      ORDER BY tp.processed_days_ago DESC;
  `;

  connection.query(
    query,
    [req.params.applicant_id, req.params.applicant_id],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else if (data.length === 0) {
        res
          .status(404)
          .send(
            "No previous loan applications found for the provided applicant ID"
          );
      } else {
        res.json(data);
      }
    }
  );
};

// route 4: Assess how many previous loan applications a client has
// and whether the loan terms, such as the annuity and credit amount,
// have improved over time (current application > first application), 
// suggesting increased loyalty to the lender.

const assess_loyalty = async function (req, res) {
  const query = `
      WITH first_loan AS (
          SELECT
              AMT_APPLICATION AS first_loan_amount,
              AMT_ANNUITY AS first_annuity,
              COUNT(*) AS num_prev_applications
          FROM previous_application
          WHERE SK_ID_CURR = ?
          ORDER BY DAYS_DECISION
          LIMIT 1
      ),
      curr_loan AS (
          SELECT
              SK_ID_CURR,
              AMT_ANNUITY,
              AMT_CREDIT
          FROM applicants
          WHERE SK_ID_CURR = ?
      )
      SELECT
          cl.SK_ID_CURR AS applicant_id,
          fl.num_prev_applications,
          IF(cl.AMT_ANNUITY > fl.first_annuity, 'Increased', 'Not Increased') AS annuity_change,
          IF(cl.AMT_CREDIT > fl.first_loan_amount, 'Increased', 'Not Increased') AS credit_amount_change
      FROM curr_loan cl
      JOIN first_loan fl;
  `;

  connection.query(
    query,
    [req.params.applicant_id, req.params.applicant_id],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else if (data.length === 0) {
        res
          .status(404)
          .send("Applicant ID not found or no loan history available");
      } else {
        res.json(data[0]);
      }
    }
  );
};

// route 5: Display the count of different application intervals to understand
// the frequency of applications from all existing customers
const application_frequency = async function (req, res) {
  const currentTime = Date.now();

  // Check if cached data is available and not expired
  if (
    applicationFrequencyCache.data &&
    currentTime - applicationFrequencyCache.lastUpdated <
    applicationFrequencyCache.expiryInSeconds * 1000
  ) {
    // Returning cached data
    return res.json(applicationFrequencyCache.data);
  } else {
    // Update the cache if data is not available or expired
    updateApplicationFrequencyCache()
      .then(() => {
        // Return the updated data
        if (applicationFrequencyCache.data) {
          res.json(applicationFrequencyCache.data);
        } else {
          res.status(500).send("Fetching application frequency data");
        }
      })
      .catch((err) => {
        console.error("Error updating application frequency cache:", err);
        res.status(500).send("Error fetching application frequency data");
      });
  }
};

// route 6: Range search on current and previous application database
const advance_search_applications = async function (req, res) {
  // Extracting query parameters with default values
  const incomeLow = req.query.AMT_INCOME_TOTAL_low ?? 0;
  const incomeHigh = req.query.AMT_INCOME_TOTAL_high ?? 1000000;
  const creditLow = req.query.AMT_CREDIT_low ?? 0;
  const creditHigh = req.query.AMT_CREDIT_high ?? 10000000;
  const annuityLow = req.query.AMT_ANNUITY_low ?? 0;
  const annuityHigh = req.query.AMT_ANNUITY_high ?? 1000000;

  // Building the SQL query
  let query = `
      SELECT 
          SK_ID_CURR,
          CODE_GENDER,
          AMT_INCOME_TOTAL,
          NAME_INCOME_TYPE,
          AMT_CREDIT,
          AMT_ANNUITY
      FROM applicants
      WHERE 
          AMT_INCOME_TOTAL BETWEEN ? AND ?
          AND AMT_CREDIT BETWEEN ? AND ?
          AND AMT_ANNUITY BETWEEN ? AND ?
  `;

  // Adding the TARGET filter if provided
  const queryParams = [
    incomeLow,
    incomeHigh,
    creditLow,
    creditHigh,
    annuityLow,
    annuityHigh,
  ];

  query += " ORDER BY SK_ID_CURR ASC;";

  // Executing the query
  connection.query(query, queryParams, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// route 7: Simply return some side information about the application/client (if we have the client id).
// This will be in a new info page if someone wants to check further infos.

const applicant_more = async function (req, res) {
  const query = `
      SELECT
          REGION_RATING_CLIENT, -- 1,2,3
          WEEKDAY_APPR_PROCESS_START, -- On which day of the week did the client apply for the loan
          HOUR_APPR_PROCESS_START, -- Approximately at what hour did the client apply for the loan
          CASE REG_REGION_NOT_LIVE_REGION
              WHEN 1 THEN 'different'
              WHEN 0 THEN 'same'
          END AS ADDRESS_MATCH, -- Flag if client's permanent address does not match contact address (1=different, 0=same, at region level)
          ORGANIZATION_TYPE -- Type of organization where client works
      FROM applicants
      WHERE SK_ID_CURR = ?
  `;

  connection.query(query, [req.params.applicant_id], (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else if (data.length === 0) {
      res.status(404).send("Applicant ID not found");
    } else {
      res.json(data);
    }
  });
};

// route 8: Count the number of applications received each month in the
// last three years. It first calculates the actual dates of previous application 
// decisions, filters these dates to include only those within the last three years, 
// and groups these dates by year and month. For each group, it counts the total 
// number of applications.

const applications_count = async function (req, res) {
  const currentTime = Date.now();
  if (
    currentTime - applicationsCountCache.lastUpdated <
    applicationsCountCache.expiryInSeconds * 1000
  ) {
    return res.json(applicationsCountCache.data);
  } else {
    updateApplicationsCountCache()
      .then(() => {
        res.json(applicationsCountCache.data);
      })
      .catch((err) => {
        console.error("Error updating applications count cache:", err);
        res.status(500).send("Error fetching applications count");
      });
  }
};

// route 9: Computes the approval rate of applications per month.
// It includes the records from the last three years, and counts the total number 
// of applications and approved applications for each month. Then it calculates 
// the approval rate of applications per month using the previously monthly computation.

const approval_rate = async function (req, res) {
  const currentTime = Date.now();
  if (
    currentTime - approvalRateCache.lastUpdated <
    approvalRateCache.expiryInSeconds * 1000
  ) {
    return res.json(approvalRateCache.data);
  } else {
    updateApprovalRateCache()
      .then(() => {
        res.json(approvalRateCache.data);
      })
      .catch((err) => {
        console.error("Error updating approval rate cache:", err);
        res.status(500).send("Error fetching approval rate");
      });
  }
};

// route 10: Extracts the income and loan amount information 
// from the current application and aligns it with the dates from the previous 
// applications to show the trends of income and loan amount over time for each applicant.
// It calculates the average loan amount and average income for each month.

const applicant_trends = async function (req, res) {
  const query = `
      WITH Trends AS (
          SELECT
              a.SK_ID_CURR,
              a.AMT_INCOME_TOTAL AS Total_Income,
              COALESCE(a.AMT_CREDIT, 0) + COALESCE(p.AMT_CREDIT, 0) AS Loan_Amount,
              COALESCE(a.AMT_ANNUITY, 0) + COALESCE(p.AMT_ANNUITY, 0) AS Total_Annuity, 
              DATE_ADD(CURRENT_DATE, INTERVAL -p.DAYS_DECISION DAY) AS Application_Date
          FROM applicants a
          LEFT JOIN previous_application p ON a.SK_ID_CURR = p.SK_ID_CURR
          WHERE a.SK_ID_CURR = ?
      )
      SELECT
          YEAR(Application_Date) AS Year,
          MONTH(Application_Date) AS Month,
          Total_Income,
          AVG(Total_Annuity) AS avg_annuity_per_month,
          AVG(Loan_Amount) AS avg_loan_amount_per_month
      FROM Trends
      GROUP BY YEAR(Application_Date), MONTH(Application_Date)
      ORDER BY Year, Month;
  `;

  connection.query(query, [req.params.applicant_id], (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else if (data.length === 0) {
      res.status(404).send("No data available for the specified applicant ID");
    } else {
      res.json(data);
    }
  });
};

//route 11
// This is your existing server-side route with minor adjustments.
// Ensure that it returns all data when no filters are applied.

const advance_search_test = async function (req, res) {
  let minIncome = req.query.minIncome || 0;
  let maxIncome = req.query.maxIncome || Number.MAX_SAFE_INTEGER;
  let minCredit = req.query.minCredit || 0;
  let maxCredit = req.query.maxCredit || Number.MAX_SAFE_INTEGER;
  let minAnnuity = req.query.minAnnuity || 0;
  let maxAnnuity = req.query.maxAnnuity || Number.MAX_SAFE_INTEGER;

  let query = `
      SELECT 
          SK_ID_CURR,
          CODE_GENDER,
          AMT_INCOME_TOTAL,
          NAME_INCOME_TYPE,
          AMT_CREDIT,
          AMT_ANNUITY
      FROM applicants
      WHERE AMT_INCOME_TOTAL BETWEEN ? AND ?
      AND AMT_CREDIT BETWEEN ? AND ?
      AND AMT_ANNUITY BETWEEN ? AND ?
      ORDER BY SK_ID_CURR ASC
  `;

  connection.query(
    query,
    [minIncome, maxIncome, minCredit, maxCredit, minAnnuity, maxAnnuity],
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
};

const homepage = async function (req, res) {
  // Current time
  const currentTime = Date.now();

  // Check if the cache for Route 5 needs updating
  if (
    (currentTime - applicationFrequencyCache.lastUpdated) / 1000 >
    applicationFrequencyCache.expiryInSeconds
  ) {
    await updateApplicationFrequencyCache();
  }

  // Check if the cache for Route 8 needs updating
  if (
    (currentTime - applicationsCountCache.lastUpdated) / 1000 >
    applicationsCountCache.expiryInSeconds
  ) {
    await updateApplicationsCountCache();
  }

  // Check if the cache for Route 9 needs updating
  if (
    (currentTime - approvalRateCache.lastUpdated) / 1000 >
    approvalRateCache.expiryInSeconds
  ) {
    await updateApprovalRateCache();
  }

  // Respond with a simple HTML page
  res.send(
    "<h1>Welcome to the Homepage</h1><p>Caches for Application Frequency, Applications Count, and Approval Rate are being updated in the background.</p>"
  );
};

module.exports = {
  applicant,
  late_payment,
  previous_applications,
  assess_loyalty,
  application_frequency,
  advance_search_applications,
  applicant_more,
  applications_count,
  approval_rate,
  applicant_trends,
  homepage,
  advance_search_test,
};
