import React, { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import toast from "react-hot-toast";
import { Card, Button, Table } from "../components/common";

const AdminWithdrawRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getWithdrawRequests();
      setRequests(res.data || []);
    } catch (error) {
      toast.error("Failed to load withdraw requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await adminApi.approveWithdrawRequest(requestId);
      toast.success("Request approved");
      loadRequests();
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleDeny = async (requestId) => {
    try {
      await adminApi.denyWithdrawRequest(requestId);
      toast.success("Request denied");
      loadRequests();
    } catch (error) {
      toast.error("Failed to deny request");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card title="Withdraw Requests">
        {isLoading ? (
          <div>Loading...</div>
        ) : requests.length === 0 ? (
          <div>No withdraw requests.</div>
        ) : (
          <Table
            columns={[
              { key: "studentId", header: "Student ID" },
              { key: "enrollmentId", header: "Enrollment ID" },
              { key: "reason", header: "Reason" },
              { key: "status", header: "Status" },
              { key: "submittedAt", header: "Submitted At" },
              { key: "actions", header: "Actions", render: (row) => (
                row.status === "Pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => handleApprove(row.requestId)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeny(row.requestId)}>Deny</Button>
                  </div>
                ) : null
              ) },
            ]}
            data={requests}
            emptyMessage="No withdraw requests."
          />
        )}
      </Card>
    </div>
  );
};

export default AdminWithdrawRequestsPage;
