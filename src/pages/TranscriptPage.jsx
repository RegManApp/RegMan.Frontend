import React, { useEffect, useState } from "react";
import transcriptApi from "../api/transcriptApi";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import toast from "react-hot-toast";

const defaultForm = {
  studentId: "",
  courseId: "",
  semester: "",
  year: "",
  grade: "",
};

const TranscriptPage = () => {
  const { isAdmin, user } = useAuth();
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({});

  // Fetch transcripts based on role
  const fetchTranscripts = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin()) {
        res = await transcriptApi.getAll(filters);
      } else {
        res = await transcriptApi.getMyTranscript();
      }
      setTranscripts(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (e) {
      toast.error("Failed to fetch transcripts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTranscripts();
    // eslint-disable-next-line
  }, [JSON.stringify(filters)]);

  // Admin CRUD handlers
  const handleOpenModal = (transcript = null) => {
    if (transcript) {
      setForm({ ...transcript });
      setEditId(transcript.id);
    } else {
      setForm(defaultForm);
      setEditId(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await transcriptApi.update({ ...form, id: editId });
        toast.success("Transcript updated");
      } else {
        await transcriptApi.create(form);
        toast.success("Transcript created");
      }
      fetchTranscripts();
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save transcript");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transcript?")) return;
    try {
      await transcriptApi.delete(id);
      toast.success("Transcript deleted");
      fetchTranscripts();
    } catch {
      toast.error("Failed to delete transcript");
    }
  };

  // Admin GPA recalculation
  const handleRecalculateGpa = async (studentId) => {
    try {
      await transcriptApi.recalculateGpa(studentId);
      toast.success("GPA recalculated");
      fetchTranscripts();
    } catch {
      toast.error("Failed to recalculate GPA");
    }
  };

  // Admin filter handler
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Table columns
  const columns = [
    { Header: "ID", accessor: "id" },
    { Header: "Student", accessor: "studentId" },
    { Header: "Course", accessor: "courseId" },
    { Header: "Semester", accessor: "semester" },
    { Header: "Year", accessor: "year" },
    { Header: "Grade", accessor: "grade" },
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
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.original.id)}>
            Delete
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleRecalculateGpa(row.original.studentId)}>
            Recalc GPA
          </Button>
        </div>
      ),
    });
  }

  return (
    <Card title="Transcript">
      {isAdmin() && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <Button onClick={() => handleOpenModal()}>Add Transcript</Button>
          <Input placeholder="Student ID" name="studentId" value={filters.studentId || ""} onChange={handleFilterChange} />
          <Input placeholder="Course ID" name="courseId" value={filters.courseId || ""} onChange={handleFilterChange} />
          <Input placeholder="Semester" name="semester" value={filters.semester || ""} onChange={handleFilterChange} />
          <Input placeholder="Year" name="year" value={filters.year || ""} onChange={handleFilterChange} />
          <Input placeholder="Grade" name="grade" value={filters.grade || ""} onChange={handleFilterChange} />
        </div>
      )}
      <Table columns={columns} data={transcripts} loading={loading} />
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? "Edit Transcript" : "Add Transcript"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Student ID" name="studentId" value={form.studentId} onChange={handleChange} required />
          <Input label="Course ID" name="courseId" value={form.courseId} onChange={handleChange} required />
          <Input label="Semester" name="semester" value={form.semester} onChange={handleChange} required />
          <Input label="Year" name="year" value={form.year} onChange={handleChange} required />
          <Input label="Grade" name="grade" value={form.grade} onChange={handleChange} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default TranscriptPage;
