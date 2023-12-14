//TASK: to implement "more info" card
//TASK: to test if previous application and applicant data are retrieved and displayed correctly
//TASK: to implement overall %late and %payed data
//TASK: to implement loyalty data

import React, { useState } from 'react';
const config = require('../config.json');

export default function Applicant() {
    const [applicantData, setApplicantData] = useState({});
    const [previousApplications, setPreviousApplications] = useState([]);
    const [selectedPrevAppId, setSelectedPrevAppId] = useState(''); // State for selected previous application ID
    const [inputApplicantId, setInputApplicantId] = useState('');
    const [isDataFetched, setIsDataFetched] = useState(false);

    // Handling form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsDataFetched(false);

        try {
            // Fetch applicant data
            const applicantResponse = await fetch(`http://${config.server_host}:${config.server_port}/applicant/${inputApplicantId}`);
            const applicantJson = await applicantResponse.json();
            setApplicantData(applicantJson);

            // Fetch previous applications data
            const previousAppsResponse = await fetch(`http://${config.server_host}:${config.server_port}/applicant/previous_applications/${inputApplicantId}`);
            const previousAppsJson = await previousAppsResponse.json();
            setPreviousApplications(previousAppsJson);

            setIsDataFetched(true);
        } catch (error) {
            console.error(error);
        }
    };

    // Event handler for selecting a previous application
    const handlePrevAppSelection = (event) => {
        setSelectedPrevAppId(event.target.value);
    };

    // Find the details of the selected previous application
    const selectedPrevAppDetails = previousApplications.find(app => app.SK_ID_PREV.toString() === selectedPrevAppId);

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

    const previousAppTable = previousApplications.map(app => [
        { name: "Previous Application ID", value: app.SK_ID_PREV },
        { name: "Processed Days Ago", value: app.processed_days_ago },
        { name: "Status", value: app.status },
        { name: "Reject Reason", value: app.reject_reason },
        { name: "Percentage Late Payments", value: app.percentage_late_payments },
        { name: "Percentage Amount Paid", value: app.percentage_amount_paid },
    ]);
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="applicantIdInput">Enter Applicant ID: </label>
                <input
                    id="applicantIdInput"
                    type="text"
                    value={inputApplicantId}
                    onChange={(e) => setInputApplicantId(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>

            {isDataFetched && (
                <>
                    <h1>Applicant ID: {inputApplicantId}</h1>
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

                    {/* Dropdown for selecting a previous application */}
                    <label htmlFor="prevAppSelect">Select Previous Application:</label>
                    <select id="prevAppSelect" value={selectedPrevAppId} onChange={handlePrevAppSelection}>
                        <option value="">Select an Application</option>
                        {previousApplications.map(app => (
                            <option key={app.SK_ID_PREV} value={app.SK_ID_PREV}>
                                {app.SK_ID_PREV}
                            </option>
                        ))}
                    </select>

                    {selectedPrevAppDetails && (
                        <div>
                            <h2>Details for Application ID: {selectedPrevAppId}</h2>
                            <ul>
                                <li>Processed Days Ago: {selectedPrevAppDetails.processed_days_ago}</li>
                                <li>Status: {selectedPrevAppDetails.status}</li>
                                <li>Reject Reason: {selectedPrevAppDetails.reject_reason}</li>
                                <li>Percentage Late Payments: {selectedPrevAppDetails.percentage_late_payments}</li>
                                <li>Percentage Amount Paid: {selectedPrevAppDetails.percentage_amount_paid}</li>
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
