import React, { useState } from 'react';
import {
  Button,
  Container,
  Grid,
  Slider,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
const config = require("../config.json");

export default function AdvancedSearch() {
    const [searchResults, setSearchResults] = useState([]);
    const [filters, setFilters] = useState({
        incomeTotal: [50000, 100000],
        credit: [50000, 100000],
        annuity: [20000, 40000]
    });
   

    const applyFilters = () => {
        const queryParams = new URLSearchParams({
            AMT_INCOME_TOTAL_low: filters.incomeTotal[0],
            AMT_INCOME_TOTAL_high: filters.incomeTotal[1],
            AMT_CREDIT_low: filters.credit[0],
            AMT_CREDIT_high: filters.credit[1],
            AMT_ANNUITY_low: filters.annuity[0],
            AMT_ANNUITY_high: filters.annuity[1]
        }).toString();

        fetch(`http://${config.server_host}:${config.server_port}/advanced_search?${queryParams}`)
            .then(res => res.json())
            .then(data => setSearchResults(data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleSliderChange = (name) => (event, newValue) => {
        setFilters({
            ...filters,
            [name]: newValue
        });
    };

    const columns = [
        { field: "SK_ID_CURR", headerName: "ID", width: 150 },
        { field: "AMT_INCOME_TOTAL", headerName: "Income Total", width: 200 },
        { field: "AMT_CREDIT", headerName: "Credit Amount", width: 200 },
        { field: "AMT_ANNUITY", headerName: "Annuity Amount", width: 200 },

    ];

    return (
        <Container>
            <Typography variant="h6" style={{ margin: '20px 0' }}>Range Search</Typography>
            
            <Grid container spacing={6}>
                {/* First Line */}
                <Grid item xs={6}>
                    <Typography gutterBottom>Income Total Range</Typography>
                    <Slider
                        value={filters.incomeTotal}
                        onChange={handleSliderChange('incomeTotal')}
                        valueLabelDisplay="auto"
                        min={50000}
                        max={100000}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Typography gutterBottom>Credit Amount Range</Typography>
                    <Slider
                        value={filters.credit}
                        onChange={handleSliderChange('credit')}
                        valueLabelDisplay="auto"
                        min={50000}
                        max={100000}
                    />
                </Grid>

                {/* Second Line */}
                <Grid item xs={6}>
                    <Typography gutterBottom>Annuity Amount Range</Typography>
                    <Slider
                        value={filters.annuity}
                        onChange={handleSliderChange('annuity')}
                        valueLabelDisplay="auto"
                        min={20000}
                        max={40000}
                    />
                </Grid>
            </Grid>

            <Button variant="contained" onClick={applyFilters} style={{ margin: '20px 0' }}>Apply Filters</Button>

            <DataGrid
                rows={searchResults}
                columns={columns}
                pageSize={10}
                autoHeight
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Container>
    );
}



