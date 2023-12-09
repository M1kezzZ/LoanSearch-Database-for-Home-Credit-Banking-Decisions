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

// /******************
//  * WARM UP ROUTES *
//  ******************/

// // Route 1: GET /author/:type
// const author = async function (req, res) {
//   // TODO (TASK 1): replace the values of name and pennKey with your own
//   //done:
//   const name = "Mike Peng";
//   const pennKey = "mikepen";

//   // checks the value of type the request parameters
//   // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
//   if (req.params.type === "name") {
//     // res.send returns data back to the requester via an HTTP response
//     res.send(`Created by ${name}`);
//   } else if (req.params.type === "pennkey") {
//     // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back response 'Created by [pennkey]'
//     //done:
//     res.send(`Created by ${pennKey}`);
//   } else {
//     // we can also send back an HTTP status code to indicate an improper request
//     res
//       .status(400)
//       .send(
//         `'${req.params.type}' is not a valid author type. Valid types are 'name' and 'pennkey'.`
//       );
//   }
// };

// // Route 2: GET /random
// const random = async function (req, res) {
//   // you can use a ternary operator to check the value of request query values
//   // which can be particularly useful for setting the default value of queries
//   // note if users do not provide a value for the query it will be undefined, which is falsey
//   const explicit = req.query.explicit === "true" ? 1 : 0;

//   // Here is a complete example of how to query the database in JavaScript.
//   // Only a small change (unrelated to querying) is required for TASK 3 in this route.
//   connection.query(
//     `
//     SELECT *
//     FROM Songs
//     WHERE explicit <= ${explicit}
//     ORDER BY RAND()
//     LIMIT 1
//   `,
//     (err, data) => {
//       if (err || data.length === 0) {
//         // If there is an error for some reason, or if the query is empty (this should not be possible)
//         // print the error message and return an empty object instead
//         console.log(err);
//         // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
//         // return type you may need to return an empty array [] instead.
//         res.json({});
//       } else {
//         // Here, we return results of the query as an object, keeping only relevant data
//         // being song_id and title which you will add. In this case, there is only one song
//         // so we just directly access the first element of the query results array (data)
//         // TODO (TASK 3): also return the song title in the response
//         // done:
//         res.json({
//           song_id: data[0].song_id,
//           title: data[0].title,
//         });
//       }
//     }
//   );
// };

// /********************************
//  * BASIC SONG/ALBUM INFO ROUTES *
//  ********************************/

// // Route 3: GET /song/:song_id
// const song = async function (req, res) {
//   // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
//   // Hint: unlike route 2, you can directly SELECT * and just return data[0]
//   // Most of the code is already written for you, you just need to fill in the query
//   connection.query(
//     `
//     SELECT *
//     FROM Songs
//     WHERE song_id = ?
//     `,
//     [req.params.song_id],
//     (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json({});
//       } else {
//         res.json(data[0]);
//       }
//     }
//   );
// };

// // Route 4: GET /album/:album_id
// const album = async function (req, res) {
//   // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
//   const album_id = req.params.album_id;
//   connection.query(
//     `
//   SELECT *
//   FROM Albums
//   WHERE album_id = ?
//   `,
//     [album_id],
//     (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json({});
//       } else {
//         res.json(data[0]);
//       }
//     }
//   );
// };

// // Route 5: GET /albums
// const albums = async function (req, res) {
//   // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
//   // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
//   connection.query(
//     `SELECT *
//     FROM Albums
//     ORDER BY release_date DESC`,
//     (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json([]);
//       } else {
//         res.json(data);
//       }
//     }
//   );
// };

// // Route 6: GET /album_songs/:album_id
// const album_songs = async function (req, res) {
//   // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
//   const album_id = req.params.album_id;
//   connection.query(
//     `
//   SELECT 
//     song_id, 
//     title, 
//     number, 
//     duration, 
//     plays
//   FROM Songs 
//   WHERE album_id = ?
//   ORDER BY number ASC
// `,
//     [album_id],
//     (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json([]);
//       } else {
//         res.json(data);
//       }
//     }
//   );
// };

// /************************
//  * ADVANCED INFO ROUTES *
//  ************************/

// // Route 7: GET /top_songs
// const top_songs = async function (req, res) {
//   const page = req.query.page;
//   // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
//   //const pageSize = parseInt(req.query.pageSize ?? 10);
//   //const pagesize = req.query.page_size
//   const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
//   const q1 = `
//   SELECT 
//     s.song_id, 
//     s.title, 
//     s.album_id, 
//     a.title AS album, 
//     s.plays
//   FROM Songs s
//   JOIN Albums a ON s.album_id = a.album_id
//   ORDER BY s.plays DESC
// `;
//   if (!page) {
//     // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
//     // Hint: you will need to use a JOIN to get the album title as well
//     connection.query(q1, (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json([]);
//       } else {
//         res.json(data);
//       }
//     });
//   } else {
//     // TODO (TASK 10): reimplement TASK 9 with pagination
//     // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)

//     const q2 = `${q1} LIMIT ? OFFSET ?`;
//     const offset = (page - 1) * pageSize;
//     connection.query(q2, [pageSize, offset], (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json([]);
//       } else {
//         res.json(data);
//       }
//     });
//   }
// };

// // Route 8: GET /top_albums
// const top_albums = async function (req, res) {
//   // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
//   // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
//   const page = req.query.page;
//   const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
//   const q1 = `
//       SELECT 
//       a.album_id, 
//       a.title, 
//       SUM(s.plays) AS plays
//     FROM Albums a
//     LEFT JOIN Songs s ON a.album_id = s.album_id
//     GROUP BY a.album_id, a.title
//     ORDER BY plays DESC`;
//   if (!page) {
//     connection.query(q1, (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json([]);
//       } else {
//         res.json(data);
//       }
//     });
//   } else {
//     const q2 = `${q1} LIMIT ? OFFSET ?`;
//     const offset = (page - 1) * pageSize;
//     connection.query(q2, [pageSize, offset], (err, data) => {
//       if (err || data.length === 0) {
//         console.log(err);
//         res.json([]);
//       } else {
//         res.json(data);
//       }
//     });
//   }
// };

// // Route 9: GET /search_albums
// const search_songs = async function (req, res) {
//   // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
//   // Some default parameters have been provided for you, but you will need to fill in the rest
//   const title = req.query.title ?? "";
//   const durationLow = req.query.duration_low ?? 60;
//   const durationHigh = req.query.duration_high ?? 660;
//   const playsLow = req.query.plays_low ?? 0;
//   const playsHigh = req.query.plays_high ?? 1100000000;
//   const danceabilityLow = req.query.danceability_low ?? 0;
//   const danceabilityHigh = req.query.danceability_high ?? 1;
//   const energyLow = req.query.energy_low ?? 0;
//   const energyHigh = req.query.energy_high ?? 1;
//   const valenceLow = req.query.valence_low ?? 0;
//   const valenceHigh = req.query.valence_high ?? 1;
//   const explicit = req.query.explicit === "true";

//   let query = `
//     SELECT 
//       song_id, album_id, title, duration, plays, danceability, 
//       energy, valence, number, tempo, key_mode, explicit
//     FROM Songs 
//     WHERE 
//       duration BETWEEN ? AND ? 
//       AND plays BETWEEN ? AND ? 
//       AND danceability BETWEEN ? AND ? 
//       AND energy BETWEEN ? AND ? 
//       AND valence BETWEEN ? AND ?
//       AND title LIKE ?
//   `;

//   if (!explicit) {
//     query += " AND explicit = 0";
//   }

//   query += " ORDER BY title ASC";

//   const params = [
//     durationLow,
//     durationHigh,
//     playsLow,
//     playsHigh,
//     danceabilityLow,
//     danceabilityHigh,
//     energyLow,
//     energyHigh,
//     valenceLow,
//     valenceHigh,
//     `%${title}%`,
//   ];

//   connection.query(query, params, (err, data) => {
//     if (err) {
//       console.log(err);
//       res.json([]);
//     } else {
//       res.json(data);
//     }
//   });
// };

// module.exports = {
//   author,
//   random,
//   song,
//   album,
//   albums,
//   album_songs,
//   top_songs,
//   top_albums,
//   search_songs,
// };

// route 1
const applicant = async function (req, res) {
  const query = `
      SELECT
          SK_ID_CURR AS applicant_id,
          DAYS_BIRTH / 365 AS age,
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

// route 2
const late_payment = async function (req, res) {
  const query = `
      SELECT 
          SK_ID_CURR AS applicant_id,
          SUM(CASE WHEN DAYS_INSTALMENT < DAYS_ENTRY_PAYMENT THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS percentage_late_payments,
          SUM(AMT_PAYMENT) / SUM(AMT_INSTALMENT) * 100 AS percentage_amount_paid
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

// route 3
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
              SUM(CASE WHEN DAYS_INSTALMENT < DAYS_ENTRY_PAYMENT THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS percentage_late_payments,
              SUM(AMT_PAYMENT) / SUM(AMT_INSTALMENT) * 100 AS percentage_amount_paid
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

  connection.query(query, [req.params.applicant_id, req.params.applicant_id], (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else if (data.length === 0) {
          res.status(404).send("No previous loan applications found for the provided applicant ID");
      } else {
          res.json(data);
      }
  });
};

// route 4
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

  connection.query(query, [req.params.applicant_id, req.params.applicant_id], (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else if (data.length === 0) {
          res.status(404).send("Applicant ID not found or no loan history available");
      } else {
          res.json(data[0]);
      }
  });
};

// route 5
const application_frequency = async function (req, res) {
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

  // Assuming caching logic is handled elsewhere
  connection.query(query, (err, data) => {
      if (err) {
          console.log(err);
          res.json([]);
      } else {
          res.json(data);
      }
  });
};

// route 6
const advance_search_applications = async function (req, res) {
  // Extracting query parameters with default values
  const incomeLow = req.query.AMT_INCOME_TOTAL_low ?? 0;
  const incomeHigh = req.query.AMT_INCOME_TOTAL_high ?? 1000000;
  const creditLow = req.query.AMT_CREDIT_low ?? 0;
  const creditHigh = req.query.AMT_CREDIT_high ?? 10000000;
  const annuityLow = req.query.AMT_ANNUITY_low ?? 0;
  const annuityHigh = req.query.AMT_ANNUITY_high ?? 1000000;
  const target = req.query.TARGET; // TARGET parameter

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
  const queryParams = [incomeLow, incomeHigh, creditLow, creditHigh, annuityLow, annuityHigh];
  if (target !== undefined) {
      query += ' AND TARGET = ?';
      queryParams.push(target);
  }

  query += ' ORDER BY SK_ID_CURR ASC;';

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


// route 7
const applicant_more = async function (req, res) {
  const query = `
      SELECT
          REGION_RATING_CLIENT, -- 1,2,3
          WEEKDAY_APPR_PROCESS_START, -- On which day of the week did the client apply for the loan
          HOUR_APPR_PROCESS_START, -- Approximately at what hour did the client apply for the loan
          REG_REGION_NOT_LIVE_REGION, -- Flag if client's permanent address does not match contact address (1=different, 0=same, at region level)
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

// route 8
const applications_count = async function (req, res) {
  const query = `
      WITH ApplicationDates AS (
          SELECT
              DATE_ADD(CURRENT_DATE, INTERVAL -DAYS_DECISION DAY) AS application_date
          FROM previous_application
          WHERE -DAYS_DECISION <= 365 * 3
      )
      SELECT
          YEAR(application_date) AS Year,
          MONTH(application_date) AS Month,
          COUNT(*) AS total_applications
      FROM ApplicationDates
      GROUP BY YEAR(application_date), MONTH(application_date)
      ORDER BY Year, Month;
  `;

  connection.query(query, (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else {
          // Ensuring that months with no applications are included with a count of zero
          const currentDate = new Date();
          const threeYearsAgo = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), 1);
          let result = [];
          for (let d = threeYearsAgo; d <= currentDate; d.setMonth(d.getMonth() + 1)) {
              let year = d.getFullYear();
              let month = d.getMonth() + 1;
              let found = data.find(row => row.Year === year && row.Month === month);
              result.push({
                  Year: year,
                  Month: month,
                  total_applications: found ? found.total_applications : 0
              });
          }
          res.json(result);
      }
  });
};

// route 9
const approval_rate = async function (req, res) {
  const query = `
      WITH ApplicationDates AS (
          SELECT
              DATE_ADD(CURRENT_DATE, INTERVAL -DAYS_DECISION DAY) AS application_date,
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
      ORDER BY Year, Month;
  `;

  connection.query(query, (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else {
          // Ensuring that months with no applications are included with an approval rate of zero
          const currentDate = new Date();
          const threeYearsAgo = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), 1);
          let result = [];
          for (let d = threeYearsAgo; d <= currentDate; d.setMonth(d.getMonth() + 1)) {
              let year = d.getFullYear();
              let month = d.getMonth() + 1;
              let found = data.find(row => row.Year === year && row.Month === month);
              result.push({
                  Year: year,
                  Month: month,
                  approval_rate: found ? found.approval_rate : 0
              });
          }
          res.json(result);
      }
  });
};


// route 10
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
  
};