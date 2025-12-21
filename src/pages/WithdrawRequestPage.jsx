import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { enrollmentApi } from "../api/enrollmentApi";
import { adminApi } from "../api/adminApi";
import toast from "react-hot-toast";
import { Card, Button, Input, Modal } from "../components/common";

const WithdrawRequestPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [withdrawStartDate, setWithdrawStartDate] = useState("");
  const [withdrawEndDate, setWithdrawEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    enrollmentApi.getMyEnrollments().then((res) => {
      setEnrollments(res.data || []);
    });
    adminApi.getRegistrationEndDate().then((res) => {
      setRegistrationEndDate(res.data?.registrationEndDate || "");
      setWithdrawStartDate(res.data?.withdrawStartDate || "");
      setWithdrawEndDate(res.data?.withdrawEndDate || "");
    });
  }, []);

  const now = new Date();
  const canWithdraw = withdrawStartDate && withdrawEndDate && now >= new Date(withdrawStartDate) && now <= new Date(withdrawEndDate);

  const handleOpenModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.submitWithdrawRequest(user.id, selectedEnrollment.enrollmentId, reason);
      toast.success("Withdraw request submitted");
      setShowModal(false);
      setReason("");
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card title="Withdraw Requests">
        <p>Withdraw period: {withdrawStartDate} to {withdrawEndDate}</p>
        {canWithdraw ? (
          <ul className="space-y-4">
            {enrollments.filter(e => e.status === "Enrolled").map(enrollment => (
              <li key={enrollment.enrollmentId} className="flex justify-between items-center">
                <span>{enrollment.courseName || enrollment.sectionName}</span>
                <Button onClick={() => handleOpenModal(enrollment)}>
                  Request Withdraw
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">Withdraw period is not active.</p>
        )}
      </Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Withdraw Request">
        <div className="space-y-4">
          <label className="block font-medium">Reason for withdraw</label>
          <Input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Enter your reason"
          />
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WithdrawRequestPage;
