//TASK: to implement "more info" card
//TASK: to test if previous application and applicant data are retrieved and displayed correctly
//TASK: to implement overall %late and %payed data
//TASK: to implement loyalty data
import React, { useEffect, useState } from 'react';

export default function Applicant() {
    const [applicantData, setApplicantData] = useState({});
    const [previousApplications, setPreviousApplications] = useState([]);

    useEffect(() => {
        // Fetch applicant data from route 1 applicant in routes.js
        fetch(`http://${config.server_host}:${config.server_port}/applicant/${applicant_id}`)
            .then((res) => res.json())
            .then(resJson => setApplicantData(resJson))
            .catch(error => console.error(error));

        // Fetch previous applications data from route 3 in routes.js
        fetch(`http://${config.server_host}:${config.server_port}/applicant/previous-applications/${applicant_id}`)
            .then((res) => res.json())
            .then(resJson => setPreviousApplications(resJson))
            .catch(error => console.error(error));
    }, [applicant_id]);

    const applicantTable = [
        { name: "Applicant ID", value: applicantData.applicant_id },
        { name: "Age", value: applicantData.age },
        { name: "Income Type", value: applicantData.income_type },
        { name: "Occupation", value: applicantData.occupation },
        { name: "Education", value: applicantData.education },
        { name: "Family Status", value: applicantData.family_status },
        { name: "Number of Children", value: applicantData.cnt_children },
        { name: "Housing Type", value: applicantData.housing_type },
        { name: "Region Rating", value: applicantData.region_rating },
        { name: "Own Car", value: applicantData.own_car },
        { name: "Own Realty", value: applicantData.own_realty },
        { name: "Contract Type", value: applicantData.contract_type },
        { name: "Credit Amount", value: applicantData.amt_credit },
        { name: "Annuity Amount", value: applicantData.amt_annuity },
    ];

    const previousAppTable = [
        { name: "Previous Application ID", value: previousApplications.SK_ID_PREV },
        { name: "Processed Days Ago", value: previousApplications.processed_days_ago },
        { name: "Status", value: previousApplications.status },
        { name: "Reject Reason", value: previousApplications.reject_reason },
        { name: "Percentage Late Payments", value: previousApplications.percentage_late_payments },
        { name: "Percentage Amount Paid", value: previousApplications.percentage_amount_paid },
    ];

    return (
        <div>
            <h1>Applicant ID: {applicant_id}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {applicantTable.map((data, index) => (
                        <tr key={index}>
                            <td>{data.name}</td>
                            <td>{data.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Previous Application Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {previousAppTable.map((data, index) => (
                        <tr key={index}>
                            <td>{data.name}</td>
                            <td>{data.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
