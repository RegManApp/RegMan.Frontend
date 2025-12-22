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
import { scheduleSlotApi } from "../api/scheduleSlotApi";
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
  const [bookedTimeSlotIds, setBookedTimeSlotIds] = useState([]);

  useEffect(() => {
    fetchSections();
    fetchDropdowns();
  }, []);

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
      const [courseRes, roomRes, instructorRes] = await Promise.all([
        courseApi.getAll({ pageSize: 1000 }),
        roomApi.getAll(),
        instructorApi.getAll(),
      ]);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : courseRes.data.items || []);
      setRooms(Array.isArray(roomRes.data) ? roomRes.data : roomRes.data.items || []);
      setInstructors(Array.isArray(instructorRes.data) ? instructorRes.data : instructorRes.data.items || []);
      setTimeSlots([]);
    } catch (e) {
      toast.error("Failed to load dropdown data");
    } finally {
      setDropdownLoading(false);
      setForm(f => ({ ...f, timeSlotId: "" })); // Clear selected time slot
    }
  };

  const fetchTimeSlotsForRoom = async (roomId) => {
    if (!roomId) {
      setTimeSlots([]);
      setBookedTimeSlotIds([]);
      return;
    }
    try {
      const [timeSlotRes, scheduleSlotRes] = await Promise.all([
        timeSlotApi.getAll({ roomId }),
        scheduleSlotApi.getAll({ roomId }),
      ]);
      setTimeSlots(Array.isArray(timeSlotRes.data) ? timeSlotRes.data : timeSlotRes.data.items || []);
      const bookedIds = (Array.isArray(scheduleSlotRes.data) ? scheduleSlotRes.data : scheduleSlotRes.data.items || []).map(slot => slot.timeSlotId);
      setBookedTimeSlotIds(bookedIds);
    } catch (e) {
      toast.error("Failed to load time slots for room");
      setTimeSlots([]);
      setBookedTimeSlotIds([]);
    }
  };

  const handleOpenModal = (section = null) => {
    if (section) {
      setForm({
        semester: section.semester || "",
        year: section.year || "",
        instructorId: section.instructorId || "",
        courseId: section.courseId || "",
        availableSeats: section.availableSeats || 60,
        roomId: section.roomId || "",
        timeSlotId: section.timeSlotId || "",
        slotType: section.slotType || "Lecture",
      });
      setEditId(section.sectionId || section.id);
      if (section.roomId) {
        fetchTimeSlotsForRoom(section.roomId);
      }
    } else {
      setForm(defaultForm);
      setEditId(null);
      setTimeSlots([]);
      setBookedTimeSlotIds([]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setEditId(null);
    setTimeSlots([]);
    setBookedTimeSlotIds([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field) => (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === "roomId") {
      fetchTimeSlotsForRoom(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Added form validation: ensure roomId and timeSlotId are selected
    if (!form.roomId || !form.timeSlotId) {
      toast.error("Please select a room and time slot.");
      return;
    }
    try {
      if (editId) {
        await sectionApi.update(editId, form);
        toast.success("Section updated");
      } else {
        await sectionApi.create(form);
        toast.success("Section created");
      }
      fetchSections();
      handleCloseModal();
    } catch (error) {
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
        {/* Simplified button logic: only disable if no rooms available */}
        <Button
          onClick={() => handleOpenModal()}
          disabled={rooms.length === 0}
          title={rooms.length === 0 ? 'No rooms available' : ''}
        >
          Add Section
        </Button>
      </div>
      {(!loading && sections.length === 0) ? (
        <div className="text-center text-gray-500 py-8">No sections available.</div>
      ) : (
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
            // Handled nested data: accessors confirmed to match top-level ViewSectionDTO properties; no changes needed for now
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
      )}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? "Edit Section" : "Add Section"}>
        {form.roomId && timeSlots.length === 0 && (
          <div className="text-red-600 text-sm mb-2">
            No time slots exist for the selected room. Please add a time slot before creating a section.
          </div>
        )}
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
            options={form.roomId ? timeSlots.filter(
              opt => !bookedTimeSlotIds.includes(opt.id || opt.timeSlotId)
            ) : []}
            getOptionLabel={opt => `${opt.day || ''} ${opt.startTime || ''} - ${opt.endTime || ''}`}
            getOptionValue={opt => opt.id || opt.timeSlotId || ''}
            required
            disabled={dropdownLoading || !form.roomId}
          />
          <Input label="Slot Type" name="slotType" value={form.slotType} onChange={handleChange} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.roomId && timeSlots.length === 0}>
              {editId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default SectionPage;
