import { useMemo } from "react";
import { timeSlotApi } from "../api/timeSlotApi";
import { roomApi } from "../api/roomApi";
import { Button, Card, Input, Modal, Table } from "../components/common";
import toast from "react-hot-toast";
import { useFetch, useForm, useModal } from "../hooks";

const defaultForm = {
  roomId: "",
  day: "Monday",
  startTime: "08:00",
  endTime: "09:00",
};

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const normalizeTime = (value) => {
  if (!value) return "";
  if (typeof value !== "string") return String(value);
  // API tends to return TimeSpan as "HH:mm:ss"; <input type="time"/> expects "HH:mm"
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const normalizeDay = (value) => {
  if (value === null || value === undefined) return "Monday";
  if (typeof value === "number") return daysOfWeek[value] || "Monday";
  return value;
};

const TimeSlotPage = () => {
  const modal = useModal(false);

  const {
    data: timeSlotsData,
    isLoading: isLoadingTimeSlots,
    error: timeSlotsError,
    refetch: refetchTimeSlots,
  } = useFetch(() => timeSlotApi.getAll(), [], { initialData: [] });

  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useFetch(() => roomApi.getAll(), [], { initialData: [] });

  const timeSlots = useMemo(() => {
    if (Array.isArray(timeSlotsData)) return timeSlotsData;
    return timeSlotsData?.items || [];
  }, [timeSlotsData]);

  const rooms = useMemo(() => {
    if (Array.isArray(roomsData)) return roomsData;
    return roomsData?.items || [];
  }, [roomsData]);

  const roomById = useMemo(() => {
    const map = new Map();
    rooms.forEach((room) => {
      map.set(String(room.roomId), room);
    });
    return map;
  }, [rooms]);

  const form = useForm(defaultForm, {
    onSubmit: async (values) => {
      const mode = modal.data?.mode || "create";

      if (mode === "edit") {
        const timeSlotId = modal.data?.timeSlotId;
        await timeSlotApi.update(timeSlotId, {
          timeSlotId,
          roomId: Number(values.roomId),
          day: values.day,
          startTime: values.startTime,
          endTime: values.endTime,
        });
        toast.success("Time slot updated");
      } else {
        await timeSlotApi.create({
          roomId: Number(values.roomId),
          day: values.day,
          startTime: values.startTime,
          endTime: values.endTime,
        });
        toast.success("Time slot created");
      }

      await refetchTimeSlots();
      modal.close();
      form.reset(defaultForm);
    },
  });

  const openCreateModal = () => {
    form.reset(defaultForm);
    modal.open({ mode: "create" });
  };

  const openEditModal = (row) => {
    form.reset({
      roomId: row?.roomId ? String(row.roomId) : "",
      day: normalizeDay(row?.day),
      startTime: normalizeTime(row?.startTime),
      endTime: normalizeTime(row?.endTime),
    });
    modal.open({ mode: "edit", timeSlotId: row?.timeSlotId });
  };

  const closeModal = () => {
    modal.close();
    form.reset(defaultForm);
  };

  const columns = useMemo(
    () => [
      { key: "timeSlotId", header: "ID", sortable: true },
      {
        key: "roomId",
        header: "Room",
        sortable: true,
        render: (value) => {
          const room = roomById.get(String(value));
          return room ? `${room.building} - ${room.roomNumber}` : value;
        },
      },
      {
        key: "day",
        header: "Day",
        sortable: true,
        render: (value) => normalizeDay(value),
      },
      {
        key: "startTime",
        header: "Start Time",
        render: (value) => normalizeTime(value),
      },
      {
        key: "endTime",
        header: "End Time",
        render: (value) => normalizeTime(value),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_, row) => (
          <Button size="sm" variant="outline" onClick={() => openEditModal(row)}>
            Edit
          </Button>
        ),
      },
    ],
    [roomById]
  );

  return (
    <Card title="Time Slots">
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateModal}>Add Time Slot</Button>
      </div>
      {timeSlotsError ? (
        <div className="mb-3 text-sm text-red-600 dark:text-red-400">{timeSlotsError}</div>
      ) : null}
      {roomsError ? (
        <div className="mb-3 text-sm text-red-600 dark:text-red-400">{roomsError}</div>
      ) : null}

      <Table columns={columns} data={timeSlots} isLoading={isLoadingTimeSlots} />

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.data?.mode === "edit" ? "Edit Time Slot" : "Add Time Slot"}
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <label className="block">
            Room
            <select
              name="roomId"
              value={form.values.roomId}
              onChange={form.handleChange}
              className="block w-full border rounded p-2"
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.building} - {room.roomNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Day
            <select
              name="day"
              value={form.values.day}
              onChange={form.handleChange}
              className="block w-full border rounded p-2"
              required
            >
              {daysOfWeek.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <Input
            label="Start Time"
            name="startTime"
            value={form.values.startTime}
            onChange={form.handleChange}
            required
            type="time"
          />
          <Input
            label="End Time"
            name="endTime"
            value={form.values.endTime}
            onChange={form.handleChange}
            required
            type="time"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.isSubmitting || isLoadingRooms}>
              {modal.data?.mode === "edit" ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default TimeSlotPage;
