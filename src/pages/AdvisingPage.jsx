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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      toast.error(t('advising.errors.declineFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    {
      key: 'student',
      header: t('advising.table.student'),
      render: (_, enrollment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {enrollment.student?.fullName || t('common.notAvailable')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enrollment.student?.email}
          </p>
          <p className="text-xs text-gray-400">
            {t('advising.table.studentMeta', {
              gpa: (enrollment.student?.gpa ?? 0).toFixed(2),
              credits: enrollment.student?.completedCredits ?? 0,
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'course',
      header: t('advising.table.course'),
      render: (_, enrollment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {enrollment.section?.course?.courseName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('advising.table.courseCodeSection', {
              courseCode: enrollment.section?.course?.courseCode,
              sectionName: enrollment.section?.sectionName,
            })}
          </p>
          <p className="text-xs text-gray-400">
            {t('advising.table.creditHours', {
              count: enrollment.section?.course?.creditHours || enrollment.section?.course?.credits || 0,
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'instructor',
      header: t('advising.table.instructor'),
      render: (_, enrollment) => (
        <span className="text-gray-900 dark:text-white">
          {enrollment.section?.instructor?.fullName || t('common.notAssigned')}
        </span>
      ),
    },
    {
      key: 'requestDate',
      header: t('advising.table.requestDate'),
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (_, enrollment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircleIcon}
            onClick={() => handleApprove(enrollment.enrollmentId)}
            disabled={isProcessing}
          >
            {t('advising.actions.approve')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={XCircleIcon}
            onClick={() => setDeclineModal({ isOpen: true, enrollment })}
            disabled={isProcessing}
          >
            {t('advising.actions.decline')}
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
        <Breadcrumb items={[{ name: t('nav.advising'), href: '/advising', current: true }]} />
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t('advising.page.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('advising.page.subtitle')}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('advising.stats.pending')}</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('advising.stats.approved')}</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('advising.stats.declined')}</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('advising.stats.todayRequests')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.todayRequestsCount}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pending Enrollments Table */}
      <Card title={t('advising.sections.pendingRequestsTitle')}>
        <div className="mb-4">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput('')}
            placeholder={t('advising.search.placeholder')}
            className="w-full sm:w-80"
          />
        </div>

        {enrollments.length === 0 && !isLoading ? (
          <EmptyState
            icon={AcademicCapIcon}
            title={t('advising.empty.title')}
            description={t('advising.empty.description')}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={enrollments}
              isLoading={isLoading}
              emptyMessage={t('advising.empty.table')}
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
        title={t('advising.decline.title')}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  {t('advising.decline.warningTitle')}
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {t('advising.decline.labels.student')}: {declineModal.enrollment?.student?.fullName}
                  <br />
                  {t('advising.decline.labels.course')}: {declineModal.enrollment?.section?.course?.courseCode} - {declineModal.enrollment?.section?.course?.courseName}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('advising.decline.reasonLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('advising.decline.reasonPlaceholder')}
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
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDecline}
              loading={isProcessing}
              disabled={!declineReason.trim()}
            >
              {t('advising.actions.declineEnrollment')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvisingPage;
