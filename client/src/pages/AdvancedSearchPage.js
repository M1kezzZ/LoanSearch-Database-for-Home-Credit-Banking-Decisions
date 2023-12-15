import React, { useState } from 'react';
const config = require("../config.json");


function SearchComponent() {
    const [minIncome, setMinIncome] = useState('');
    const [maxIncome, setMaxIncome] = useState('');
    const [minCredit, setMinCredit] = useState('');
    const [maxCredit, setMaxCredit] = useState('');
    const [minAnnuity, setMinAnnuity] = useState('');
    const [maxAnnuity, setMaxAnnuity] = useState('');
    const [results, setResults] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(50);
    
    const tableStyle = {
        width: '100%',        // Makes the table wider, taking the full width of its container
        textAlign: 'center',  // Centers the text in all cells
        borderCollapse: 'collapse', // Collapses borders between table cells
    };
    const fetchData = async () => {
        const queryParams = new URLSearchParams({
            minIncome,
            maxIncome,
            minCredit,
            maxCredit,
            minAnnuity,
            maxAnnuity
        });

    
    const url = `http://${config.server_host}:${config.server_port}/search?${queryParams.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = results.slice(indexOfFirstRow, indexOfLastRow);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(results.length / rowsPerPage);

    // Function to determine page numbers to display
    const pageNumbers = () => {
        const windowSize = 5;
        let start = Math.max(currentPage - 2, 1);
        let end = Math.min(start + windowSize - 1, totalPages);

        if (totalPages - start < windowSize) {
            start = Math.max(totalPages - windowSize + 1, 1);
        }

        return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
    };

    return (
        <div>
            {/* Input fields for ranges */}
            <input type="number" placeholder="Min Income" value={minIncome} onChange={e => setMinIncome(e.target.value)} />
            <input type="number" placeholder="Max Income" value={maxIncome} onChange={e => setMaxIncome(e.target.value)} />
            <input type="number" placeholder="Min Credit" value={minCredit} onChange={e => setMinCredit(e.target.value)} />
            <input type="number" placeholder="Max Credit" value={maxCredit} onChange={e => setMaxCredit(e.target.value)} />
            <input type="number" placeholder="Min Annuity" value={minAnnuity} onChange={e => setMinAnnuity(e.target.value)} />
            <input type="number" placeholder="Max Annuity" value={maxAnnuity} onChange={e => setMaxAnnuity(e.target.value)} />

            {/* Search Button */}
            <button onClick={fetchData}>Search</button>

            {/* Display Results */}
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Gender</th>
                        <th>Total Income</th>
                        <th>Income Type</th>
                        <th>Credit</th>
                        <th>Annuity</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((row) => (
                        <tr key={row.SK_ID_CURR}>
                            <td>{row.SK_ID_CURR}</td>
                            <td>{row.CODE_GENDER}</td>
                            <td>{row.AMT_INCOME_TOTAL}</td>
                            <td>{row.NAME_INCOME_TYPE}</td>
                            <td>{row.AMT_CREDIT}</td>
                            <td>{row.AMT_ANNUITY}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div>
                <button onClick={() => paginate(1)} disabled={currentPage === 1}>First</button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                {pageNumbers().map(number => (
                    <button key={number} onClick={() => paginate(number)} disabled={number === currentPage}>
                        {number}
                    </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>Last</button>
            </div>
        </div>
    );
}

export default SearchComponent;


