import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { advisingApi } from '../api/advisingApi';
import {
  PageLoading,
  Breadcrumb,
  Card,
  Button,
  Table,
  TablePagination,
  SearchInput,
  Badge,
  Modal,
  EmptyState,
} from '../components/common';
import { formatDate } from '../utils/helpers';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AdvisingPage = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isInstructor } = useAuth();
  
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Debounce search so we don't spam API and cause "reload" feel
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setSearchQuery(searchInput);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Decline modal state
  const [declineModal, setDeclineModal] = useState({ isOpen: false, enrollment: null });
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await advisingApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await advisingApi.getPendingEnrollments({
        page,
        pageSize,
        search: searchQuery,
      });
      const data = response.data;
      setEnrollments(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      toast.error(t('advising.errors.pendingFetchFailed'));
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    loadStats();
    loadEnrollments();
  }, [loadStats, loadEnrollments]);

  const handleApprove = async (enrollmentId) => {
    setIsProcessing(true);
    try {
      await advisingApi.approveEnrollment(enrollmentId);
      toast.success(t('advising.toasts.approved'));
      loadStats();
      loadEnrollments();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error(t('advising.errors.approveFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineModal.enrollment || !declineReason.trim()) {
      toast.error(t('advising.errors.declineReasonRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await advisingApi.declineEnrollment(declineModal.enrollment.enrollmentId, declineReason);
      toast.success(t('advising.toasts.declined'));
      setDeclineModal({ isOpen: false, enrollment: null });
      setDeclineReason('');
      loadStats();
      loadEnrollments();
    } catch (error) {
      console.error('Failed to decline:', error);
      toast.error(t('advising.errors.declineFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, enrollment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {enrollment.student?.fullName || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enrollment.student?.email}
          </p>
          <p className="text-xs text-gray-400">
            GPA: {enrollment.student?.gpa?.toFixed(2) || '0.00'} | Credits: {enrollment.student?.completedCredits || 0}
          </p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (_, enrollment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {enrollment.section?.course?.courseName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enrollment.section?.course?.courseCode} - Section {enrollment.section?.sectionName}
          </p>
          <p className="text-xs text-gray-400">
            {enrollment.section?.course?.creditHours || enrollment.section?.course?.credits} Credit Hours
          </p>
        </div>
      ),
    },
    {
      key: 'instructor',
      header: 'Instructor',
      render: (_, enrollment) => (
        <span className="text-gray-900 dark:text-white">
          {enrollment.section?.instructor?.fullName || 'TBA'}
        </span>
      ),
    },
    {
      key: 'requestDate',
      header: 'Request Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, enrollment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircleIcon}
            onClick={() => handleApprove(enrollment.enrollmentId)}
            disabled={isProcessing}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={XCircleIcon}
            onClick={() => setDeclineModal({ isOpen: true, enrollment })}
            disabled={isProcessing}
          >
            Decline
          </Button>
        </div>
      ),
    },
  ];

  if (isInitialLoad && isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ name: 'Advising', href: '/advising', current: true }]} />
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Course Enrollment Advising
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Review and approve student course registration requests
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.approvedCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Declined</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.declinedCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.todayRequestsCount}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pending Enrollments Table */}
      <Card title="Pending Enrollment Requests">
        <div className="mb-4">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput('')}
            placeholder="Search by student name or course..."
            className="w-full sm:w-80"
          />
        </div>

        {enrollments.length === 0 && !isLoading ? (
          <EmptyState
            icon={AcademicCapIcon}
            title="No Pending Requests"
            description="All enrollment requests have been processed. Check back later for new requests."
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={enrollments}
              isLoading={isLoading}
              emptyMessage="No pending enrollments found."
            />

            {totalPages > 1 && (
              <TablePagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      {/* Decline Modal */}
      <Modal
        isOpen={declineModal.isOpen}
        onClose={() => {
          setDeclineModal({ isOpen: false, enrollment: null });
          setDeclineReason('');
        }}
        title="Decline Enrollment"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  You are about to decline this enrollment request
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  Student: {declineModal.enrollment?.student?.fullName}
                  <br />
                  Course: {declineModal.enrollment?.section?.course?.courseCode} - {declineModal.enrollment?.section?.course?.courseName}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for Declining <span className="text-red-500">*</span>
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Missing prerequisites, credit overload, schedule conflict..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeclineModal({ isOpen: false, enrollment: null });
                setDeclineReason('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDecline}
              loading={isProcessing}
              disabled={!declineReason.trim()}
            >
              Decline Enrollment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvisingPage;
