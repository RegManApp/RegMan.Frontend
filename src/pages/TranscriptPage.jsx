import React, { useEffect, useState } from "react";
import transcriptApi from "../api/transcriptApi";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const defaultForm = {
  studentId: "",
  courseId: "",
  semester: "",
  year: "",
  grade: "",
};

const TranscriptPage = () => {
  const { isAdmin, user } = useAuth();
  const { t } = useTranslation();
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
      toast.error(t('transcript.errors.fetchFailed'));
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
        toast.success(t('transcript.toasts.updated'));
      } else {
        await transcriptApi.create(form);
        toast.success(t('transcript.toasts.created'));
      }
      fetchTranscripts();
      handleCloseModal();
    } catch (err) {
      toast.error(t('transcript.errors.saveFailed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('transcript.confirmDelete'))) return;
    try {
      await transcriptApi.delete(id);
      toast.success(t('transcript.toasts.deleted'));
      fetchTranscripts();
    } catch {
      toast.error(t('transcript.errors.deleteFailed'));
    }
  };

  // Admin GPA recalculation
  const handleRecalculateGpa = async (studentId) => {
    try {
      await transcriptApi.recalculateGpa(studentId);
      toast.success(t('transcript.toasts.gpaRecalculated'));
      fetchTranscripts();
    } catch {
      toast.error(t('transcript.errors.gpaRecalcFailed'));
    }
  };

  // Admin filter handler
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Table columns
  const columns = [
    { Header: t('common.id'), accessor: "id" },
    { Header: t('transcript.fields.studentId'), accessor: "studentId" },
    { Header: t('transcript.fields.courseId'), accessor: "courseId" },
    { Header: t('transcript.fields.semester'), accessor: "semester" },
    { Header: t('transcript.fields.year'), accessor: "year" },
    { Header: t('transcript.fields.grade'), accessor: "grade" },
  ];
  if (isAdmin()) {
    columns.push({
      Header: t('common.actions'),
      accessor: "actions",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleOpenModal(row.original)}>
            {t('common.edit')}
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.original.id)}>
            {t('common.delete')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleRecalculateGpa(row.original.studentId)}>
            {t('transcript.recalcGpa')}
          </Button>
        </div>
      ),
    });
  }

  return (
    <Card title={t('nav.transcript')}>
      {isAdmin() && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <Button onClick={() => handleOpenModal()}>{t('transcript.addTranscript')}</Button>
          <Input placeholder={t('transcript.filters.studentIdPlaceholder')} name="studentId" value={filters.studentId || ""} onChange={handleFilterChange} />
          <Input placeholder={t('transcript.filters.courseIdPlaceholder')} name="courseId" value={filters.courseId || ""} onChange={handleFilterChange} />
          <Input placeholder={t('transcript.filters.semesterPlaceholder')} name="semester" value={filters.semester || ""} onChange={handleFilterChange} />
          <Input placeholder={t('transcript.filters.yearPlaceholder')} name="year" value={filters.year || ""} onChange={handleFilterChange} />
          <Input placeholder={t('transcript.filters.gradePlaceholder')} name="grade" value={filters.grade || ""} onChange={handleFilterChange} />
        </div>
      )}
      <Table columns={columns} data={transcripts} loading={loading} />
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editId ? t('transcript.editTitle') : t('transcript.addTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('transcript.fields.studentId')} name="studentId" value={form.studentId} onChange={handleChange} required />
          <Input label={t('transcript.fields.courseId')} name="courseId" value={form.courseId} onChange={handleChange} required />
          <Input label={t('transcript.fields.semester')} name="semester" value={form.semester} onChange={handleChange} required />
          <Input label={t('transcript.fields.year')} name="year" value={form.year} onChange={handleChange} required />
          <Input label={t('transcript.fields.grade')} name="grade" value={form.grade} onChange={handleChange} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{editId ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default TranscriptPage;
