import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../api/adminApi";
import toast from "react-hot-toast";
import { Card, Button, Input } from "../components/common";

const AdminSettingsPage = () => {
  const { isAdmin } = useAuth();
  const [registrationStartDate, setRegistrationStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [withdrawStartDate, setWithdrawStartDate] = useState("");
  const [withdrawEndDate, setWithdrawEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      adminApi.getAcademicCalendarSettings().then((res) => {
        setRegistrationStartDate(res.data?.registrationStartDate || "");
        setRegistrationEndDate(res.data?.registrationEndDate || "");
        setWithdrawStartDate(res.data?.withdrawStartDate || "");
        setWithdrawEndDate(res.data?.withdrawEndDate || "");
      }).catch(() => {
        // fallback for older endpoint
        adminApi.getRegistrationEndDate().then((res) => {
          setRegistrationStartDate(res.data?.registrationStartDate || "");
          setRegistrationEndDate(res.data?.registrationEndDate || "");
          setWithdrawStartDate(res.data?.withdrawStartDate || "");
          setWithdrawEndDate(res.data?.withdrawEndDate || "");
        });
      });
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await adminApi.setAcademicCalendarSettings({
        registrationStartDate,
        registrationEndDate,
        withdrawStartDate,
        withdrawEndDate,
      });
      toast.success("Timeline updated");
    } catch (error) {
      toast.error("Failed to update timeline");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin()) return null;

  return (
    <div className="container mx-auto py-8">
      <Card title="Registration Timeline">
        <div className="space-y-4">
          <label className="block font-medium">Registration Open Date</label>
          <Input
            type="date"
            value={registrationStartDate}
            onChange={e => setRegistrationStartDate(e.target.value)}
          />
          <label className="block font-medium">Registration End Date</label>
          <Input
            type="date"
            value={registrationEndDate}
            onChange={e => setRegistrationEndDate(e.target.value)}
          />
          <label className="block font-medium">Withdraw Start Date</label>
          <Input
            type="date"
            value={withdrawStartDate}
            onChange={e => setWithdrawStartDate(e.target.value)}
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
