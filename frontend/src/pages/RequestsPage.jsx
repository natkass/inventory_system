import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchRequests } from "../redux/requestSlice";

const RequestsPage = () => {
  const dispatch = useDispatch();
  const requests = useSelector((state) => state.requests.requests);
  const status = useSelector((state) => state.requests.status);

  useEffect(() => {
    dispatch(fetchRequests()); // Fetch requests on mount
  }, [dispatch]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    return <div>No requests found.</div>;
  }

  return (
    <div>
      {requests.map((request) => (
        <div key={request.id}>
          <p>{request.title}</p>
        </div>
      ))}
    </div>
  );
};

export default RequestsPage;
