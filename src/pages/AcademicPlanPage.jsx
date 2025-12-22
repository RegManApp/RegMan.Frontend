import React, { useEffect, useState } from "react";
import academicPlanApi from "../api/academicPlanApi";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import toast from "react-hot-toast";

const defaultPlan = { name: "", description: "" };
const defaultAssign = { studentId: "", planId: "" };

const AcademicPlanPage = () => {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultPlan);
  const [editId, setEditId] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState(defaultAssign);
  const [courses, setCourses] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [progress, setProgress] = useState(null);

  // Student: fetch own progress
  const fetchStudentProgress = async () => {
    setLoading(true);
    try {
      const res = await academicPlanApi.getMyProgress();
      setProgress(res.data);
    } catch {
      toast.error("Failed to fetch academic progress");
    }
    setLoading(false);
  };

  // Admin: fetch all plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await academicPlanApi.getAll();
      setPlans(res.data);
    } catch {
      toast.error("Failed to fetch academic plans");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin()) fetchPlans();
    else fetchStudentProgress();
    // eslint-disable-next-line
  }, []);

  // Admin CRUD handlers
  const handleOpenModal = (plan = null) => {
    if (plan) {
      setForm({ ...plan });
      setEditId(plan.academicPlanId || plan.id);
    } else {
      setForm(defaultPlan);
      setEditId(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(defaultPlan);
    setEditId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await academicPlanApi.update({ ...form, academicPlanId: editId });
        toast.success("Academic plan updated");
      } else {
        await academicPlanApi.create(form);
        toast.success("Academic plan created");
      }
      fetchPlans();
      handleCloseModal();
    } catch {
      toast.error("Failed to save academic plan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this academic plan?")) return;
    try {
      await academicPlanApi.delete(id);
      toast.success("Academic plan deleted");
      fetchPlans();
    } catch {
      toast.error("Failed to delete academic plan");
    }
  };

  // Admin: assign plan to student
  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await academicPlanApi.assignStudent(assignForm);
      toast.success("Plan assigned to student");
      setAssignModal(false);
    } catch {
      toast.error("Failed to assign plan");
    }
  };

  // Admin: view courses in plan
  const handleViewCourses = async (plan) => {
    setSelectedPlan(plan);
    try {
      const res = await academicPlanApi.getCourses(plan.academicPlanId || plan.id);
      setCourses(res.data);
    } catch {
      toast.error("Failed to fetch courses");
    }
  };

  // Admin: add/remove courses (scaffold only)
  // ...implement as needed

  // Admin: view student progress (scaffold only)
  // ...implement as needed

  // Table columns
  const columns = [
    { Header: "ID", accessor: "academicPlanId" },
    { Header: "Name", accessor: "name" },
    { Header: "Description", accessor: "description" },
  ];
  if (isAdmin()) {
    columns.push({
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleOpenModal(row.original)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.original.academicPlanId || row.original.id)}>
            Delete
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setAssignModal(true)}>
            Assign
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleViewCourses(row.original)}>
            Courses
          </Button>
        </div>
      ),
    });
  }

  // Student view
  if (!isAdmin()) {
    return (
      <Card title="Degree Progress" subtitle="Plan compliance and completion">
        {progress ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="space-y-2">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Major:</strong> {progress.majorName || 'Not Assigned'}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Expected Graduation Year:</strong> {progress.expectedGraduationYear || '—'}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900 dark:text-white">
                  {progress.progressPercentage}% complete
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {progress.creditsCompleted} / {progress.totalCreditsRequired} credits
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-primary-600 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progress.progressPercentage || 0))}%` }}
                />
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Earned Credits</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {progress.creditsCompleted} / {progress.totalCreditsRequired}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Required Courses</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {progress.requiredCoursesCompletedCount} / {progress.requiredCoursesCount} completed
                </div>
              </div>
            </div>

            {/* Missing prerequisites warnings */}
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">
                Prerequisite Warnings
              </div>
              {Array.isArray(progress.missingPrerequisiteWarnings) && progress.missingPrerequisiteWarnings.length > 0 ? (
                <ul className="list-disc ml-6 text-sm text-yellow-800 dark:text-yellow-300">
                  {progress.missingPrerequisiteWarnings.map((w) => (
                    <li key={w.courseId}>
                      <strong>{w.courseCode}</strong>: missing {Array.isArray(w.missingCourseCodes) ? w.missingCourseCodes.join(', ') : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No prerequisite warnings detected.
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Warnings are inferred from plan ordering vs completed transcript courses.
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Card>
    );
  }

  // Admin view
  return (
    <Card title="Academic Plans">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleOpenModal()}>Add Plan</Button>
      </div>
      <Table columns={columns} data={plans} loading={loading} />
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? "Edit Academic Plan" : "Add Academic Plan"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Description" name="description" value={form.description} onChange={handleChange} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Plan to Student">
        <form onSubmit={handleAssign} className="space-y-4">
          <Input label="Student ID" name="studentId" value={assignForm.studentId} onChange={e => setAssignForm({ ...assignForm, studentId: e.target.value })} required />
          <Input label="Plan ID" name="planId" value={assignForm.planId} onChange={e => setAssignForm({ ...assignForm, planId: e.target.value })} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </Modal>
      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="Plan Courses">
        <div>
          <ul className="list-disc ml-6">
            {courses.map((c) => (
              <li key={c.courseId}>{c.courseName}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </Card>
  );
};

export default AcademicPlanPage;
