import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { officeHourApi } from '../api/officeHourApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiCheck,
  FiX,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from 'react-icons/fi';

const OfficeHoursPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isInstructor, isAdmin } = useAuth();
  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';
  const [officeHours, setOfficeHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [instructorNotes, setInstructorNotes] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    roomId: null,
    notes: '',
    isRecurring: false,
  });

  useEffect(() => {
    fetchOfficeHours();
  }, [currentWeek]);

  const fetchOfficeHours = async () => {
    try {
      setLoading(true);
      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const data = await officeHourApi.getMyOfficeHours({
        fromDate: startOfWeek.toISOString(),
        toDate: endOfWeek.toISOString(),
      });
      setOfficeHours(data);
    } catch (error) {
      console.error(error);
      toast.error(t('officeHours.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const handleCreateOfficeHour = async (e) => {
    e.preventDefault();
    try {
      await officeHourApi.createOfficeHour(formData);
      toast.success(t('officeHours.toasts.created'));
      setShowCreateModal(false);
      setFormData({
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        roomId: null,
        notes: '',
        isRecurring: false,
      });
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.createFailed'));
    }
  };

  const handleDeleteOfficeHour = async (id) => {
    if (!window.confirm(t('officeHours.confirmDelete'))) return;
    try {
      await officeHourApi.deleteOfficeHour(id);
      toast.success(t('officeHours.toasts.deleted'));
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.deleteFailed'));
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await officeHourApi.confirmBooking(bookingId);
      toast.success(t('officeHours.toasts.bookingConfirmed'));
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.confirmBookingFailed'));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt(t('common.prompts.cancelReasonOptional'));
    try {
      await officeHourApi.cancelBooking(bookingId, reason);
      toast.success(t('officeHours.toasts.bookingCancelled'));
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.cancelBookingFailed'));
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await officeHourApi.completeBooking(bookingId);
      toast.success(t('officeHours.toasts.bookingCompleted'));
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.completeBookingFailed'));
    }
  };

  const handleMarkNoShow = async (bookingId) => {
    try {
      await officeHourApi.markNoShow(bookingId);
      toast.success(t('officeHours.toasts.bookingNoShow'));
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.noShowFailed'));
    }
  };

  const handleAddNotes = async () => {
    if (!selectedBooking) return;
    try {
      await officeHourApi.addInstructorNotes(selectedBooking.bookingId, instructorNotes);
      toast.success(t('officeHours.toasts.notesAdded'));
      setShowNotesModal(false);
      setSelectedBooking(null);
      setInstructorNotes('');
      fetchOfficeHours();
    } catch (error) {
      toast.error(t('officeHours.errors.addNotesFailed'));
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const formatWeekRange = () => {
    const start = getStartOfWeek(currentWeek);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getOfficeHourStatusKey = (value) => {
    const v = String(value || '');
    if (v === 'Available') return 'available';
    if (v === 'Booked') return 'booked';
    if (v === 'Cancelled') return 'cancelled';
    return null;
  };

  const renderOfficeHourStatus = (value) => {
    const key = getOfficeHourStatusKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`enums.officeHourStatus.${key}`);
  };

  const getBookingStatusKey = (value) => {
    const v = String(value || '');
    if (v === 'Pending') return 'pending';
    if (v === 'Confirmed') return 'confirmed';
    if (v === 'Cancelled') return 'cancelled';
    if (v === 'Completed') return 'completed';
    if (v === 'NoShow') return 'noShow';
    return null;
  };

  const renderBookingStatus = (value) => {
    const key = getBookingStatusKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`enums.officeHourBookingStatus.${key}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Booked':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'NoShow':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('officeHours.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('officeHours.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          {t('officeHours.actions.addOfficeHour')}
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <button
          onClick={() => navigateWeek(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formatWeekRange()}</h2>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('officeHours.actions.goToCurrentWeek')}
          </button>
        </div>
        <button
          onClick={() => navigateWeek(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Office Hours List */}
      <div className="space-y-4">
        {officeHours.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <FiCalendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('officeHours.empty.title')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('officeHours.empty.description')}</p>
          </div>
        ) : (
          officeHours.map((oh) => (
            <div key={oh.officeHourId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <FiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {new Date(oh.date).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {oh.startTime} - {oh.endTime}
                        </span>
                        {oh.room && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            {oh.room.roomName} ({oh.room.building})
                          </span>
                        )}
                      </div>
                      {oh.notes && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{oh.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(oh.status)}`}>
                      {renderOfficeHourStatus(oh.status)}
                    </span>
                    {oh.status === 'Available' && (
                      <button
                        onClick={() => handleDeleteOfficeHour(oh.officeHourId)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bookings */}
              {oh.bookings && oh.bookings.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('officeHours.sections.bookings')}</h4>
                  <div className="space-y-3">
                    {oh.bookings.map((booking) => (
                      <div
                        key={booking.bookingId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{booking.student.fullName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{booking.student.email}</p>
                            {booking.purpose && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="font-medium">{t('officeHours.fields.purposeLabel')}</span> {booking.purpose}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBookingStatusColor(booking.status)}`}>
                            {renderBookingStatus(booking.status)}
                          </span>
                          {booking.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(booking.bookingId)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title={t('common.confirm')}
                                aria-label={t('common.confirm')}
                              >
                                <FiCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.bookingId)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t('common.cancel')}
                                aria-label={t('common.cancel')}
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {booking.status === 'Confirmed' && (
                            <>
                              <button
                                onClick={() => handleCompleteBooking(booking.bookingId)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title={t('officeHours.actions.markComplete')}
                                aria-label={t('officeHours.actions.markComplete')}
                              >
                                <FiCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleMarkNoShow(booking.bookingId)}
                                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title={t('officeHours.actions.markNoShow')}
                                aria-label={t('officeHours.actions.markNoShow')}
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setInstructorNotes(booking.instructorNotes || '');
                                  setShowNotesModal(true);
                                }}
                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                title={t('officeHours.actions.addNotes')}
                                aria-label={t('officeHours.actions.addNotes')}
                              >
                                <FiFileText className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Office Hour Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('officeHours.modals.createTitle')}</h2>
            <form onSubmit={handleCreateOfficeHour} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('officeHours.fields.date')}</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('officeHours.fields.startTime')}</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('officeHours.fields.endTime')}</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('officeHours.fields.notesOptional')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder={t('officeHours.placeholders.notesOptional')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('officeHours.fields.repeatWeekly')}
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('officeHours.modals.notesTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('officeHours.modals.meetingWith', { name: selectedBooking.student.fullName })}
            </p>
            <textarea
              value={instructorNotes}
              onChange={(e) => setInstructorNotes(e.target.value)}
              rows={5}
              placeholder={t('officeHours.placeholders.meetingNotes')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedBooking(null);
                  setInstructorNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddNotes}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('officeHours.actions.saveNotes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeHoursPage;
