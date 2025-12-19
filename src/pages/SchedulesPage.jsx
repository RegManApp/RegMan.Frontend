import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { scheduleApi, courseApi, instructorApi } from '../api';
import { ScheduleList, ScheduleForm, Timetable } from '../components/schedules';
import { PageHeader, Button, Card, Tabs } from '../components/common';
import { debounce, normalizeCourses } from '../utils/helpers';

const SchedulesPage = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [dayFilter, setDayFilter] = useState('');

  // Form modal state
  const [formModal, setFormModal] = useState({ isOpen: false, schedule: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (isInstructor() && !isAdmin()) {
        // Get instructor's schedules
        const instructorData = await instructorApi.getAll({ userId: user?.id });
        const instructorId = instructorData?.items?.[0]?.id || instructorData?.[0]?.id;
        if (instructorId) {
          response = await scheduleApi.getByInstructor(instructorId);
        } else {
          response = [];
        }
      } else {
        response = await scheduleApi.getAll();
      }
      
      const scheduleItems = Array.isArray(response) ? response : response.items || [];
      setSchedules(scheduleItems);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isInstructor, user?.id]);

  const fetchCoursesAndInstructors = useCallback(async () => {
    try {
      const [coursesRes, instructorsRes] = await Promise.all([
        courseApi.getAll(),
        instructorApi.getAll(),
      ]);
      
      const coursesData = Array.isArray(coursesRes) ? coursesRes : coursesRes.items || [];
      setCourses(normalizeCourses(coursesData));
      setInstructors(Array.isArray(instructorsRes) ? instructorsRes : instructorsRes.items || []);
    } catch (error) {
      console.error('Failed to fetch courses and instructors:', error);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    if (isAdmin()) {
      fetchCoursesAndInstructors();
    }
  }, [fetchSchedules, fetchCoursesAndInstructors, isAdmin]);

  const handleDayFilterChange = (value) => {
    setDayFilter(value);
  };

  const handleEdit = (schedule) => {
    if (schedule?.id) {
      setFormModal({ isOpen: true, schedule });
    } else {
      setFormModal({ isOpen: true, schedule: null });
    }
  };

  const handleCloseForm = () => {
    setFormModal({ isOpen: false, schedule: null });
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (formModal.schedule?.id) {
        await scheduleApi.update(formModal.schedule.id, data);
        toast.success('Schedule updated successfully');
      } else {
        await scheduleApi.create(data);
        toast.success('Schedule created successfully');
      }
      handleCloseForm();
      fetchSchedules();
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error(error.message || 'Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await scheduleApi.delete(scheduleId);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error(error.message || 'Failed to delete schedule');
    }
  };

  // Filter schedules by day
  const filteredSchedules = dayFilter !== ''
    ? schedules.filter(s => s.dayOfWeek === Number(dayFilter))
    : schedules;

  const tabs = [
    { id: 'list', label: 'List View' },
    { id: 'timetable', label: 'Timetable View' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Schedules"
        description="View and manage class schedules"
        action={
          isAdmin() && (
            <Button onClick={() => handleEdit({})}>
              Add Schedule
            </Button>
          )
        }
      />

      <Card>
        <div className="mb-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'list' ? (
          <ScheduleList
            schedules={filteredSchedules}
            isLoading={isLoading}
            onEdit={isAdmin() ? handleEdit : undefined}
            onDelete={isAdmin() ? handleDelete : undefined}
            dayFilter={dayFilter}
            onDayFilterChange={handleDayFilterChange}
          />
        ) : (
          <Timetable
            schedules={schedules}
            isLoading={isLoading}
          />
        )}
      </Card>

      {isAdmin() && (
        <ScheduleForm
          isOpen={formModal.isOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          schedule={formModal.schedule}
          courses={courses}
          instructors={instructors}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default SchedulesPage;
