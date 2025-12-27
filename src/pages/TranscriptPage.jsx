import React, { useEffect, useMemo, useState } from "react";
import transcriptApi from "../api/transcriptApi";
import { enrollmentApi } from "../api/enrollmentApi";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const gradeOptions = [
  { value: "A", label: "A" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B", label: "B" },
  { value: "B-", label: "B-" },
  { value: "C+", label: "C+" },
  { value: "C", label: "C" },
  { value: "C-", label: "C-" },
  { value: "D+", label: "D+" },
  { value: "D", label: "D" },
  { value: "F", label: "F" },
];

const toTranscriptStatusKey = (status) => {
  const raw = String(status ?? "").trim();
  if (!raw) return "unknown";

  // Normalize common enum formats like IN_PROGRESS -> inProgress
  const parts = raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean);

  return parts
    .map((p, idx) => (idx === 0 ? p : `${p.charAt(0).toUpperCase()}${p.slice(1)}`))
    .join("");
};

const TranscriptPage = () => {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();

  const enrollmentStatusOptions = useMemo(
    () => [
      { value: "0", label: t("transcript.enrollmentStatus.pending") },
      { value: "1", label: t("transcript.enrollmentStatus.enrolled") },
      { value: "2", label: t("transcript.enrollmentStatus.dropped") },
      { value: "3", label: t("transcript.enrollmentStatus.completed") },
      { value: "4", label: t("transcript.enrollmentStatus.declined") },
    ],
    [t]
  );

  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);

  // Admin search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Edit modal (admin)
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editGrade, setEditGrade] = useState("");
  const [editEnrollmentStatus, setEditEnrollmentStatus] = useState("");

  const fetchMyTranscript = async () => {
    setLoading(true);
    try {
      const res = await transcriptApi.getMyTranscript();
      setTranscript(res.data);
    } catch {
      toast.error(t("transcript.errors.fetchFailed"));
    }
    setLoading(false);
  };

  const fetchStudentTranscript = async (studentUserId) => {
    setLoading(true);
    try {
      const res = await transcriptApi.getStudentTranscript(studentUserId);
      setTranscript(res.data);
    } catch {
      toast.error(t("transcript.errors.fetchFailed"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin()) {
      fetchMyTranscript();
    }
    // eslint-disable-next-line
  }, []);

  const handleSearch = async () => {
    const q = (searchQuery || "").trim();
    if (!q) {
      setSearchResults([]);
      setSelectedStudent(null);
      setTranscript(null);
      return;
    }

    setLoading(true);
    try {
      const res = await transcriptApi.searchStudents({ query: q, take: 20 });
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t("transcript.errors.searchFailed"));
    }
    setLoading(false);
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    await fetchStudentTranscript(student.studentUserId);
  };

  const handlePrint = () => {
    const prevTitle = document.title;
    const studentPart = transcript?.studentId ? `_${transcript.studentId}` : "";
    document.title = `Transcript${studentPart}`;
    window.print();
    document.title = prevTitle;
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditGrade(row.grade || "");
    setEditEnrollmentStatus("");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditRow(null);
    setEditGrade("");
    setEditEnrollmentStatus("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editRow) return;

    try {
      // Transcript record edit
      if (editRow.transcriptId && editRow.transcriptId !== 0) {
        await transcriptApi.update({ transcriptId: editRow.transcriptId, grade: editGrade });
        toast.success(t("transcript.toasts.updated"));
      }
      // Enrollment-backed edit (status and/or grade)
      else if (editRow.enrollmentId) {
        const payload = {};

        if (editEnrollmentStatus !== "") {
          payload.status = Number(editEnrollmentStatus);
        }
        if (editGrade) {
          payload.grade = editGrade;
        }

        await enrollmentApi.update(editRow.enrollmentId, payload);
        toast.success(t("transcript.toasts.updated"));
      }

      if (selectedStudent?.studentUserId) {
        await fetchStudentTranscript(selectedStudent.studentUserId);
      } else {
        await fetchMyTranscript();
      }

      closeEdit();
    } catch {
      toast.error(t("transcript.errors.saveFailed"));
    }
  };

  const termColumns = useMemo(() => {
    const cols = [
      { key: "courseCode", header: t("transcript.table.courseCode") },
      { key: "courseName", header: t("transcript.table.title") },
      { key: "subType", header: t("transcript.table.subType") },
      {
        key: "status",
        header: t("transcript.table.status"),
        render: (status) =>
          t(`transcript.status.${toTranscriptStatusKey(status)}`, {
            defaultValue: status,
          }),
      },
      { key: "grade", header: t("transcript.table.grade") },
      { key: "creditHours", header: t("transcript.table.credits") },
      {
        key: "qualityPoints",
        header: t("transcript.table.qualityPoints"),
        render: (value) => (typeof value === "number" ? value.toFixed(2) : "—"),
      },
    ];

    if (isAdmin()) {
      cols.push({
        key: "actions",
        header: t("common.actions"),
        render: (_value, row) => (
          <div className="flex gap-2 print:hidden">
            <Button size="sm" onClick={() => openEdit(row)}>
              {t("common.edit")}
            </Button>
          </div>
        ),
      });
    }

    return cols;
  }, [isAdmin, t]);

  const header = transcript?.header;
  const terms = Array.isArray(transcript?.semesters) ? transcript.semesters : [];

  return (
    <Card title={t("nav.transcript")}>
      <div className="print:hidden">
        {isAdmin() && (
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-end">
              <Input
                label={t("transcript.admin.searchLabel")}
                placeholder={t("transcript.admin.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleSearch}>{t("common.search")}</Button>
            </div>

            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <Table
                columns={[
                  { key: "studentId", header: t("transcript.admin.studentId") },
                  { key: "fullName", header: t("transcript.admin.fullName") },
                  { key: "email", header: t("transcript.admin.email") },
                  {
                    key: "actions",
                    header: t("common.actions"),
                    render: (_value, row) => (
                      <Button size="sm" onClick={() => handleSelectStudent(row)}>
                        {t("common.select")}
                      </Button>
                    ),
                  },
                ]}
                data={searchResults}
                isLoading={loading}
                emptyMessage={t("transcript.admin.noResults")}
              />
            )}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrint}>
            {t("transcript.actions.print")}
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            {t("transcript.actions.exportPdf")}
          </Button>
        </div>
      </div>

      <div id="transcript-print" className="space-y-6 print:text-black print:bg-white">
        {!transcript ? (
          <Table
            columns={[]}
            data={[]}
            isLoading={loading}
            emptyMessage={t("transcript.empty")}
          />
        ) : (
          <>
            {/* Header */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 print:border-none print:p-0">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("transcript.header.unofficial")}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {header?.universityName || ""}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {header?.registrarOfficeName || ""}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">{t("transcript.header.studentName")}:</span>{" "}
                  {header?.studentFullName || transcript.studentName}
                </div>
                <div>
                  <span className="font-medium">{t("transcript.header.studentId")}:</span>{" "}
                  {header?.studentId || transcript.studentId}
                </div>
                <div>
                  <span className="font-medium">{t("transcript.header.program")}:</span>{" "}
                  {header?.programOrDegree || transcript.majorName || t("common.notAssigned")}
                </div>
                <div>
                  <span className="font-medium">{t("transcript.header.cumulativeGpa")}:</span>{" "}
                  {typeof transcript.cumulativeGPA === "number" ? transcript.cumulativeGPA.toFixed(2) : "0.00"}
                </div>
              </div>
            </div>

            {/* Terms */}
            {terms.map((term) => (
              <div key={`${term.year}-${term.semester}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {term.termName || `${term.year} ${term.semester}`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {term.institutionName || ""}
                  </div>
                </div>

                <Table
                  columns={termColumns}
                  data={Array.isArray(term.courses) ? term.courses : []}
                  isLoading={loading}
                  emptyMessage={t("transcript.term.empty")}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-medium">{t("transcript.termSummary.attemptedCredits")}:</span>{" "}
                    {term.summary?.attemptedCredits ?? 0}
                  </div>
                  <div>
                    <span className="font-medium">{t("transcript.termSummary.earnedCredits")}:</span>{" "}
                    {term.summary?.earnedCredits ?? 0}
                  </div>
                  <div>
                    <span className="font-medium">{t("transcript.termSummary.gpaCredits")}:</span>{" "}
                    {term.summary?.gpaCredits ?? 0}
                  </div>
                  <div>
                    <span className="font-medium">{t("transcript.termSummary.qualityPoints")}:</span>{" "}
                    {typeof term.summary?.qualityPoints === "number" ? term.summary.qualityPoints.toFixed(2) : "0.00"}
                  </div>
                  <div>
                    <span className="font-medium">{t("transcript.termSummary.gpa")}:</span>{" "}
                    {typeof term.summary?.gpa === "number" ? term.summary.gpa.toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            ))}

            {/* Overall Summary */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">
                {t("transcript.overall.title")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">{t("transcript.overall.attemptedCredits")}:</span>{" "}
                  {transcript.overallSummary?.attemptedCredits ?? 0}
                </div>
                <div>
                  <span className="font-medium">{t("transcript.overall.earnedCredits")}:</span>{" "}
                  {transcript.overallSummary?.earnedCredits ?? 0}
                </div>
                <div>
                  <span className="font-medium">{t("transcript.overall.gpa")}:</span>{" "}
                  {typeof transcript.overallSummary?.gpa === "number" ? transcript.overallSummary.gpa.toFixed(2) : "0.00"}
                </div>
                <div>
                  <span className="font-medium">{t("transcript.overall.qualityPoints")}:</span>{" "}
                  {typeof transcript.overallSummary?.qualityPoints === "number" ? transcript.overallSummary.qualityPoints.toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin edit modal */}
      <Modal
        isOpen={editOpen}
        onClose={closeEdit}
        title={t("transcript.admin.editTitle")}
      >
        <form onSubmit={saveEdit} className="space-y-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">{t("transcript.table.courseCode")}:</span>{" "}
              {editRow?.courseCode || ""}
            </div>
            <div>
              <span className="font-medium">{t("transcript.table.title")}:</span>{" "}
              {editRow?.courseName || ""}
            </div>
          </div>

          {/* Transcript grade edit */}
          {editRow?.transcriptId && editRow.transcriptId !== 0 && (
            <Select
              label={t("transcript.table.grade")}
              value={editGrade}
              onChange={(e) => setEditGrade(e.target.value)}
              options={gradeOptions}
              placeholder={t("transcript.admin.selectGrade")}
              required
            />
          )}

          {/* Enrollment edit */}
          {editRow?.enrollmentId && (!editRow?.transcriptId || editRow.transcriptId === 0) && (
            <>
              <Select
                label={t("transcript.admin.enrollmentStatus")}
                value={editEnrollmentStatus}
                onChange={(e) => setEditEnrollmentStatus(e.target.value)}
                options={enrollmentStatusOptions}
                placeholder={t("transcript.admin.selectStatus")}
              />
              <Select
                label={t("transcript.table.grade")}
                value={editGrade}
                onChange={(e) => setEditGrade(e.target.value)}
                options={gradeOptions}
                placeholder={t("transcript.admin.selectGrade")}
              />
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeEdit}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default TranscriptPage;
