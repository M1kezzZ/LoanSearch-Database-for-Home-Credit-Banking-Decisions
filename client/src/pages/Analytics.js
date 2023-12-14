import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {Container } from "@mui/material";
import 'chart.js/auto';

const config = require("../config.json");

const AnalyticsPage = () => {
  const [applicationFrequency, setApplicationFrequency] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState([]);
  const [approvalRate, setApprovalRate] = useState([]);


  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/application_frequency`)
      .then(response => response.json())
      .then(data => setApplicationFrequency(data));

    fetch(`http://${config.server_host}:${config.server_port}/analytics/applications_count`)
      .then(response => response.json())
      .then(data => setApplicationsCount(data));

    fetch(`http://${config.server_host}:${config.server_port}/analytics/approval_rate`)
      .then(response => response.json())
      .then(data => setApprovalRate(data));
  }, []);

  // Data for the Application Frequency bar chart
  const applicationFrequencyData = {
    labels: applicationFrequency.map(item => item.days_apart_category),
    datasets: [
      {
        label: 'Application Count',
        data: applicationFrequency.map(item => item.application_count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Data for the Applications Count line chart
  const applicationsCountData = {
    labels: applicationsCount.map(item => `${item.Year}-${item.Month}`),
    datasets: [
      {
        label: 'Total Applications',
        data: applicationsCount.map(item => item.total_applications),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  // Data for the Approval Rate line chart
  const approvalRateData = {
    labels: approvalRate.map(item => `${item.Year}-${item.Month}`),
    datasets: [
      {
        label: 'Approval Rate (%)',
        data: approvalRate.map(item => item.approval_rate),
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  };

  return (
    <Container>

      <h2>Application Frequency</h2>
      <Bar data={applicationFrequencyData} />

      <h2>Applications Count Over Time</h2>
      <Line data={applicationsCountData} />

      <h2>Approval Rate Over Time</h2>
      <Line data={approvalRateData} />
    </Container>
  );
};

export default AnalyticsPage;


