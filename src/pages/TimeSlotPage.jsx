import { useMemo } from "react";
import { timeSlotApi } from "../api/timeSlotApi";
import { roomApi } from "../api/roomApi";
import { Button, Card, Input, Modal, Table } from "../components/common";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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

const getDayKey = (value) => {
  const v = String(value || '').toLowerCase();
  if (v === 'sunday') return 'sunday';
  if (v === 'monday') return 'monday';
  if (v === 'tuesday') return 'tuesday';
  if (v === 'wednesday') return 'wednesday';
  if (v === 'thursday') return 'thursday';
  if (v === 'friday') return 'friday';
  if (v === 'saturday') return 'saturday';
  return null;
};

const TimeSlotPage = () => {
  const { t } = useTranslation();
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
        toast.success(t('timeSlots.toasts.updated'));
      } else {
        await timeSlotApi.create({
          roomId: Number(values.roomId),
          day: values.day,
          startTime: values.startTime,
          endTime: values.endTime,
        });
        toast.success(t('timeSlots.toasts.created'));
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
      { key: "timeSlotId", header: t('common.id'), sortable: true },
      {
        key: "roomId",
        header: t('timeSlots.fields.room'),
        sortable: true,
        render: (value) => {
          const room = roomById.get(String(value));
          return room ? `${room.building} - ${room.roomNumber}` : value;
        },
      },
      {
        key: "day",
        header: t('timeSlots.fields.day'),
        sortable: true,
        render: (value) => {
          const normalized = normalizeDay(value);
          const key = getDayKey(normalized);
          return key ? t(`common.days.${key}`) : normalized;
        },
      },
      {
        key: "startTime",
        header: t('timeSlots.fields.startTime'),
        render: (value) => normalizeTime(value),
      },
      {
        key: "endTime",
        header: t('timeSlots.fields.endTime'),
        render: (value) => normalizeTime(value),
      },
      {
        key: "actions",
        header: t('common.actions'),
        render: (_, row) => (
          <Button size="sm" variant="outline" onClick={() => openEditModal(row)}>
            {t('common.edit')}
          </Button>
        ),
      },
    ],
    [roomById, t]
  );

  return (
    <Card title={t('nav.timeSlots')}>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateModal}>{t('timeSlots.actions.addTimeSlot')}</Button>
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
        title={modal.data?.mode === "edit" ? t('timeSlots.modals.editTitle') : t('timeSlots.modals.createTitle')}
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <label className="block">
            {t('timeSlots.fields.room')}
            <select
              name="roomId"
              value={form.values.roomId}
              onChange={form.handleChange}
              className="block w-full border rounded p-2"
              required
            >
              <option value="">{t('timeSlots.placeholders.selectRoom')}</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.building} - {room.roomNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            {t('timeSlots.fields.day')}
            <select
              name="day"
              value={form.values.day}
              onChange={form.handleChange}
              className="block w-full border rounded p-2"
              required
            >
              {daysOfWeek.map((d) => (
                <option key={d} value={d}>{t(`common.days.${getDayKey(d) || 'monday'}`)}</option>
              ))}
            </select>
          </label>
          <Input
            label={t('timeSlots.fields.startTime')}
            name="startTime"
            value={form.values.startTime}
            onChange={form.handleChange}
            required
            type="time"
          />
          <Input
            label={t('timeSlots.fields.endTime')}
            name="endTime"
            value={form.values.endTime}
            onChange={form.handleChange}
            required
            type="time"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.isSubmitting || isLoadingRooms}>
              {modal.data?.mode === "edit" ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default TimeSlotPage;
