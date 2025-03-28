// orders.js or wherever you want to handle this request

import axios from 'axios';

// Define the function to fetch orders
const fetchOrders = async (customerId = null, status = null) => {
  try {
    // Prepare the query parameters
    const params = {};
    if (customerId) params.customer_id = customerId;
    if (status) params.status = status;

    // Make the GET request to the Django API
    const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
      params: params,  // Add query params like customer_id, status, etc.
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("access_token")}`,  // Attach the access token
      },
    });

    // Log the response to check the data structure
    console.log(response.data);

    // You can then render or manipulate this data as needed in your app
    return response.data;  // This can be used for rendering or further processing

  } catch (error) {
    console.error('Error fetching orders:', error.response || error);
  }
};

// Example: Fetch orders for a specific customer with 'pending' status
fetchOrders(1, 'pending').then((data) => {
  // Handle the data after fetching, for example:
  console.log(data); // This will give you the paginated order data
});
