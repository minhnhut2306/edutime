/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Eye, Lock } from "react-feather";
import { useTeachingRecord } from "../../hooks/useTeachingRecord";
import { useClasses } from "../../hooks/useClasses";
import { useSubjects } from "../../hooks/useSubjects";
import { useTeacher } from "../../hooks/useTeacher";
import { useWeeks } from "../../hooks/useWeek";

import TeachingForm from "./TeachingForm";
import FiltersBar from "./FiltersBar";
import RecordsList from "./RecordsList";

import { normalize, normalizeRecord } from "./../../utils/teachingUtils";

const TeachingInputView = ({ initialTeachingRecords = [], schoolYear, isReadOnly = false }) => {
  const { fetchTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();
  const { fetchWeeks } = useWeeks();
  const { fetchTeachingRecords, addTeachingRecord, updateTeachingRecord, deleteTeachingRecord } = useTeachingRecord();

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState(initialTeachingRecords || []);

  // filters/form state
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [formTeacherId, setFormTeacherId] = useState("");
  const [periods, setPeriods] = useState("");
  const [recordType, setRecordType] = useState("teaching");
  const [notes, setNotes] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const [groupBy, setGroupBy] = useState("none");
  const [quickFilterMode, setQuickFilterMode] = useState("all");

  // user
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let parsedUser = null;
  try {
    parsedUser = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    parsedUser = null;
  }
  const currentUser = parsedUser || { role: "user" };
  const isAdmin = currentUser.role === "admin";

  useEffect(() => {
    (async () => {
      try {
        const tRes = await fetchTeachers();
        const rawTeachers = tRes.success ? (tRes.teachers || (tRes.data && tRes.data.teachers) || []) : [];
        const normTeachers = normalize(rawTeachers);
        const normalizedTeachers = normTeachers.map((t) => {
          const sids = (t.subjectIds || []).map((s) =>
            s && (s._id || s.id) ? (s._id || s.id) : typeof s === "string" ? s : ""
          ).filter(Boolean);
          return { ...t, subjectIds: sids };
        });
        setTeachers(normalizedTeachers);

        if (!isAdmin) {
          const matched = normalizedTeachers.find((tt) => {
            if (!tt.userId) return false;
            if (typeof tt.userId === "string") {
              return tt.userId === currentUser._id || tt.userId === currentUser.id;
            }
            return (
              tt.userId._id === currentUser._id ||
              tt.userId._id === currentUser.id ||
              tt.userId.email === currentUser.email
            );
          });
          if (matched) {
            setSelectedTeacherId(matched.id);
            setFormTeacherId(matched.id);
          }
        }
      } catch (err) {
        setTeachers([]);
      }

      try {
        const cRes = await fetchClasses();
        const rawClasses = cRes.success ? (cRes.classes || (cRes.data && cRes.data.classes) || []) : [];
        setClasses(normalize(rawClasses));
      } catch {
        setClasses([]);
      }

      try {
        const sRes = await fetchSubjects();
        const rawSubjects = sRes.success ? (sRes.subjects || (sRes.data && sRes.data.subjects) || []) : [];
        setSubjects(normalize(rawSubjects));
      } catch {
        setSubjects([]);
      }

      try {
        const wRes = await fetchWeeks();
        const rawWeeks = wRes.success ? (wRes.weeks || (wRes.data && wRes.data.weeks) || []) : [];
        setWeeks(normalize(rawWeeks));
      } catch {
        setWeeks([]);
      }
    })();
  }, []);

  const loadTeachingRecords = async (teacherId) => {
    try {
      const res = await fetchTeachingRecords(teacherId, schoolYear);
      if (!res) return;

      let raw = [];
      if (res.success && Array.isArray(res.teachingRecords)) raw = res.teachingRecords;
      else if (res.success && Array.isArray(res.data)) raw = res.data;
      else if (res.success && res.data && Array.isArray(res.data.teachingRecords)) raw = res.data.teachingRecords;
      else if (Array.isArray(res)) raw = res;

      const filtered = raw.filter(r => r.schoolYear ? r.schoolYear === schoolYear : true);
      const norm = filtered.map(normalizeRecord).filter(Boolean);

      setTeachingRecords(norm);
    } catch (err) {
      setTeachingRecords([]);
    }
  };

  useEffect(() => {
    const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
    loadTeachingRecords(teacherIdToFetch);
  }, [selectedTeacherId, isAdmin, schoolYear]);

  useEffect(() => {
    if (!formTeacherId) return;
    const t = teachers.find((x) => x.id === formTeacherId);
    const tSubjectIds = t?.subjectIds || [];
    if (tSubjectIds.length > 0) {
      if (!tSubjectIds.includes(selectedSubjectId)) {
        setSelectedSubjectId(tSubjectIds[0]);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [formTeacherId, teachers]);

  const allowedGrades = currentUser?.allowedGrades || [];
  const hasGradeRestriction = !isAdmin && Array.isArray(allowedGrades) && allowedGrades.length > 0;
  const availableClasses = hasGradeRestriction ? classes.filter((c) => allowedGrades.includes(c.grade)) : classes;

  const filteredRecords = teachingRecords.filter((r) => {
    if (quickFilterMode === "teacher" && selectedTeacherId) {
      if (r.teacherId !== selectedTeacherId) return false;
    }
    if (quickFilterMode === "week" && selectedWeekId) {
      if (r.weekId !== selectedWeekId) return false;
    }
    if (quickFilterMode === "class" && selectedClassId) {
      if (r.classId !== selectedClassId) return false;
    }
    if (quickFilterMode === "subject" && selectedSubjectId) {
      if (r.subjectId !== selectedSubjectId) return false;
    }
    if (quickFilterMode === "recordType" && recordType) {
      if (r.recordType !== recordType) return false;
    }
    return true;
  });

  const myRecords = isAdmin ? filteredRecords : filteredRecords.filter((r) => r.teacherId === selectedTeacherId);

  const resetForm = (keepTeacher = false) => {
    setSelectedWeekId("");
    setSelectedClassId("");
    setPeriods("");
    setRecordType("teaching");
    setNotes("");
    setIsEditing(false);
    setEditingRecordId(null);
    if (!keepTeacher) setFormTeacherId("");
  };

  const startEdit = (record) => {
    if (isReadOnly) {
      alert("⚠️ Năm học đang ở chế độ chỉ xem. Không thể chỉnh sửa bản ghi.");
      return;
    }
    setIsEditing(true);
    setEditingRecordId(record.id);
    setFormTeacherId(record.teacherId);
    setSelectedWeekId(record.weekId);
    setSelectedClassId(record.classId);
    setSelectedSubjectId(record.subjectId);
    setPeriods(record.periods);
    setRecordType(record.recordType || "teaching");
    setNotes(record.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm(!isAdmin);
  };

  const handleSave = async () => {
    if (isReadOnly) {
      alert("⚠️ Năm học đang ở chế độ chỉ xem. Không thể lưu thay đổi.");
      return;
    }
    if (!editingRecordId) return;
    if (!formTeacherId || !selectedWeekId || !selectedClassId || !selectedSubjectId || !periods) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const payload = {
      teacherId: formTeacherId,
      weekId: selectedWeekId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      periods: parseInt(periods, 10),
      recordType: recordType || "teaching",
      notes: notes || "",
      schoolYear,
    };

    const res = await updateTeachingRecord(editingRecordId, payload);
    if (res.success) {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      await loadTeachingRecords(teacherIdToFetch);
      resetForm(!isAdmin);
      alert("✅ Đã cập nhật bản ghi!");
    } else {
      alert(res.message || "Cập nhật thất bại");
    }
  };

  const handleAdd = async () => {
    if (isReadOnly) {
      alert("⚠️ Năm học đang ở chế độ chỉ xem. Không thể thêm bản ghi.");
      return;
    }
    if (isEditing) {
      await handleSave();
      return;
    }
    if (!isAdmin && !formTeacherId) {
      alert("Không tìm thấy thông tin giáo viên!");
      return;
    }
    if (isAdmin && !formTeacherId) {
      alert("Vui lòng chọn giáo viên!");
      return;
    }
    if (!selectedWeekId || !selectedClassId || !selectedSubjectId || !periods) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (hasGradeRestriction) {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      if (selectedClass && !allowedGrades.includes(selectedClass.grade)) {
        alert(`❌ Bạn không có quyền nhập dữ liệu cho khối ${selectedClass.grade}!\nBạn chỉ được nhập khối: ${allowedGrades.join(", ")}`);
        return;
      }
    }

    const payload = {
      teacherId: formTeacherId,
      weekId: selectedWeekId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      periods: parseInt(periods, 10),
      recordType: recordType || "teaching",
      notes: notes || "",
      schoolYear,
    };

    const res = await addTeachingRecord(payload);
    if (res.success) {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      await loadTeachingRecords(teacherIdToFetch);
      resetForm(!isAdmin);
      alert("✅ Đã thêm bản ghi!");
    } else {
      alert(res.message || "Thêm bản ghi thất bại");
    }
  };

  const handleDelete = async (recordId) => {
    if (isReadOnly) {
      alert("⚠️ Năm học đang ở chế độ chỉ xem. Không thể xóa bản ghi.");
      return;
    }
    const record = teachingRecords.find((r) => r.id === recordId);
    if (!record) return;
    if (!confirm("Xác nhận xóa bản ghi này?")) return;
    const res = await deleteTeachingRecord(recordId);
    if (res.success) {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      await loadTeachingRecords(teacherIdToFetch);
      alert("✅ Đã xóa bản ghi!");
    } else {
      alert(res.message || "Xóa thất bại");
    }
  };

  const subjectBelongsToSelectedTeacher = (sid) => {
    if (!formTeacherId) return false;
    const t = teachers.find((tt) => tt.id === formTeacherId);
    if (!t) return false;
    return (t.subjectIds || []).includes(sid);
  };

  // provide grouping utility used by RecordsList
  const groupRecords = (key) => {
    const groups = new Map();
    const list = isAdmin ? filteredRecords : filteredRecords.filter((r) => r.teacherId === selectedTeacherId);

    list.forEach((r) => {
      let gKey = "Khác";
      let label = "Khác";

      if (key === "teacher") {
        gKey = r.teacherId || "unknown";
        label =
          r.teacherData?.name ||
          teachers.find((t) => t.id === r.teacherId)?.name ||
          "Chưa rõ";
      } else if (key === "week") {
        gKey = r.weekId || "unknown";
        const wn = r.weekData?.weekNumber || weeks.find((w) => w.id === r.weekId)?.weekNumber;
        label = wn ? `Tuần ${wn}` : "Chưa rõ";
      } else if (key === "class") {
        gKey = r.classId || "unknown";
        label = r.classData?.name || classes.find((c) => c.id === r.classId)?.name || "Chưa rõ";
      } else if (key === "recordType") {
        gKey = r.recordType || "teaching";
        label = recordType || r.recordType || "Khác";
      } else if (key === "subject") {
        gKey = r.subjectId || "unknown";
        label = r.subjectData?.name || subjects.find((s) => s.id === r.subjectId)?.name || "Chưa rõ";
      }

      if (!groups.has(gKey)) groups.set(gKey, { label, items: [] });
      groups.get(gKey).items.push(r);
    });

    return Array.from(groups.entries()).map(([id, v]) => ({ id, label: v.label, items: v.items }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          {isEditing ? "Chỉnh sửa bản ghi" : "Nhập tiết dạy"}
          {isReadOnly && (
            <span className="flex items-center gap-2 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Eye size={16} />
              Chế độ xem
            </span>
          )}
        </h2>
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Đang xem dữ liệu năm học cũ</p>
            </div>
          </div>
        </div>
      )}

      {hasGradeRestriction && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Phân quyền của bạn</p>
              <p className="text-sm text-blue-700">
                Bạn chỉ được nhập dữ liệu cho các khối: <strong>{allowedGrades.join(", ")}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && !selectedTeacherId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-800">Tài khoản của bạn chưa được liên kết với giáo viên. Vui lòng liên hệ Admin!</p>
        </div>
      )}

      {!isReadOnly && (
        <TeachingForm
          isAdmin={isAdmin}
          isEditing={isEditing}
          isReadOnly={isReadOnly}
          teachers={teachers}
          weeks={weeks}
          subjects={subjects}
          classes={classes}
          availableClasses={availableClasses}
          allowedGrades={allowedGrades}
          formTeacherId={formTeacherId}
          setFormTeacherId={setFormTeacherId}
          selectedWeekId={selectedWeekId}
          setSelectedWeekId={setSelectedWeekId}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          selectedSubjectId={selectedSubjectId}
          setSelectedSubjectId={setSelectedSubjectId}
          periods={periods}
          setPeriods={setPeriods}
          recordType={recordType}
          setRecordType={setRecordType}
          notes={notes}
          setNotes={setNotes}
          onAddOrSave={isEditing ? handleSave : handleAdd}
          onCancel={handleCancelEdit}
          hasGradeRestriction={hasGradeRestriction}
        />
      )}

      <FiltersBar
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        quickFilterMode={quickFilterMode}
        setQuickFilterMode={setQuickFilterMode}
        teachers={teachers}
        weeks={weeks}
        availableClasses={availableClasses}
        subjects={subjects}
        selectedTeacherId={selectedTeacherId}
        setSelectedTeacherId={setSelectedTeacherId}
        selectedWeekId={selectedWeekId}
        setSelectedWeekId={setSelectedWeekId}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        recordType={recordType}
        setRecordType={setRecordType}
      />

      <RecordsList
        records={myRecords}
        groupBy={groupBy}
        groupRecordsFn={groupRecords}
        weeks={weeks}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
        isAdmin={isAdmin}
        isReadOnly={isReadOnly}
        selectedTeacherId={selectedTeacherId}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TeachingInputView;