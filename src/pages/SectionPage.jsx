import React, { useEffect, useState } from "react";
import sectionApi from "../api/sectionApi";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import SearchableSelect from "../components/common/SearchableSelect";
import { courseApi } from "../api/courseApi";
import { roomApi } from "../api/roomApi";
import { instructorApi } from "../api/instructorApi";
import { timeSlotApi } from "../api/timeSlotApi";
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

  // Dropdown data
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

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

  const fetchDropdowns = async () => {
    setDropdownLoading(true);
    try {
      const [courseRes, roomRes, instructorRes, timeSlotRes] = await Promise.all([
        courseApi.getAll({ pageSize: 1000 }),
        roomApi.getAll(),
        instructorApi.getAll(),
        timeSlotApi.getAll(),
      ]);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : courseRes.data.items || []);
      setRooms(Array.isArray(roomRes.data) ? roomRes.data : roomRes.data.items || []);
      setInstructors(Array.isArray(instructorRes.data) ? instructorRes.data : instructorRes.data.items || []);
      setTimeSlots(Array.isArray(timeSlotRes.data) ? timeSlotRes.data : timeSlotRes.data.items || []);
    } catch (e) {
      toast.error("Failed to load dropdown data");
    }
    setDropdownLoading(false);
  };

  useEffect(() => {
    fetchSections();
    fetchDropdowns();
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

  // For SearchableSelect
  const handleSelectChange = (name) => (e) => {
    setForm({ ...form, [name]: e.target.value });
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
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? "Edit Section" : "Add Section"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Semester" name="semester" value={form.semester} onChange={handleChange} required />
          <Input label="Year" name="year" value={form.year} onChange={handleChange} required />
          <SearchableSelect
            label="Instructor"
            name="instructorId"
            value={form.instructorId}
            onChange={handleSelectChange("instructorId")}
            options={instructors}
            getOptionLabel={opt => opt.fullName || opt.name || opt.email || `ID ${opt.id || opt.instructorId}`}
            getOptionValue={opt => opt.id || opt.instructorId || ''}
            required
            disabled={dropdownLoading}
          />
          <SearchableSelect
            label="Course"
            name="courseId"
            value={form.courseId}
            onChange={handleSelectChange("courseId")}
            options={courses}
            getOptionLabel={opt => `${opt.courseName || opt.name || ''} (${opt.courseCode || ''})`}
            getOptionValue={opt => opt.id || opt.courseId || ''}
            required
            disabled={dropdownLoading}
          />
          <Input label="Available Seats" name="availableSeats" value={form.availableSeats} onChange={handleChange} required type="number" />
          <SearchableSelect
            label="Room"
            name="roomId"
            value={form.roomId}
            onChange={handleSelectChange("roomId")}
            options={rooms}
            getOptionLabel={opt => `${opt.building || ''} - ${opt.roomNumber || ''}`}
            getOptionValue={opt => opt.id || opt.roomId || ''}
            required
            disabled={dropdownLoading}
          />
          <SearchableSelect
            label="Time Slot"
            name="timeSlotId"
            value={form.timeSlotId}
            onChange={handleSelectChange("timeSlotId")}
            options={timeSlots}
            getOptionLabel={opt => `${opt.day || ''} ${opt.startTime || ''} - ${opt.endTime || ''}`}
            getOptionValue={opt => opt.id || opt.timeSlotId || ''}
            required
            disabled={dropdownLoading}
          />
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
