import React, { useEffect, useState, useMemo } from 'react';
import DashboardSummary from '../components/DashboardSummary';

const Dashboard = () => {
 
  return (
    <div className="p-4 bg-gray-900 rounded-xl text-white shadow-xl">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to the dashboard! Here you can find an overview of your business performance.</p>
      <DashboardSummary />
    </div>

  );
};

export default Dashboard;
