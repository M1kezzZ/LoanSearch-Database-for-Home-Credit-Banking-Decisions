import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Divider } from '@mui/material';

import MoreInfo from '../components/MoreInfo';
const config = require('../config.json');

export default function ApplicantPage() {
    const [applicantData, setApplicantData] = useState({});
    const [previousApplications, setPreviousApplications] = useState([]);
    const [latePaymentData, setLatePaymentData] = useState({});
    const [loyaltyData, setLoyaltyData] = useState({});
    const [selectedPrevAppId, setSelectedPrevAppId] = useState('');
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const { applicantId } = useParams(); // Access the applicantId from the URL

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

                // Fetch late payment data
                const latePaymentResponse = await fetch(`http://${config.server_host}:${config.server_port}/applicant/late_payment/${applicantId}`);
                const latePaymentJson = await latePaymentResponse.json();
                setLatePaymentData(latePaymentJson);

                // Fetch loyalty data
                const loyaltyResponse = await fetch(`http://${config.server_host}:${config.server_port}/applicant/assess_loyalty/${applicantId}`);
                const loyaltyJson = await loyaltyResponse.json();
                setLoyaltyData(loyaltyJson);

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

    const latePaymentTable = [
        { name: "Overall percentage of late payment", value: latePaymentData.percentage_late_payments },
        { name: "Overall percentage of amount paid", value: latePaymentData.percentage_amount_paid },
    ]

    return (
        <div>
            {showMoreInfo && <MoreInfo applicantId={applicantId} handleClose={() => setShowMoreInfo(false)} />}
            {isDataFetched && (
                <>
                    <h1 style={{ margin: '20px' }}>Applicant ID: {applicantId}</h1>
                    {/* Render applicant data*/}

                    <TableContainer component={Paper} >
                        <Table style={{ margin: '20px' }} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applicantTable.map((data, index) => (
                                    <TableRow key={index} >
                                        <TableCell style={{ width: '2rem' }}>{data.name}</TableCell>
                                        <TableCell style={{ width: '2rem' }}>{data.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider />
                    <div className="info-button">
                        <button onClick={() => setShowMoreInfo(true)}> More Info </button>
                    </div>

                    <h2 style={{ margin: '20px' }}>Previous Payment History</h2>
                    {/* Render previous late payment data */}
                    <ul style={{ margin: '20px' }}>
                        {latePaymentTable.map((data, index) => (
                            <li key={index}>
                                <span>{data.name}: </span>
                                <span>{data.value}</span>
                            </li>
                        ))}
                    </ul>

                    <h2 style={{ margin: '20px' }}>Loyalty Assessment</h2>
                    {/* Render loyalty data */}
                    <ul style={{ margin: '20px' }}>
                        <li>Number of previous applications: {loyaltyData.num_prev_applications}</li>
                        <li>Trend of annuity: {loyaltyData.annuity_change}</li>
                        <li>Trend of credit amount: {loyaltyData.credit_amount_change}</li>
                    </ul>

                    <h2 style={{ margin: '20px' }}>Previous Application</h2>
                    {/* Dropdown for selecting a previous application */}
                    <label style={{ margin: '20px' }} htmlFor="prevAppSelect">Select Previous Application:</label>
                    <select style={{ margin: '20px' }} id="prevAppSelect" value={selectedPrevAppId} onChange={handlePrevAppSelection}>
                        <option value="">Select an Application</option>
                        {previousApplications.map(app => (
                            <option key={app.SK_ID_PREV} value={app.SK_ID_PREV}>
                                {app.SK_ID_PREV}
                            </option>
                        ))}
                    </select>

                    {selectedPrevAppDetails && (
                        <div>
                            <h3 style={{ margin: '20px' }}>Details for Application ID: {selectedPrevAppId}</h3>
                            <ul style={{ margin: '20px' }}>
                                <li>Processed Days Ago: {selectedPrevAppDetails.processed_days_ago}</li>
                                <li>Status: {selectedPrevAppDetails.status}</li>
                                <li>Reject Reason: {selectedPrevAppDetails.reject_reason}</li>
                                <li>Percentage Late Payments: {selectedPrevAppDetails.percentage_late_payments}</li>
                                <li>Percentage Amount Paid: {selectedPrevAppDetails.percentage_amount_paid}</li>
                            </ul>
                        </div>
                    )}
                </>
            )
            }

            <style jsx>{`
                    // .navigation-buttons {
                    //     text-align: center;
                    //     margin: 10px 0;
                    // }
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
        </div >
    );
}


