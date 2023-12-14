//TASK: to implement "more info" card
//TASK: to test if previous application and applicant data are retrieved and displayed correctly
//TASK: to implement overall %late and %payed data
//TASK: to implement loyalty data

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const config = require('../config.json');

export default function ApplicantPage() {
    const [applicantData, setApplicantData] = useState({});
    const [previousApplications, setPreviousApplications] = useState([]);
    const [selectedPrevAppId, setSelectedPrevAppId] = useState('');
    const [isDataFetched, setIsDataFetched] = useState(false);
    const { applicantId } = useParams(); // Access the applicantId from the URL
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch applicant data
                const applicantResponse = await fetch(`http://${config.server_host}:${config.server_port}/applicant/${applicantId}`);
                const applicantJson = await applicantResponse.json();
                setApplicantData(applicantJson);

                // Fetch previous applications data
                const previousAppsResponse = await fetch(`http://${config.server_host}:${config.server_port}/applicant/previous_applications/${applicantId}`);
                const previousAppsJson = await previousAppsResponse.json();
                setPreviousApplications(previousAppsJson);

                setIsDataFetched(true);
            } catch (error) {
                console.error(error);
                setIsDataFetched(false);
            }
        };

        if (applicantId) {
            fetchData();
        }
    }, [applicantId]);

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

    return (
        <div>
            <div className="navigation-buttons">
                <button onClick={() => navigate('/')}>Homepage</button>
                <button onClick={() => navigate('/advanced-search')}>Advanced Search</button>
                <button onClick={() => navigate('/analytics')}>Analytics</button>
            </div>


            {isDataFetched && (
                <>
                    <h1>Applicant ID: {applicantId}</h1>
                    {/* Render applicant data*/}
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
            <div className="info-button">
                    <button onClick={() => navigate('/info')}>More Info</button>
                </div>

                <style jsx>{`
                    .navigation-buttons {
                        text-align: center;
                        margin: 10px 0;
                    }
                    .info-button {
                        text-align: center;
                        margin-top: 20px;
                    }
                    button {
                        margin: 5px;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                `}</style>
            </div>
    );
}


