import React, { useEffect, useState } from "react";
import sectionApi from "../api/sectionApi";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import toast from "react-hot-toast";

const defaultForm = {
  semester: "",
  year: "",
  instructorId: "",
  courseId: "",
  availableSeats: 60,
  roomId: "",
  timeSlotId: "",
  slotType: "Lecture",
};

const SectionPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await sectionApi.getAll();
      setSections(res.data);
    } catch (e) {
      toast.error("Failed to fetch sections");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleOpenModal = (section = null) => {
    if (section) {
      setForm({ ...section });
      setEditId(section.sectionId || section.id);
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
        await sectionApi.update({ ...form, sectionId: editId });
        toast.success("Section updated");
      } else {
        await sectionApi.create(form);
        toast.success("Section created");
      }
      fetchSections();
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save section");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this section?")) return;
    try {
      await sectionApi.delete(id);
      toast.success("Section deleted");
      fetchSections();
    } catch {
      toast.error("Failed to delete section");
    }
  };

  return (
    <Card title="Sections">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleOpenModal()}>Add Section</Button>
      </div>
      <Table
        columns={[
          { Header: "ID", accessor: "sectionId" },
          { Header: "Semester", accessor: "semester" },
          { Header: "Year", accessor: "year" },
          { Header: "Instructor", accessor: "instructorId" },
          { Header: "Course", accessor: "courseId" },
          { Header: "Seats", accessor: "availableSeats" },
          { Header: "Room", accessor: "roomId" },
          { Header: "Time Slot", accessor: "timeSlotId" },
          { Header: "Type", accessor: "slotType" },
          {
            Header: "Actions",
            accessor: "actions",
            Cell: ({ row }) => (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleOpenModal(row.original)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(row.original.sectionId || row.original.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={sections}
        loading={loading}
      />
      <Modal open={modalOpen} onClose={handleCloseModal} title={editId ? "Edit Section" : "Add Section"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Semester" name="semester" value={form.semester} onChange={handleChange} required />
          <Input label="Year" name="year" value={form.year} onChange={handleChange} required />
          <Input label="Instructor ID" name="instructorId" value={form.instructorId} onChange={handleChange} required type="number" />
          <Input label="Course ID" name="courseId" value={form.courseId} onChange={handleChange} required type="number" />
          <Input label="Available Seats" name="availableSeats" value={form.availableSeats} onChange={handleChange} required type="number" />
          <Input label="Room ID" name="roomId" value={form.roomId} onChange={handleChange} required type="number" />
          <Input label="Time Slot ID" name="timeSlotId" value={form.timeSlotId} onChange={handleChange} required type="number" />
          <Input label="Slot Type" name="slotType" value={form.slotType} onChange={handleChange} required />
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

export default SectionPage;
