import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { instructorApi, scheduleApi } from '../api';
import { InstructorDetails, InstructorForm } from '../components/instructors';
import { PageHeader, Loading } from '../components/common';

const InstructorDetailPage = () => {
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
        const instructorData = await instructorApi.getById(id);
        setInstructor(instructorData);
      } catch (error) {
        console.error('Failed to fetch instructor:', error);
        toast.error('Failed to load instructor details');
        navigate('/instructors');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const schedulesData = await scheduleApi.getByInstructor(id);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : schedulesData.items || []);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
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
      await instructorApi.update(instructor.id, data);
      toast.success('Instructor updated successfully');
      handleCloseForm();
      // Refresh instructor data
      const updatedInstructor = await instructorApi.getById(id);
      setInstructor(updatedInstructor);
    } catch (error) {
      console.error('Failed to update instructor:', error);
      toast.error(error.message || 'Failed to update instructor');
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
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading text="Loading instructor details..." />;
  }

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Instructor Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The instructor you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor Details"
        description={`Viewing details for ${instructor.user?.firstName} ${instructor.user?.lastName}`}
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
