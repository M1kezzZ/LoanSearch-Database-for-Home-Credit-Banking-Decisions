# LoanSearch: Database for Home Credit Banking Decisions

## Introduction

**LoanSearch** is a web application designed for Home Credit, a financial institution providing borrowing services to the unbanked population. This application integrates with Home Credit’s existing databases to help employees quickly retrieve applicant details, review application histories, and gather data-driven insights from built-in visual and analytics tools, aiding in better lending decisions.

## Features

### Home Page
- **Profile search**: Search for an applicant by ID and navigate to the applicant info page if the ID exists.

### Applicant Info Page
- **Profile display**: Shows applicant details including gender, demographics, total income, employment duration, number of children, occupation, etc.
- **Current application details**: Displays type of loan, credit amount, loan annuity, etc.
- **Payment history**: Shows the number of late installments and the percentage of payment shortfalls.
- **Loyalty assessment**: Indicates if the loan amount and annuity have increased/decreased compared to the first application.
- **Previous applications**: Allows selection of previous applications from a dropdown to view details.

### More Info Dialog Box
- **Detailed view**: Additional applicant details such as region rating, application processed day and time.
- **Trend lines**: Shows trends of the applicant’s income, annuity, and loan amount over time.

### Advanced Search Page
- **Search functionality**: Allows advanced searches on applications by annuity, income level, and loan amount.
- **Search results**: Returns a table of all applications meeting the criteria with links to the application info pages.

### Advanced Analytics Page
- **Approval rate visualization**: Displays historical approval rates of all applications by month.
- **Application frequency**: Visualizes the number of applications received by month and frequency of applications from all existing customers.

## Architecture

- **Backend**: Express-based server in Node.js.
- **Frontend**: React-based client.
- **Database**: MySQL hosted on AWS RDS.
- **Version Control**: Managed using GitHub.
- **Caching**: Implemented for long-running queries to improve performance.

## Data

Data is sourced from the [Home Credit Default Risk competition on Kaggle](https://www.kaggle.com/competitions/home-credit-default-risk/data).

### Tables

- **applicants**: Contains current applicant details.
- **previous_application**: Contains previously approved/rejected loan applications.
- **installments_payments**: Contains loan repayment history.

### Schema

![ER Diagram](docs/ER_Diagram.png)

## Queries

### Sample Queries

1. **Assess loyalty and previous applications**:
    ```sql
    WITH first_loan AS (
        SELECT AMT_APPLICATION AS first_loan_amount, AMT_ANNUITY AS first_annuity, COUNT(*) AS num_prev_applications
        FROM previous_application
        WHERE SK_ID_CURR = ${req.params.user_id}
        ORDER BY DAYS_DECISION
        LIMIT 1
    ),
    curr_loan AS (
        SELECT SK_ID_CURR, AMT_ANNUITY, AMT_CREDIT
        FROM applicants
        WHERE SK_ID_CURR = ${req.params.user_id}
    )
    SELECT SK_ID_CURR, num_prev_applications,
           IF(AMT_ANNUITY > first_annuity, 'Increased', 'Not Increased') AS Annuity_Change,
           IF(AMT_CREDIT > first_loan_amount, 'Increased', 'Not Increased') AS Credit_Amount_Change
    FROM curr_loan JOIN first_loan;
    ```

2. **Application frequency intervals**:
    ```sql
    WITH Application_Intervals AS (
        SELECT SK_ID_CURR, DAYS_DECISION,
               LAG(DAYS_DECISION) OVER (PARTITION BY SK_ID_CURR ORDER BY DAYS_DECISION ASC) AS Previous_days_decision
        FROM previous_application
    ),
    Categorized_Intervals AS (
        SELECT SK_ID_CURR,
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
    SELECT days_apart_category, COUNT(*) AS application_count
    FROM Categorized_Intervals
    GROUP BY days_apart_category;
    ```

## Performance Evaluation

- **Indexing**: Significantly improved query speed.
- **Caching**: Implemented for specific query routes to reduce load times on the analytics page.

## Technical Challenges

1. **Server-side range search**: Established a new route to specify the exact range for testing range search functionality.
2. **Asynchronous requests**: Managed using async/await and error handling with try/catch blocks.
3. **Pagination and UI consistency**: Implemented pagination using React's useState and styled components using Material-UI.
4. **Data visualization**: Used react-chartjs-2 for effective data visualization.
5. **Security**: Ensured secure client-side interactions with input validation and secure server communication.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Video Demo

[Watch the demo](https://drive.google.com/file/d/1Ew-if5U0lhndOvnTEsR3IDPwA3y5L21U/view?usp=sharing)

---

Developed by Yuzhuo Kang, Tianyi Miao, Mike Peng, and Candice Zhou for CIS 4500/5500 Database and Information Systems at the University of Pennsylvania.
