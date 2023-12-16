import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Button, Modal, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@mui/material';

const config = require('../config.json');

export default function MoreInfo({ applicantId, handleClose }) {
    const [moreInfo, setMoreInfo] = useState({})
    const [loanIncomeTrend, setLoanIncomeTrend] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/applicant/more/${applicantId}`)
            .then(res => res.json())
            .then(resJson => {
                if (resJson.length > 0) {
                    setMoreInfo(resJson[0]); // Set the first object of the array to moreInfo
                }
            });
        fetch(`http://${config.server_host}:${config.server_port}/applicant/applicant_trends/${applicantId}`)
            .then(res => res.json())
            .then(resJson => {
                setLoanIncomeTrend(resJson);
            })
    }, [applicantId]);

    const infoData = [
        { name: 'Application day of the week', value: moreInfo.WEEKDAY_APPR_PROCESS_START },
        { name: 'Application hour of the day', value: moreInfo.HOUR_APPR_PROCESS_START },
        { name: 'If permanent address matches contact address', value: moreInfo.ADDRESS_MATCH },
        { name: 'Region rating', value: moreInfo.REGION_RATING_CLIENT },
        { name: 'Type of organization where client works', value: moreInfo.ORGANIZATION_TYPE }
    ];


    // Data for the Applications Count line chart
    const loanIncomeTrendData = {
        labels: loanIncomeTrend.map(item => `${item.Year}-${item.Month}`),
        datasets: [
            {
                label: 'Total Income',
                data: loanIncomeTrend.map(item => item.Total_Income),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Average Annuity per Month',
                data: loanIncomeTrend.map(item => item.avg_annuity_per_month),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
                label: 'Average Loan Amount per Month',
                data: loanIncomeTrend.map(item => item.avg_loan_amount_per_month),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }
        ]
    };

    return (
        <Modal
            open={true}
            onClose={handleClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box p={3} style={{ backgroundColor: 'white', maxWidth: '600px', borderRadius: '10px', outline: 'none' }}>
                <h1 style={{ margin: '20px' }}>Applicant ID: {applicantId}</h1>
                <h2 style={{ margin: '20px' }}>More Information</h2>
                <TableContainer component={Paper}>
                    <Table style={{ margin: '20px' }} size="small">
                        <TableBody>
                            {infoData.map((data, index) => (
                                <TableRow key={index}>
                                    <TableCell style={{ width: '50%' }}>{data.name}</TableCell>
                                    <TableCell>{data.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <h2>Loan and Income Trend Over Time</h2>
                <Line data={loanIncomeTrendData} />

                <Button onClick={handleClose} style={{ display: 'block', margin: '20px auto' }}>
                    Close
                </Button>
            </Box>
        </Modal>
    )
}