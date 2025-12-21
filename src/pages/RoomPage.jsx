import { useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';
import { Button, Modal, Input, Table } from '../components/common';
import toast from 'react-hot-toast';

const defaultForm = {
  building: '',
  roomNumber: '',
  capacity: '',
  type: 'LectureHall',
};

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getAll();
      setRooms(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch {
      toast.error('Failed to fetch rooms');
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
        toast.success('Room updated');
      } else {
        await roomApi.create(form);
        toast.success('Room created');
      }
      fetchRooms();
      handleCloseModal();
    } catch {
      toast.error('Failed to save room');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomApi.delete(id);
      toast.success('Room deleted');
      fetchRooms();
    } catch {
      toast.error('Failed to delete room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button onClick={() => handleOpenModal()}>Add Room</Button>
      </div>
      <Table
        columns={[
          { Header: 'ID', accessor: 'roomId' },
          { Header: 'Building', accessor: 'building' },
          { Header: 'Room Number', accessor: 'roomNumber' },
          { Header: 'Capacity', accessor: 'capacity' },
          { Header: 'Type', accessor: 'type' },
          {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleOpenModal(row.original)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(row.original.roomId || row.original.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={rooms}
        loading={loading}
      />
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Building" name="building" value={form.building} onChange={handleChange} required />
          <Input label="Room Number" name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
          <Input label="Capacity" name="capacity" value={form.capacity} onChange={handleChange} required type="number" min={1} />
          <Input label="Type" name="type" value={form.type} onChange={handleChange} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomPage;
