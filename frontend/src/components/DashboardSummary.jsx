import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardSummary } from "../redux/dashboardSlice";
import { Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const DashboardSummary = () => {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  const ordersData = [
    { name: "Completed", value: dashboard?.orders?.completed || 0 },
    { name: "Pending", value: dashboard?.orders?.pending || 0 },
    { name: "Reversed", value: dashboard?.orders?.reversed || 0 },
  ];

  const financialData = [
    { name: "Revenue", value: parseFloat(dashboard?.orders?.revenue || 0) },
    { name: "Profit", value: parseFloat(dashboard?.orders?.profit || 0) },
  ];

  const overviewData = [
    { name: "Customers", value: dashboard?.customers?.total || 0 },
    { name: "Manufacturers", value: dashboard?.manufacturers?.total || 0 },
    { name: "Products", value: dashboard?.products?.total || 0 },
    { name: "Low Stock", value: dashboard?.products?.low_stock || 0 },
    { name: "Categories", value: dashboard?.categories?.total || 0 },
    { name: "Users", value: dashboard?.users?.total || 0 },
  ];

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-xl space-y-6">
      <Typography variant="h4" className="text-white">📊 Analytics Dashboard</Typography>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {dashboard && (
        <>
          {/* Orders Status Pie Chart */}
          <div className="bg-gray-800 p-4 rounded-xl shadow">
            <Typography variant="h6">🧾 Order Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ordersData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {ordersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Bar Chart */}
          <div className="bg-gray-800 p-4 rounded-xl shadow">
            <Typography variant="h6">💰 Revenue vs Profit</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* System Overview */}
          <div className="bg-gray-800 p-4 rounded-xl shadow">
            <Typography variant="h6">🧩 System Overview</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSummary;
