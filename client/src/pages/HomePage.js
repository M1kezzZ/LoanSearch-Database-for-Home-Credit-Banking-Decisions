import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
    const [applicantId, setApplicantId] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate(`/applicantpage/${applicantId}`);
    };

    return (
        <div className="homepage-container">
            <h1>Homepage</h1>
            {/* <div className="button-container">
              <button className="fancy-button" onClick={() => navigate('/')}>Homepage</button>
              <button className="fancy-button" onClick={() => navigate('/advanced-search')}>Advanced Search</button>
              <button className="fancy-button" onClick={() => navigate('/analytics')}>Analytics</button>
          </div> */}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Enter Applicant ID"
                    value={applicantId}
                    onChange={(e) => setApplicantId(e.target.value)}
                />
                <button className="fancy-button" onClick={handleSearch}>Search</button>
            </div>

            <style jsx>{`
                          .homepage-container {
                              text-align: center;
                              margin-top: 50px;
                          }
                          .button-container {
                              margin: 20px 0;
                          }
                          .fancy-button {
                              background-color: #594c4c; /* Updated color */
                              border: none;
                              color: white;
                              padding: 15px 32px;
                              text-align: center;
                              text-decoration: none;
                              display: inline-block;
                              font-size: 16px;
                              margin: 4px 2px;
                              cursor: pointer;
                              border-radius: 8px;
                              transition: background-color 0.3s, box-shadow 0.3s;
                          }
                          .fancy-button:hover {
                              background-color: #d33f43;
                              box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
                          }
                          .search-container {
                              margin: 20px 0;
                          }
                          input[type="text"] {
                              padding: 10px;
                              margin-right: 10px;
                              border-radius: 4px;
                              border: 1px solid #ccc;
                          }
                      `}</style>
        </div>
    );
}

