
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import gpaApi from '../api/gpaApi';
import { PageLoading, Breadcrumb, Button, Input, Select } from '../components/common';
import { useTranslation } from 'react-i18next';

const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

const GradePointsMap = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
};

const GpaPage = () => {

  const { studentId: paramStudentId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { t } = useTranslation();

  // Admin must explicitly enter a student id and click an action
  const [adminStudentId, setAdminStudentId] = useState(paramStudentId || '');
  const [activeStudentId, setActiveStudentId] = useState(paramStudentId || null);

  const [gpaData, setGpaData] = useState(null);
  const [isLoading, setIsLoading] = useState(() => !isAdmin());
  const [isSimulating, setIsSimulating] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // What-If Calculator state
  const [simulatedCourses, setSimulatedCourses] = useState([
    { id: Date.now(), creditHours: 3, grade: 'A' }
  ]);
  const [simulatedGpa, setSimulatedGpa] = useState(null);

  const loadGpaData = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      const effectiveStudentId = isAdmin() ? activeStudentId : null;
      if (isAdmin()) {
        if (!effectiveStudentId) {
          setGpaData(null);
          return;
        }
        response = await gpaApi.getStudentGPA(effectiveStudentId);
      } else {
        response = await gpaApi.getMyGPA();
      }
      setGpaData(response.data);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || t('errors.failedToLoadGpa');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [activeStudentId, isAdmin, t]);

  // Load GPA data on mount (Student only)
  useEffect(() => {
    if (isAdmin()) return;
    loadGpaData();
  }, [loadGpaData, isAdmin]);

  const buildSimulateCoursesPayload = useCallback(() => {
    return simulatedCourses
      .filter(c => c.grade && Number(c.creditHours) > 0)
      .map(c => ({ creditHours: Number(c.creditHours), grade: c.grade }));
  }, [simulatedCourses]);

  const handleAdminSimulate = useCallback(async () => {
    const trimmed = String(adminStudentId || '').trim();
    if (!trimmed) {
      toast.error(t('errors.studentIdRequired'));
      return;
    }
    if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
      toast.error(t('errors.studentIdPositive'));
      return;
    }

    const studentId = Number(trimmed);
    const simulateCourses = buildSimulateCoursesPayload();

    setIsLoading(true);
    setIsSimulating(true);
    try {
      // 1) Fetch student info (GPA + enrollments)
      setActiveStudentId(studentId);
      const gpaRes = await gpaApi.getStudentGPA(studentId);
      setGpaData(gpaRes.data);

      // 2) Call simulate explicitly
      if (simulateCourses.length === 0) {
        setSimulatedGpa(null);
        return;
      }
      const simRes = await gpaApi.simulate(simulateCourses, studentId);
      setSimulatedGpa(simRes.data);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || t('errors.simulationFailed');
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsSimulating(false);
    }
  }, [adminStudentId, buildSimulateCoursesPayload, t]);

  const handleGradeUpdate = async (enrollmentId) => {
    if (!newGrade) return;
    
    setIsSaving(true);
    try {
      const response = await gpaApi.updateGrade(enrollmentId, newGrade);
      toast.success(t('toasts.gradeUpdated'));
      setEditingGrade(null);
      setNewGrade('');
      
      // Instantly update the GPA from response if available
      if (response.data?.newGpa !== undefined) {
        setGpaData(prev => ({
          ...prev,
          currentGpa: response.data.newGpa
        }));
        // Also update the enrollment in the list
        setGpaData(prev => ({
          ...prev,
          enrollments: prev.enrollments.map(e => 
            e.enrollmentId === enrollmentId 
              ? { ...e, grade: newGrade.toUpperCase(), status: response.data.status }
              : e
          )
        }));
      } else {
        // Fallback: reload to get updated GPA
        loadGpaData();
      }
    } catch (error) {
      console.error('Failed to update grade:', error);
      toast.error(t('errors.failedToUpdateGrade'));
    } finally {
      setIsSaving(false);
    }
  };

  const addSimulatedCourse = () => {
    setSimulatedCourses([...simulatedCourses, { id: Date.now(), creditHours: 3, grade: 'A' }]);
  };

  const removeSimulatedCourse = (id) => {
    setSimulatedCourses(simulatedCourses.filter(c => c.id !== id));
  };

  const updateSimulatedCourse = (id, field, value) => {
    setSimulatedCourses(simulatedCourses.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  if (isLoading) {
    return <PageLoading />;
  }

  const canEditGrades = isAdmin() || user?.role === 'Instructor';

  const studentId = isAdmin() ? activeStudentId : paramStudentId;

  return (
    <div className="space-y-6">
      {/* Admin: Live student search/select with dropdown and frontend filtering */}
      {isAdmin() && (
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('gpa.enterStudentId')}</label>
          <div className="flex gap-2 items-center">
          <Input
            value={adminStudentId}
            onChange={e => setAdminStudentId(e.target.value)}
            placeholder={t('gpa.enterStudentId')}
            className="w-96"
          />
          <Button onClick={handleAdminSimulate} loading={isSimulating}>
            {t('gpa.simulate')}
          </Button>
          </div>
        </div>
      )}
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          ...(studentId ? [{ name: t('nav.students'), href: '/students' }] : []),
          { name: t('gpa.title'), href: studentId ? `/students/${studentId}/gpa` : '/gpa', current: true }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {gpaData?.studentName ? t('gpa.studentNameTitle', { name: gpaData.studentName }) : (isAdmin() ? t('gpa.studentTitle') : t('gpa.myTitle'))}
          </h1>
          {gpaData?.studentEmail && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{gpaData.studentEmail}</p>
          )}
        </div>
        {studentId && (
          <Button variant="outline" onClick={() => navigate('/students')}>
            {t('gpa.backToStudents')}
          </Button>
        )}
      </div>

      {/* GPA Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.currentGpa')}</div>
          <div className="text-3xl font-bold text-primary-600">
            {(gpaData?.currentGPA ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.storedGpa')}</div>
          <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {(gpaData?.storedGPA ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.completedCredits')}</div>
          <div className="text-3xl font-bold text-green-600">
            {gpaData?.completedCredits ?? 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.registeredCredits')}</div>
          <div className="text-3xl font-bold text-blue-600">
            {gpaData?.registeredCredits ?? 0}
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('gpa.enrollmentsAndGrades')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.course')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.section')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.credits')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.grade')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.points')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.status')}</th>
                {canEditGrades && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gpa.actions')}</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gpaData?.enrollments?.length === 0 ? (
                <tr>
                  <td colSpan={canEditGrades ? 7 : 6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('gpa.noEnrollments')}
                  </td>
                </tr>
              ) : (
                gpaData?.enrollments?.map((enrollment) => (
                  <tr key={enrollment.enrollmentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{enrollment.courseName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{enrollment.courseCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.sectionName || t('common.notAvailable')} - {enrollment.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.creditHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingGrade === enrollment.enrollmentId ? (
                        <Select
                          value={newGrade}
                          onChange={(e) => setNewGrade(e.target.value)}
                          options={[
                            { value: '', label: t('gpa.selectGrade') },
                            ...GRADE_OPTIONS.map(g => ({ value: g, label: g }))
                          ]}
                          className="w-24"
                        />
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                          enrollment.grade
                            ? GradePointsMap[enrollment.grade] >= 3.0
                              ? 'bg-green-100 text-green-800'
                              : GradePointsMap[enrollment.grade] >= 2.0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.grade || t('common.notAvailable')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.gradePoints?.toFixed(1) ?? t('common.notAvailable')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'Enrolled' ? 'bg-blue-100 text-blue-800' :
                        enrollment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    {canEditGrades && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingGrade === enrollment.enrollmentId ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleGradeUpdate(enrollment.enrollmentId)}
                              loading={isSaving}
                              disabled={!newGrade || isSaving}
                            >
                              {t('common.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingGrade(null);
                                setNewGrade('');
                              }}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingGrade(enrollment.enrollmentId);
                              setNewGrade(enrollment.grade || '');
                            }}
                          >
                            {t('gpa.editGrade')}
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* What-If Calculator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('gpa.whatIfTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('gpa.whatIfDescription')}
        </p>

        <div className="space-y-3">
          {simulatedCourses.map((course) => (
            <div key={course.id} className="flex gap-4 items-end">
              <div className="w-32">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('gpa.credits')}</label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={course.creditHours}
                  onChange={(e) => updateSimulatedCourse(course.id, 'creditHours', e.target.value)}
                />
              </div>
              <div className="w-40">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('gpa.expectedGrade')}</label>
                <select
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={course.grade}
                  onChange={(e) => updateSimulatedCourse(course.id, 'grade', e.target.value)}
                >
                  {GRADE_OPTIONS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSimulatedCourse(course.id)}
              >
                {t('common.remove')}
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={addSimulatedCourse}>
              {t('gpa.addCourse')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSimulatedCourses([{ id: Date.now(), creditHours: 3, grade: 'A' }])}
            >
              {t('common.reset')}
            </Button>
          </div>
        </div>

        {/* Simulation Results */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.currentGpa')}</div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {(simulatedGpa?.currentGPA ?? gpaData?.currentGPA ?? 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.simulatedGpa')}</div>
              <div className="text-2xl font-bold text-primary-600">
                {simulatedGpa ? simulatedGpa.simulatedGPA.toFixed(2) : t('common.notAvailable')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.difference')}</div>
              {simulatedGpa && (
                <div className={`text-2xl font-bold ${
                  simulatedGpa.simulatedGPA > (simulatedGpa.currentGPA ?? gpaData?.currentGPA ?? 0)
                    ? 'text-green-600'
                    : simulatedGpa.simulatedGPA < (simulatedGpa.currentGPA ?? gpaData?.currentGPA ?? 0)
                    ? 'text-red-600'
                    : 'text-gray-700'
                }`}>
                  {(simulatedGpa.simulatedGPA - (simulatedGpa.currentGPA ?? gpaData?.currentGPA ?? 0) > 0 ? '+' : '')}
                  {(simulatedGpa.simulatedGPA - (simulatedGpa.currentGPA ?? gpaData?.currentGPA ?? 0)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpaPage;
