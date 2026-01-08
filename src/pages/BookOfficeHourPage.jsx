import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { officeHourApi } from '../api/officeHourApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isCalendarSyncWarningMessage } from '../utils/integrationWarnings';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiSearch,
  FiFilter,
  FiX,
  FiChevronRight,
  FiBookOpen,
  FiCheck,
} from 'react-icons/fi';

const BookOfficeHourPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    purpose: '',
    studentNotes: '',
  });
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-bookings'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviders();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchAvailableSlots(selectedProvider.provider.userId);
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    try {
      const data = await officeHourApi.getProvidersWithOfficeHours();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error(t('bookOfficeHours.errors.instructorsFetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (providerUserId) => {
    try {
      setLoading(true);
      const data = await officeHourApi.getAvailableOfficeHoursV2({ providerUserId });
      setAvailableSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error(t('bookOfficeHours.errors.slotsFetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await officeHourApi.getMyBookings();
      setMyBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    try {
      const result = await officeHourApi.bookOfficeHour(selectedSlot.officeHourId, bookingData);
      toast.success(t('bookOfficeHours.toasts.booked'));
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingData({ purpose: '', studentNotes: '' });
      if (selectedProvider) {
        fetchAvailableSlots(selectedProvider.provider.userId);
      }
      fetchMyBookings();

      if (result?.conversationId && result?.systemMessageId) {
        navigate(`/chat?conversationId=${result.conversationId}&highlightMessageId=${result.systemMessageId}`);
      }
    } catch (error) {
      toast.error(t('bookOfficeHours.errors.bookFailed'));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(t('bookOfficeHours.confirmCancelBooking'))) return;
    const reason = window.prompt(t('common.prompts.cancelReasonOptional'));
    try {
      const result = await officeHourApi.cancelBookingWithMeta(bookingId, reason);
      toast.success(t('bookOfficeHours.toasts.cancelled'));
      if (isCalendarSyncWarningMessage(result?.message)) {
        toast(t('settings.googleCalendar.syncWarning'));
      }
      fetchMyBookings();
    } catch (error) {
      toast.error(t('bookOfficeHours.errors.cancelFailed'));
    }
  };

  const filteredProviders = providers.filter(
    (p) =>
      p.provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provider.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDegreeLabel = (degree) => {
    const labels = {
      0: 'Teaching Assistant',
      1: 'Assistant Lecturer',
      2: 'Lecturer',
      3: 'Assistant Professor',
      4: 'Associate Professor',
      5: 'Professor',
    };
    return labels[degree] || degree;
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

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Office Hours</h1>
        <p className="text-gray-600 dark:text-gray-400">Find and book office hours with your instructors</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Browse Office Hours
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'my-bookings'
              ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          My Bookings
          {myBookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed').length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
              {myBookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Providers List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Providers with Available Slots</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {filteredProviders.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No providers with available office hours
                  </div>
                ) : (
                  filteredProviders.map((item) => (
                    <button
                      key={item.provider.userId}
                      onClick={() => setSelectedProvider(item)}
                      className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between ${
                        selectedProvider?.provider.userId === item.provider.userId
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.provider.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.provider.degree != null ? getDegreeLabel(item.provider.degree) : item.provider.role}
                          </p>
                          {item.provider.department && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{item.provider.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          {item.availableSlots} slots
                        </span>
                        <FiChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="lg:col-span-2">
            {selectedProvider ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Office Hours - {selectedProvider.provider.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedProvider.provider.degree != null
                        ? getDegreeLabel(selectedProvider.provider.degree)
                        : selectedProvider.provider.role}
                      {selectedProvider.provider.department && ` • ${selectedProvider.provider.department}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <FiCalendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No available slots
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      This provider has no available office hours at the moment
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.officeHourId}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FiCalendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {slot.room && (
                                <span className="flex items-center gap-1">
                                  <FiMapPin className="w-4 h-4" />
                                  {slot.room.roomNumber} ({slot.room.building})
                                </span>
                              )}
                            </div>
                            {slot.notes && (
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowBookingModal(true);
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                          <FiBookOpen className="w-4 h-4" />
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <FiUser className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Provider
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a provider from the list to see their available office hours
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* My Bookings Tab */
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <FiCalendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Bookings</h3>
              <p className="text-gray-500 dark:text-gray-400">You haven't booked any office hours yet</p>
            </div>
          ) : (
            myBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : booking.status === 'Pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <FiCalendar
                        className={`w-6 h-6 ${
                          booking.status === 'Confirmed'
                            ? 'text-green-600 dark:text-green-400'
                            : booking.status === 'Pending'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {new Date(booking.officeHour.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {booking.officeHour.startTime} - {booking.officeHour.endTime}
                        </span>
                        {booking.officeHour.room && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            {booking.officeHour.room.roomNumber} ({booking.officeHour.room.building})
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-900 dark:text-white">
                        <span className="text-gray-500 dark:text-gray-400">With: </span>
                        {(booking.provider?.fullName || booking.instructor?.fullName) ?? '—'}
                        {booking.provider?.degree != null
                          ? ` (${getDegreeLabel(booking.provider.degree)})`
                          : booking.instructor?.degree != null
                          ? ` (${getDegreeLabel(booking.instructor.degree)})`
                          : ''}
                      </p>
                      {booking.purpose && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Purpose:</span> {booking.purpose}
                        </p>
                      )}
                      {booking.cancellationReason && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          <span className="font-medium">Cancelled:</span> {booking.cancellationReason}
                        </p>
                      )}
                      {booking.instructorNotes && (
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                          <span className="font-medium">Instructor Notes:</span> {booking.instructorNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getBookingStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Book Office Hour</h2>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                With {selectedSlot.provider?.fullName || selectedProvider?.provider?.fullName || '—'}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                  placeholder="e.g., Discuss assignment, Course questions..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={bookingData.studentNotes}
                  onChange={(e) => setBookingData({ ...bookingData, studentNotes: e.target.value })}
                  rows={3}
                  placeholder="Any additional information..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedSlot(null);
                  setBookingData({ purpose: '', studentNotes: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSlot}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookOfficeHourPage;
