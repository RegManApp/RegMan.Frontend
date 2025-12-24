import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { Button, Modal, Input, Table } from '../components/common';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const defaultForm = {
  building: '',
  roomNumber: '',
  capacity: '',
  type: 'LectureHall',
};

const RoomPage = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getAll();
      setRooms(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch {
      toast.error(t('rooms.errors.fetchFailed'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenModal = (room = null) => {
    if (room) {
      setForm({ ...room });
      setEditId(room.roomId || room.id);
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
        await roomApi.update({ ...form, roomId: editId });
        toast.success(t('rooms.toasts.updated'));
      } else {
        await roomApi.create(form);
        toast.success(t('rooms.toasts.created'));
      }
      fetchRooms();
      handleCloseModal();
    } catch {
      toast.error(t('rooms.errors.saveFailed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('rooms.confirmDelete'))) return;
    try {
      await roomApi.delete(id);
      toast.success(t('rooms.toasts.deleted'));
      fetchRooms();
    } catch {
      toast.error(t('rooms.errors.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('nav.rooms')}</h1>
        <Button onClick={() => handleOpenModal()}>{t('rooms.addRoom')}</Button>
      </div>
      <Table
        columns={[
          { key: 'roomId', header: t('common.id') },
          {
            key: 'building',
            header: t('rooms.fields.building'),
            render: (value, row) => (
              <button
                className="text-primary-600 underline hover:text-primary-800"
                onClick={() => navigate(`/rooms/${row.roomId}`)}
                type="button"
              >
                {value}
              </button>
            ),
          },
          { key: 'roomNumber', header: t('rooms.fields.roomNumber') },
          { key: 'capacity', header: t('rooms.fields.capacity') },
          { key: 'type', header: t('rooms.fields.type') },
          {
            key: 'actions',
            header: t('common.actions'),
            render: (_, row) => (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleOpenModal(row)}>
                  {t('common.edit')}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(row.roomId || row.id)}>
                  {t('common.delete')}
                </Button>
              </div>
            ),
          },
        ]}
        data={rooms}
        isLoading={loading}
      />
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? t('rooms.editTitle') : t('rooms.addTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('rooms.fields.building')} name="building" value={form.building} onChange={handleChange} required />
          <Input label={t('rooms.fields.roomNumber')} name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
          <Input label={t('rooms.fields.capacity')} name="capacity" value={form.capacity} onChange={handleChange} required type="number" min={1} />
          <Input label={t('rooms.fields.type')} name="type" value={form.type} onChange={handleChange} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{editId ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomPage;
