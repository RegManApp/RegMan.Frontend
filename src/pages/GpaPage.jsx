
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import gpaApi from '../api/gpaApi';
import studentApi from '../api/studentApi';
import { PageLoading, Breadcrumb, Button, Input, Select, SearchInput } from '../components/common';

const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

const GradePointsMap = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
};

const GpaPage = () => {

  const { studentId: paramStudentId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // For admin: search and select student (with search button)
  const [studentSearch, setStudentSearch] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searched, setSearched] = useState(false);

  // Use either param or selected
  const studentId = paramStudentId || selectedStudent?.studentId;

  // Admin: search students only when clicking search
  const handleStudentSearch = async () => {
    setStudentSearchLoading(true);
    setSearched(true);
    try {
      const params = { pageSize: 10, pageNumber: 1 };
      if (/^\d+$/.test(studentSearch)) params.studentId = studentSearch;
      else if (studentSearch.includes('@')) params.email = studentSearch;
      else params.fullName = studentSearch;
      const res = await studentApi.getAll(params);
      setStudentOptions(res.data.items || res.data || []);
    } catch (e) {
      setStudentOptions([]);
    } finally {
      setStudentSearchLoading(false);
    }
  };

  const [gpaData, setGpaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      if (studentId && isAdmin()) {
        response = await gpaApi.getStudentGPA(studentId);
      } else {
        response = await gpaApi.getMyGPA();
      }
      setGpaData(response.data);
    } catch (error) {
      console.error('Failed to load GPA data:', error);
      toast.error('Failed to load GPA data');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, isAdmin]);


  // Load GPA data when studentId changes (from URL or select)
  useEffect(() => {
    if (isAdmin() && !studentId) {
      setGpaData(null);
      setIsLoading(false);
      return;
    }
    if (isAdmin() && !searched) {
      setIsLoading(false);
      return;
    }
    loadGpaData();
  }, [loadGpaData, studentId, isAdmin, searched]);

  // Simulate GPA when courses change
  useEffect(() => {
    const simulateCourses = simulatedCourses
      .filter(c => c.grade && c.creditHours > 0)
      .map(c => ({ creditHours: Number(c.creditHours), grade: c.grade }));

    if (simulateCourses.length === 0) {
      setSimulatedGpa(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await gpaApi.simulate(simulateCourses, studentId || null);
        setSimulatedGpa(response.data);
      } catch (error) {
        console.error('Simulation failed:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [simulatedCourses, studentId]);

  const handleGradeUpdate = async (enrollmentId) => {
    if (!newGrade) return;
    
    setIsSaving(true);
    try {
      const response = await gpaApi.updateGrade(enrollmentId, newGrade);
      toast.success('Grade updated successfully');
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
      toast.error('Failed to update grade');
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

  return (
    <div className="space-y-6">
      {/* Admin: Student search/select with search button */}
      {isAdmin() && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Search Student</label>
          <div className="flex gap-2 items-center">
            <Input
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              placeholder="Enter ID, name, or email..."
              className="w-64"
            />
            <Button onClick={handleStudentSearch} loading={studentSearchLoading} size="sm">Search</Button>
          </div>
          {searched && studentOptions.length === 0 && !studentSearchLoading && (
            <div className="text-red-600 mt-2">No students found.</div>
          )}
          {studentOptions.length > 0 && (
            <div className="mt-2">
              <Select
                options={studentOptions.map(s => ({
                  value: s.studentProfile?.studentId || s.id,
                  label: `${s.studentProfile?.studentId || s.id} - ${s.fullName || s.user?.fullName || ''} (${s.email || s.user?.email || ''})`
                }))}
                value={selectedStudent?.studentId || ''}
                onChange={e => {
                  const val = e.target.value;
                  const found = studentOptions.find(s => (s.studentProfile?.studentId || s.id) == val);
                  setSelectedStudent(found ? {
                    studentId: found.studentProfile?.studentId || found.id,
                    fullName: found.fullName || found.user?.fullName,
                    email: found.email || found.user?.email
                  } : null);
                  // Optionally update URL
                  // navigate(`/gpa?studentId=${val}`);
                }}
                placeholder="Select student..."
                className="w-96"
              />
            </div>
          )}
        </div>
      )}
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          ...(studentId ? [{ name: 'Students', href: '/students' }] : []),
          { name: 'GPA & Grades', href: studentId ? `/students/${studentId}/gpa` : '/gpa', current: true }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {gpaData?.studentName ? `${gpaData.studentName}'s GPA` : 'My GPA'}
          </h1>
          {gpaData?.studentEmail && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{gpaData.studentEmail}</p>
          )}
        </div>
        {studentId && (
          <Button variant="outline" onClick={() => navigate('/students')}>
            Back to Students
          </Button>
        )}
      </div>

      {/* GPA Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current GPA</div>
          <div className="text-3xl font-bold text-primary-600">
            {(gpaData?.currentGPA ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Stored GPA</div>
          <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {(gpaData?.storedGPA ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Completed Credits</div>
          <div className="text-3xl font-bold text-green-600">
            {gpaData?.completedCredits ?? 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Registered Credits</div>
          <div className="text-3xl font-bold text-blue-600">
            {gpaData?.registeredCredits ?? 0}
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enrollments & Grades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                {canEditGrades && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gpaData?.enrollments?.length === 0 ? (
                <tr>
                  <td colSpan={canEditGrades ? 7 : 6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No enrollments found
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
                      {enrollment.sectionName || 'N/A'} - {enrollment.semester}
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
                            { value: '', label: 'Select Grade' },
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
                          {enrollment.grade || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.gradePoints?.toFixed(1) ?? '-'}
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
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingGrade(null);
                                setNewGrade('');
                              }}
                            >
                              Cancel
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
                            Edit Grade
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GPA What-If Calculator</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add hypothetical courses to see how they would affect your GPA.
        </p>

        <div className="space-y-3">
          {simulatedCourses.map((course) => (
            <div key={course.id} className="flex gap-4 items-end">
              <div className="w-32">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Credits</label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={course.creditHours}
                  onChange={(e) => updateSimulatedCourse(course.id, 'creditHours', e.target.value)}
                />
              </div>
              <div className="w-40">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Expected Grade</label>
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
                Remove
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={addSimulatedCourse}>
              Add Course
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSimulatedCourses([{ id: Date.now(), creditHours: 3, grade: 'A' }])}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Simulation Results */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current GPA</div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {(simulatedGpa?.currentGPA ?? gpaData?.currentGPA ?? 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Simulated GPA</div>
              <div className="text-2xl font-bold text-primary-600">
                {simulatedGpa ? simulatedGpa.simulatedGPA.toFixed(2) : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Difference</div>
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
