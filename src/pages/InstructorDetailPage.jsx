import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { instructorApi, scheduleApi } from '../api';
import { InstructorDetails, InstructorForm } from '../components/instructors';
import { PageHeader, Loading } from '../components/common';

const InstructorDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [instructor, setInstructor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);

  // Form modal state
  const [formModal, setFormModal] = useState({ isOpen: false, instructor: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await instructorApi.getById(id);
        setInstructor(res?.data ?? res);
      } catch (error) {
        console.error(error);
        toast.error(t('instructors.errors.detailsFetchFailed'));
        navigate('/instructors');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const res = await scheduleApi.getByInstructor(id);
        const schedulesData = res?.data ?? res;
        setSchedules(Array.isArray(schedulesData) ? schedulesData : schedulesData?.items || []);
      } catch (error) {
        console.error(error);
        setSchedules([]);
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    if (id) {
      fetchData();
      fetchSchedules();
    }
  }, [id, navigate]);

  const handleEdit = (instructor) => {
    setFormModal({ isOpen: true, instructor });
  };

  const handleCloseForm = () => {
    setFormModal({ isOpen: false, instructor: null });
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const instructorId = instructor.instructorId || instructor.id;
      await instructorApi.update(instructorId, data);
      toast.success(t('instructors.toasts.updated'));
      handleCloseForm();
      // Refresh instructor data
      const updatedRes = await instructorApi.getById(id);
      setInstructor(updatedRes?.data ?? updatedRes);
    } catch (error) {
      console.error(error);
      toast.error(t('instructors.errors.updateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/instructors');
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('common.accessDeniedTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('common.accessDeniedMessage')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading text={t('instructors.detailsPage.loading')} />;
  }

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('instructors.detailsPage.notFoundTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('instructors.detailsPage.notFoundMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('instructors.detailsPage.title')}
        description={t('instructors.detailsPage.description', {
          name:
            instructor.fullName ||
            instructor.user?.firstName + ' ' + instructor.user?.lastName,
        })}
      />

      <InstructorDetails
        instructor={instructor}
        schedules={schedules}
        onEdit={handleEdit}
        onBack={handleBack}
        isLoadingSchedules={isLoadingSchedules}
      />

      <InstructorForm
        isOpen={formModal.isOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        instructor={formModal.instructor}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default InstructorDetailPage;
