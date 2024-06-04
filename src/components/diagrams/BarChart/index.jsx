import { Bar } from 'react-chartjs-2';
import React from 'react';

const data = {
  labels: ['Sugar', 'Saturated Fat', 'Sodium'],
  datasets: [{
    label: 'Number of Products Exceeding Threshold',
    data: [150, 120, 130], // example data
    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
    borderWidth: 1
  }]
};

const options = {
  scales: {
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function(tooltipItem) {
          return `Total: ${tooltip

Item.raw}`;
        }
      }
    }
  },
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      // Handle click event, e.g., open modal to show product details
    }
  }
};

const MyBarChart = () => (
  <div>
    <h2>Products Exceeding Nutrient Thresholds</h2>
    <Bar data={data} options={options} />
  </div>
);

export default MyBarChart;
