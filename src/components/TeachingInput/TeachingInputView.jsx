import React, { useState, useEffect, useCallback } from "react";
import { Eye, Lock, Plus, Filter, Loader } from "react-feather";
import { useTeachingRecord } from "../../hooks/useTeachingRecord";
import { useClasses } from "../../hooks/useClasses";
import { useSubjects } from "../../hooks/useSubjects";
import { useTeacher } from "../../hooks/useTeacher";
import { useWeeks } from "../../hooks/useWeek";

import TeachingForm from "./TeachingForm";
import FiltersBar from "./FiltersBar";
import RecordsList from "./RecordsList";

import { normalize, normalizeRecord } from "./../../utils/teachingUtils";

// ✅ Cache tối ưu với Map
const cache = new Map();

const getCacheKey = (schoolYear, page, filters) => {
  const filterStr = JSON.stringify(filters);
  return `teaching_${schoolYear || 'current'}_page${page}_${filterStr}`;
};

const TeachingInputView = ({ schoolYear, isReadOnly = false }) => {
  const { fetchTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();
  const { fetchWeeks } = useWeeks();
  const { fetchTeachingRecords, addTeachingRecord, updateTeachingRecord, deleteTeachingRecord } = useTeachingRecord();

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
  const [sortBy, setSortBy] = useState("week");

  const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let parsedUser = null;
  try {
    parsedUser = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    parsedUser = null;
  }
  const currentUser = parsedUser || { role: "user" };
  const isAdmin = currentUser.role === "admin";

  // ✅ Load initial data (teachers, classes, subjects, weeks)
  useEffect(() => {
    const loadInitialData = async () => {
      const baseCacheKey = `initial_data_${schoolYear}`;
      
      // Check cache
      if (cache.has(baseCacheKey)) {
        const cached = cache.get(baseCacheKey);
        setTeachers(cached.teachers);
        setClasses(cached.classes);
        setSubjects(cached.subjects);
        setWeeks(cached.weeks);
        
        // ✅ Set teacher ID from cache
        if (!isAdmin && cached.selectedTeacherId) {
          setSelectedTeacherId(cached.selectedTeacherId);
          setFormTeacherId(cached.selectedTeacherId);
        }
        return;
      }

      setIsLoadingData(true);
      try {
        // Load all data in parallel
        const [tRes, cRes, sRes, wRes] = await Promise.all([
          fetchTeachers(),
          fetchClasses(),
          fetchSubjects(),
          fetchWeeks()
        ]);

        // Process teachers
        const rawTeachers = tRes.success ? (tRes.teachers || (tRes.data && tRes.data.teachers) || []) : [];
        const normTeachers = normalize(rawTeachers);
        const normalizedTeachers = normTeachers.map((t) => {
          const sids = (t.subjectIds || []).map((s) =>
            s && (s._id || s.id) ? (s._id || s.id) : typeof s === "string" ? s : ""
          ).filter(Boolean);
          return { ...t, subjectIds: sids };
        });
        setTeachers(normalizedTeachers);

        // ✅ Find linked teacher for non-admin
        let linkedTeacherId = "";
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
            linkedTeacherId = matched.id;
            setSelectedTeacherId(matched.id);
            setFormTeacherId(matched.id);
          }
        }

        // Process classes
        const rawClasses = cRes.success ? (cRes.classes || (cRes.data && cRes.data.classes) || []) : [];
        const normalizedClasses = normalize(rawClasses);
        setClasses(normalizedClasses);

        // Process subjects
        const rawSubjects = sRes.success ? (sRes.subjects || (sRes.data && sRes.data.subjects) || []) : [];
        const normalizedSubjects = normalize(rawSubjects);
        setSubjects(normalizedSubjects);

        // Process weeks
        const rawWeeks = wRes.success ? (wRes.weeks || (wRes.data && wRes.data.weeks) || []) : [];
        const normalizedWeeks = normalize(rawWeeks);
        setWeeks(normalizedWeeks);

        // ✅ Cache all data including selectedTeacherId
        cache.set(baseCacheKey, {
          teachers: normalizedTeachers,
          classes: normalizedClasses,
          subjects: normalizedSubjects,
          weeks: normalizedWeeks,
          selectedTeacherId: linkedTeacherId
        });

      } catch (err) {
        console.error("Error loading initial data:", err);
        setTeachers([]);
        setClasses([]);
        setSubjects([]);
        setWeeks([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [schoolYear]);

  // ✅ Load teaching records with cache
  const loadTeachingRecords = useCallback(async (page = 1) => {
    const filters = {
      quickFilterMode,
      weekId: quickFilterMode === "week" ? selectedWeekId : "",
      classId: quickFilterMode === "class" ? selectedClassId : "",
      subjectId: quickFilterMode === "subject" ? selectedSubjectId : "",
      recordType: quickFilterMode === "recordType" ? recordType : ""
    };

    const cacheKey = getCacheKey(schoolYear, page, filters);
    
    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      setTeachingRecords(cached.records);
      setPagination(cached.pagination);
      return;
    }

    setIsLoadingRecords(true);
    try {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      const apiFilters = {};
      
      if (quickFilterMode === "week" && selectedWeekId) {
        apiFilters.weekId = selectedWeekId;
      }
      if (quickFilterMode === "class" && selectedClassId) {
        apiFilters.classId = selectedClassId;
      }
      if (quickFilterMode === "subject" && selectedSubjectId) {
        apiFilters.subjectId = selectedSubjectId;
      }
      if (quickFilterMode === "recordType" && recordType) {
        apiFilters.recordType = recordType;
      }

      const paginationParams = {
        page,
        limit: pagination.limit
      };

      const res = await fetchTeachingRecords(
        teacherIdToFetch,
        schoolYear,
        apiFilters,
        paginationParams
      );

      if (!res) return;

      let records = [];
      let paginationData = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };

      if (res.success) {
        if (res.data && res.data.records) {
          records = res.data.records;
          paginationData = res.data.pagination || paginationData;
        } else if (Array.isArray(res.teachingRecords)) {
          records = res.teachingRecords;
          if (res.pagination) {
            paginationData = res.pagination;
          }
        }
      }

      const filtered = records.filter(r => r.schoolYear ? r.schoolYear === schoolYear : true);
      let norm = filtered.map(normalizeRecord).filter(Boolean);

      if (sortBy === "week") {
        norm.sort((a, b) => {
          const weekA = a.weekData?.weekNumber || weeks.find((w) => w.id === a.weekId)?.weekNumber || 0;
          const weekB = b.weekData?.weekNumber || weeks.find((w) => w.id === b.weekId)?.weekNumber || 0;
          return weekA - weekB;
        });
      }

      setTeachingRecords(norm);
      setPagination(paginationData);
      
      // Cache records
      cache.set(cacheKey, {
        records: norm,
        pagination: paginationData
      });

    } catch (err) {
      console.error("Error loading teaching records:", err);
      setTeachingRecords([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } finally {
      setIsLoadingRecords(false);
    }
  }, [selectedTeacherId, quickFilterMode, selectedWeekId, selectedClassId, selectedSubjectId, recordType, isAdmin, schoolYear, weeks, sortBy]);

  useEffect(() => {
    loadTeachingRecords(pagination.page);
  }, [loadTeachingRecords]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    loadTeachingRecords(newPage);
  };

  // ✅ Invalidate only teaching records cache, keep initial data cache
  const invalidateRecordsCache = () => {
    // Only clear teaching records cache, not initial data
    const keysToDelete = [];
    cache.forEach((value, key) => {
      if (key.startsWith('teaching_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
  };

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
      alert("Năm học đang ở chế độ chỉ xem. Không thể chỉnh sửa bản ghi.");
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

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm(!isAdmin);
  };

  const handleSave = async () => {
    if (isReadOnly) {
      alert("Năm học đang ở chế độ chỉ xem. Không thể lưu thay đổi.");
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
      invalidateRecordsCache();
      await loadTeachingRecords(pagination.page);
      resetForm(!isAdmin);
      alert("Đã cập nhật bản ghi!");
    } else {
      alert(res.message || "Cập nhật thất bại");
    }
  };

  const handleAdd = async () => {
    if (isReadOnly) {
      alert("Năm học đang ở chế độ chỉ xem. Không thể thêm bản ghi.");
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
        alert(`Bạn không có quyền nhập dữ liệu cho khối ${selectedClass.grade}!\nBạn chỉ được nhập khối: ${allowedGrades.join(", ")}`);
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
      invalidateRecordsCache();
      await loadTeachingRecords(1);
      resetForm(!isAdmin); // ✅ Keep teacher ID for non-admin
      alert("Đã thêm bản ghi!");
    } else {
      alert(res.message || "Thêm bản ghi thất bại");
    }
  };

  const handleDelete = async (recordId) => {
    if (isReadOnly) {
      alert("Năm học đang ở chế độ chỉ xem. Không thể xóa bản ghi.");
      return;
    }
    const record = teachingRecords.find((r) => r.id === recordId);
    if (!record) return;
    if (!confirm("Xác nhận xóa bản ghi này?")) return;
    const res = await deleteTeachingRecord(recordId);
    if (res.success) {
      invalidateRecordsCache();
      await loadTeachingRecords(pagination.page);
      alert("Đã xóa bản ghi!");
    } else {
      alert(res.message || "Xóa thất bại");
    }
  };

  const groupRecords = (key) => {
    const groups = new Map();

    teachingRecords.forEach((r) => {
      let gKey = "Khác";
      let label = "Khác";

      if (key === "teacher") {
        gKey = r.teacherId || "unknown";
        label = r.teacherData?.name || teachers.find((t) => t.id === r.teacherId)?.name || "Chưa rõ";
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

  // ✅ Show loading when initial data is loading
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Nhập tiết dạy
          {isReadOnly && (
            <span className="flex items-center gap-2 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Eye size={16} />
              Chế độ xem
            </span>
          )}
        </h2>

        {!isReadOnly && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                showForm
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Plus size={18} />
              {showForm ? "Ẩn Form" : "Thêm mới"}
            </button>

            <button
              onClick={() => {
                if (showFilters) {
                  setQuickFilterMode("all");
                  setSelectedWeekId("");
                  setSelectedClassId("");
                  setSelectedSubjectId("");
                  setRecordType("teaching");
                }
                setShowFilters(!showFilters);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                showFilters
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter size={18} />
              {showFilters ? "Ẩn Lọc" : "Bộ lọc"}
            </button>
          </div>
        )}
      </div>

      {/* Banners */}
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

      {/* ✅ FIX: Only show warning if NOT admin AND no selectedTeacherId */}
      {!isAdmin && !selectedTeacherId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-800">Tài khoản của bạn chưa được liên kết với giáo viên. Vui lòng liên hệ Admin!</p>
        </div>
      )}

      {/* Form */}
      {!isReadOnly && showForm && (
        <div className="animate-slideIn">
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
        </div>
      )}

      {showFilters && (
        <div className="animate-slideIn">
          <FiltersBar
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            quickFilterMode={quickFilterMode}
            setQuickFilterMode={setQuickFilterMode}
            teachers={teachers}
            weeks={weeks}
            availableClasses={availableClasses}
            subjects={subjects}
            selectedTeacherId={isAdmin ? selectedTeacherId : ""}
            setSelectedTeacherId={isAdmin ? setSelectedTeacherId : undefined}
            selectedWeekId={selectedWeekId}
            setSelectedWeekId={setSelectedWeekId}
            selectedClassId={selectedClassId}
            setSelectedClassId={setSelectedClassId}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            recordType={recordType}
            setRecordType={setRecordType}
          />
        </div>
      )}

      {/* ✅ Loading indicator nhỏ khi load records */}
      <div className="relative">
        {isLoadingRecords && teachingRecords.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Loader className="animate-spin text-blue-600" size={20} />
          </div>
        )}
        
        {isLoadingRecords && teachingRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader className="animate-spin text-blue-600" size={48} />
              <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <RecordsList
            records={teachingRecords}
            pagination={pagination}
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
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default TeachingInputView;