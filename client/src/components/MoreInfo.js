import { useEffect, useState } from 'react';
import { Box, Button, Modal } from '@mui/material';
import { TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@mui/material';

const config = require('../config.json');

// MoreInfo is a modal to display a new dialog window
export default function MoreInfo({ applicantId, handleClose }) {
    const [moreInfo, setMoreInfo] = useState({})

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/applicant/more/${applicantId}`)
            .then(res => res.json())
            .then(resJson => {
                setMoreInfo(resJson)
            })
    }, [applicantId]);


    const infoData = [
        { name: 'Application day of the week', value: moreInfo.WEEKDAY_APPR_PROCESS_START },
        { name: 'Application hour of the day', value: moreInfo.HOUR_APPR_PROCESS_START },
        { name: 'If permanent address matches contact address', value: moreInfo.ADDRESS_MATCH },
        { name: 'Region rating', value: moreInfo.REGION_RATING_CLIENT },
        { name: 'Type of organization where client works', value: moreInfo.ORGANIZATION_TYPE }
    ]

    return (
        <Modal
            open={true}
            onClose={handleClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box p={3} style={{ backgroundColor: 'white', width: '600', borderRadius: '10px' }}>
                <h1 style={{ margin: '20px' }}>More information: {applicantId}</h1>
                <TableContainer component={Paper} >
                    <Table style={{ margin: '20px' }} size="small">
                        <TableBody>
                            {infoData.map((data, index) => (
                                <TableRow key={index} >
                                    <TableCell style={{ width: '2rem' }}>{data.name}</TableCell>
                                    <TableCell style={{ width: '2rem' }}>{data.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
                Close
            </Button>
        </ Modal>
    )
}
