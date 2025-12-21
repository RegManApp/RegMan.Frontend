import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../api/adminApi";
import toast from "react-hot-toast";
import { Card, Button, Input } from "../components/common";

const AdminSettingsPage = () => {
  const { isAdmin } = useAuth();
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [withdrawEndDate, setWithdrawEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      adminApi.getRegistrationEndDate().then((res) => {
        setRegistrationEndDate(res.data?.registrationEndDate || "");
        setWithdrawEndDate(res.data?.withdrawEndDate || "");
      });
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await adminApi.setRegistrationAndWithdrawDates(registrationEndDate, withdrawEndDate);
      toast.success("Dates updated");
    } catch (error) {
      toast.error("Failed to update dates");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin()) return null;

  return (
    <div className="container mx-auto py-8">
      <Card title="Registration & Withdraw Settings">
        <div className="space-y-4">
          <label className="block font-medium">Registration End Date</label>
          <Input
            type="date"
            value={registrationEndDate}
            onChange={e => setRegistrationEndDate(e.target.value)}
          />
          <label className="block font-medium">Withdraw End Date</label>
          <Input
            type="date"
            value={withdrawEndDate}
            onChange={e => setWithdrawEndDate(e.target.value)}
          />
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
