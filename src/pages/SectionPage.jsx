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
import { scheduleApi } from "../api/scheduleApi";
import toast from "react-hot-toast";
import { useFetch } from "../hooks";

const defaultForm = {
  semester: "",
  year: "",
  instructorId: "",
  courseId: "",
  roomId: "",
  timeSlotId: "",
  slotType: "Lecture",
  availableSeats: "",
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

  const {
    data: sectionScheduleSlots,
    isLoading: isLoadingSectionSlots,
    error: sectionSlotsError,
    refetch: refetchSectionSlots,
    reset: resetSectionSlots,
  } = useFetch(
    () => (editId ? scheduleApi.getBySection(editId) : Promise.resolve([])),
    [editId, modalOpen],
    {
      immediate: Boolean(editId && modalOpen),
      initialData: [],
      showErrorToast: false,
    }
  );

  useEffect(() => {
    fetchSections();
    fetchDropdowns();
    // Fetch all time slots for display in table
    (async () => {
      try {
        const res = await timeSlotApi.getAll();
        setTimeSlots(Array.isArray(res.data) ? res.data : res.data.items || []);
      } catch {}
    })();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await sectionApi.getAll();
      const data = res?.data;
      const items = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : (Array.isArray(data?.Items) ? data.Items : []));
      setSections(items);
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
      const courseData = courseRes?.data;
      const courseItems = Array.isArray(courseData)
        ? courseData
        : (Array.isArray(courseData?.items) ? courseData.items : (Array.isArray(courseData?.Items) ? courseData.Items : []));
      setCourses(courseItems);
      // Normalize rooms
      const roomsData = Array.isArray(roomRes.data) ? roomRes.data : roomRes.data.items || [];
      const normalizedRooms = roomsData.map(r => ({
        ...r,
        id: String(r.id || r.roomId),
        roomId: String(r.roomId || r.id),
      }));
      setRooms(normalizedRooms);
      // Normalize instructors
      const instructorsData = Array.isArray(instructorRes.data) ? instructorRes.data : instructorRes.data.items || [];
      const normalizedInstructors = instructorsData.map(i => ({
        ...i,
        id: String(i.id || i.instructorId),
        instructorId: String(i.instructorId || i.id),
        fullName: i.fullName || `${i.firstName || ''} ${i.lastName || ''}`.trim(),
      }));
      setInstructors(normalizedInstructors);
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
        timeSlotApi.getByRoom(roomId),
        scheduleSlotApi.getByRoom(roomId),
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
        instructorId: section.instructorId ? String(section.instructorId) : "",
        courseId: section.courseId ? String(section.courseId) : "",
        availableSeats: section.availableSeats ? String(section.availableSeats) : "",
        roomId: section.roomId ? String(section.roomId) : "",
        timeSlotId: section.timeSlotId ? String(section.timeSlotId) : "",
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
      resetSectionSlots();
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setEditId(null);
    setTimeSlots([]);
    setBookedTimeSlotIds([]);
    resetSectionSlots();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field) => (selectedOption) => {
    const value = selectedOption
      ? String(
          selectedOption.timeSlotId ||
          selectedOption.roomId ||
          selectedOption.instructorId ||
          selectedOption.courseId ||
          selectedOption.id ||
          ""
        )
      : "";
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
      // Convert year to DateTime string and wrap in sectionDTO
      const payload = {
        ...form,
          year: form.year ? `${form.year}-01-01T00:00:00Z` : "",
          availableSeats: form.availableSeats ? Number(form.availableSeats) : 0,
      };
      if (editId) {
        await sectionApi.update(editId, payload);
        toast.success("Section updated");
      } else {
        await sectionApi.create(payload);
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
            { key: "sectionId", header: "ID" },
            { key: "semester", header: "Semester" },
            {
              key: "year",
              header: "Year",
              render: (val) => val ? (typeof val === 'string' ? val.slice(0, 4) : new Date(val).getFullYear()) : ""
            },
            {
              key: "instructorId",
              header: "Instructor",
              render: (val, row) => {
                const inst = instructors.find(i => i.id === String(val) || i.instructorId === String(val));
                return inst ? inst.fullName : val;
              }
            },
            {
              key: "courseId",
              header: "Course",
              render: (val, row) => {
                const course = courses.find(c => String(c.id) === String(val) || String(c.courseId) === String(val));
                return course ? (course.courseName || course.name || course.courseCode) : val;
              }
            },
            { key: "availableSeats", header: "Seats" },
            {
              key: "roomId",
              header: "Room",
              render: (val, row) => {
                const room = rooms.find(r => String(r.id) === String(val) || String(r.roomId) === String(val));
                return room ? (room.roomNumber || room.name || val) : val;
              }
            },
            {
              key: "timeSlotId",
              header: "Time Slot",
              render: (val, row) => {
                const slot = timeSlots.find(s => String(s.timeSlotId) === String(val) || String(s.id) === String(val));
                return slot ? `${slot.day || ''} ${slot.startTime || ''} - ${slot.endTime || ''}`.trim() : val;
              }
            },
            {
              key: "slotType",
              header: "Type",
              render: (val) => val || "Lecture"
            },
            {
              key: "actions",
              header: "Actions",
              render: (_val, row) => (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleOpenModal(row)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(row.sectionId || row.id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={sections}
          isLoading={loading}
        />
      )}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? "Edit Section" : "Add Section"}>
        {form.roomId && timeSlots.length === 0 && (
          <div className="text-red-600 text-sm mb-2">
            No time slots exist for the selected room. Please add a time slot before creating a section.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Semester<span className="text-red-500 ml-1">*</span></label>
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
            >
              <option value="" disabled>Choose semester</option>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          <Input label="Year" name="year" value={form.year} onChange={handleChange} required />
          <SearchableSelect
            label="Instructor"
            name="instructorId"
            value={form.instructorId}
            onChange={handleSelectChange("instructorId")}
            options={instructors}
            getOptionLabel={opt => opt.fullName || opt.name || opt.email || `ID ${opt.id || opt.instructorId}`}
            getOptionValue={opt => String(opt.id || opt.instructorId || '')}
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
            getOptionValue={opt => String(opt.id || opt.courseId || '')}
            required
            disabled={dropdownLoading}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Available Seats<span className="text-red-500 ml-1">*</span></label>
            <select
              name="availableSeats"
              value={form.availableSeats}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
            >
              <option value="" disabled>Choose seats</option>
              {Array.from({ length: 31 }, (_, i) => 30 + i).map(seats => (
                <option key={seats} value={seats}>{seats}</option>
              ))}
            </select>
          </div>
          <SearchableSelect
            label="Room"
            name="roomId"
            value={form.roomId}
            onChange={handleSelectChange("roomId")}
            options={rooms}
            getOptionLabel={opt => `${opt.building || ''} - ${opt.roomNumber || ''}`}
            getOptionValue={opt => String(opt.id || opt.roomId || '')}
            required
            disabled={dropdownLoading}
          />
          <SearchableSelect
            label="Time Slot"
            name="timeSlotId"
            value={form.timeSlotId}
            onChange={handleSelectChange("timeSlotId")}
            options={(() => {
              const filtered = form.roomId ? timeSlots.filter(
                opt => !bookedTimeSlotIds.map(String).includes(String(opt.timeSlotId))
              ) : [];
              return filtered;
            })()}
            getOptionLabel={opt => `${opt.day || ''} ${opt.startTime || ''} - ${opt.endTime || ''}`}
            getOptionValue={opt => String(opt.timeSlotId || '')}
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

        {editId && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Schedule Slots
              </h3>
              <Button size="sm" variant="outline" onClick={() => refetchSectionSlots()}>
                Refresh
              </Button>
            </div>

            {sectionSlotsError ? (
              <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                {sectionSlotsError}
              </div>
            ) : null}

            <Table
              isLoading={isLoadingSectionSlots}
              columns={[
                { key: "scheduleSlotId", header: "ID" },
                { key: "slotType", header: "Type" },
                { key: "timeSlot", header: "Time" },
                { key: "room", header: "Room" },
                { key: "instructorName", header: "Instructor" },
              ]}
              data={Array.isArray(sectionScheduleSlots) ? sectionScheduleSlots : []}
              emptyMessage="No schedule slots for this section."
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default SectionPage;
