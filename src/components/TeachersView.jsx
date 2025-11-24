import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, RefreshCw, X, Eye, EyeOff, Download, Upload } from 'react-feather';
import ExcelService from '../service/ExcelService';
import { useTeacher } from '../hooks/useTeacher';
import { useClasses } from '../hooks/useClasses';
import { useSubjects } from '../hooks/useSubjects';

const TeachersView = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleInfo, setVisibleInfo] = useState({});
  const [importResult, setImportResult] = useState(null);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    phone: '',
    subjectIds: [],
    mainClassId: '',
  });

  const { fetchTeachers, addTeacher, updateTeacher, deleteTeacher, importTeachers, loading: loadingTeachers, error: errorTeachers } = useTeacher();
  const { fetchClasses, loading: loadingClasses } = useClasses();
  const { fetchSubjects, loading: loadingSubjects } = useSubjects();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadTeachers(),
      loadClasses(),
      loadSubjects()
    ]);
  };

  const loadTeachers = async () => {
    const result = await fetchTeachers();
    if (result.success) {
      const teachersArr = Array.isArray(result.teachers) ? result.teachers : [];
      const transformedTeachers = teachersArr.map((teacher, idx) => {
        let subjectIdsList = [];
        if (Array.isArray(teacher.subjectIds)) {
          subjectIdsList = teacher.subjectIds.map(s => {
            if (typeof s === 'object' && s !== null) {
              return s._id || s.id;
            }
            return s;
          });
        }

        return {
          idxNum: idx,
          id: teacher._id || teacher.id,
          name: teacher.name,
          email: teacher.userId?.email || teacher.email || '',
          phone: teacher.phone || '',
          mainClassId: teacher.mainClassId?._id || teacher.mainClassId || '',
          mainClassName: teacher.mainClassId?.name || teacher.mainClassName || '',
          subjectIds: subjectIdsList,
          userId: teacher.userId?._id || teacher.userId || ''
        };
      });
      setTeachers(transformedTeachers);
    } else {
      alert('Lỗi: ' + result.message);
    }
  };

  const loadClasses = async () => {
    const result = await fetchClasses();
    if (result.success) {
      setClasses(result.classes || []);
    }
  };

  const loadSubjects = async () => {
    const result = await fetchSubjects();
    if (result.success) {
      setSubjects(result.subjects || []);
    }
  };

  const maskEmail = (email) => {
    if (!email) return '-';
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    return `${user.charAt(0)}***@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return '-';
    if (phone.length <= 4) return '***';
    return `***${phone.slice(-3)}`;
  };

  const toggleVisibility = (teacherId, field) => {
    setVisibleInfo(prev => {
      const current = prev[teacherId];
      if (current === field) {
        return { ...prev, [teacherId]: null };
      }
      return { ...prev, [teacherId]: field };
    });
  };

  const isVisible = (teacherId, field) => {
    return visibleInfo[teacherId] === field || visibleInfo[teacherId] === 'both';
  };

  const handleOpenAddModal = () => {
    setNewTeacher({
      name: '',
      phone: '',
      subjectIds: [],
      mainClassId: '',
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewTeacher({
      name: '',
      phone: '',
      subjectIds: [],
      mainClassId: '',
    });
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!newTeacher.name.trim()) {
      alert('Vui lòng nhập họ tên giáo viên!');
      return;
    }

    if (!newTeacher.subjectIds || newTeacher.subjectIds.length === 0) {
      alert('Vui lòng chọn ít nhất một môn học!');
      return;
    }

    if (!newTeacher.mainClassId) {
      alert('Vui lòng chọn lớp chủ nhiệm!');
      return;
    }

    const validSubjectIds = newTeacher.subjectIds.filter(id => id && id.trim() !== '');
    if (validSubjectIds.length === 0) {
      alert('Các môn học đã chọn không hợp lệ!');
      return;
    }

    const teacherData = {
      name: newTeacher.name.trim(),
      phone: newTeacher.phone ? newTeacher.phone.trim() : undefined,
      subjectIds: validSubjectIds,
      mainClassId: newTeacher.mainClassId.trim(),
    };

    const result = await addTeacher(teacherData);

    if (result.success) {
      alert('Thêm giáo viên thành công!');
      handleCloseAddModal();
      loadTeachers();
    } else {
      const errorMsg = result.message || 'Không thể thêm giáo viên';
      alert(' Lỗi: ' + errorMsg);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher({ ...teacher });
  };

  const handleSaveEdit = async () => {
    if (editingTeacher) {
      const result = await updateTeacher(editingTeacher.id, {
        name: editingTeacher.name,
        phone: editingTeacher.phone,
        subjectIds: editingTeacher.subjectIds,
        mainClassId: editingTeacher.mainClassId,
      });
      if (result.success) {
        alert('Đã cập nhật thông tin giáo viên!');
        setEditingTeacher(null);
        loadTeachers();
      } else {
        alert('Lỗi: ' + result.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa giáo viên này?')) {
      const result = await deleteTeacher(id);
      if (result.success) {
        alert('Xóa giáo viên thành công!');
        loadTeachers();
      } else {
        alert('Lỗi: ' + result.message);
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const response = await importTeachers(file);
    console.log('Import response:', response);
    if (response.success) {
      const { successCount, failedCount, failed } = response.data || {};

      setImportResult({
        successCount: successCount || 0,
        failedCount: failedCount || 0,
        failed: failed || []
      });

      loadTeachers();
    } else {
      alert('Lỗi: ' + response.message);
    }

    e.target.value = '';
  };

  const loading = loadingTeachers || loadingClasses || loadingSubjects;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (errorTeachers) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Lỗi: {errorTeachers}</p>
        <button onClick={loadAllData} className="mt-2 text-red-600 hover:text-red-800 underline">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Giáo viên</h2>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              title="Tải lại danh sách"
            >
              <RefreshCw size={20} />
              Tải lại
            </button>

            <button
              onClick={() => ExcelService.downloadTemplate('Teacher')}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Download size={20} />
              Tải file mẫu
            </button>

            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload size={20} />
              <span>Import</span>
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </label>

            <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={20} />
              Thêm
            </button>
          </div>
        )}
      </div>

      {}
      {importResult && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Kết quả Import</h3>
            <button
              onClick={() => setImportResult(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-4 mb-3">
            <span className="text-green-600 font-medium">
               Thành công: {importResult.successCount}
            </span>
            <span className="text-red-600 font-medium">
               Thất bại: {importResult.failedCount}
            </span>
          </div>

          {importResult.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 font-medium mb-2">Chi tiết lỗi:</p>
              <ul className="text-sm text-red-600 space-y-1">
                {importResult.failed.map((f, idx) => (
                  <li key={idx}>• Dòng {f.row}: {f.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Thêm giáo viên mới</h3>
              <button onClick={handleCloseAddModal} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ và tên giáo viên"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123456789"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Các môn dạy (chọn nhiều môn) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    {subjects.map(s => {
                      const subjectId = s._id || s.id;
                      const isSelected = newTeacher.subjectIds.includes(subjectId);
                      return (
                        <button
                          key={subjectId}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewTeacher({
                                ...newTeacher,
                                subjectIds: newTeacher.subjectIds.filter(id => id !== subjectId)
                              });
                            } else {
                              setNewTeacher({
                                ...newTeacher,
                                subjectIds: [...newTeacher.subjectIds, subjectId]
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium ${isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                            }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1"> Click vào môn để chọn/bỏ chọn</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lớp chủ nhiệm <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTeacher.mainClassId}
                    onChange={(e) => setNewTeacher({ ...newTeacher, mainClassId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn lớp chủ nhiệm --</option>
                    {classes.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Thêm giáo viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {editingTeacher && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Chỉnh sửa giáo viên</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                value={editingTeacher.name}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="text"
                value={editingTeacher.phone}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Các môn dạy (chọn nhiều môn)</label>
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                {subjects.map(s => {
                  const subjectId = s._id || s.id;
                  const isSelected = (editingTeacher.subjectIds || []).includes(subjectId);
                  return (
                    <button
                      key={subjectId}
                      type="button"
                      onClick={() => {
                        const currentSubjects = editingTeacher.subjectIds || [];
                        if (isSelected) {
                          setEditingTeacher({
                            ...editingTeacher,
                            subjectIds: currentSubjects.filter(id => id !== subjectId)
                          });
                        } else {
                          setEditingTeacher({
                            ...editingTeacher,
                            subjectIds: [...currentSubjects, subjectId]
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1"> Click vào môn để chọn/bỏ chọn</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lớp chủ nhiệm</label>
              <select
                value={editingTeacher.mainClassId}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, mainClassId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Lưu
            </button>
            <button onClick={() => setEditingTeacher(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
              Hủy
            </button>
          </div>
        </div>
      )}

      {}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã GV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn dạy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp CN</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                  Chưa có giáo viên nào
                </td>
              </tr>
            ) : (
              teachers.map((teacher, idx) => {
                const displayCode = teacher.teacherCode || `GV${(idx + 1).toString().padStart(3, '0')}`;
                const mainClass = classes.find(c => (c._id || c.id) === teacher.mainClassId);
                const teacherSubjects = (teacher.subjectIds || [])
                  .map(sid => subjects.find(s => (s._id || s.id) === sid)?.name)
                  .filter(Boolean)
                  .join(', ') || '-';

                const emailVisible = isVisible(teacher.id, 'email');
                const phoneVisible = isVisible(teacher.id, 'phone');

                return (
                  <tr key={teacher.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{displayCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{emailVisible ? (teacher.email || '-') : maskEmail(teacher.email)}</span>
                        {teacher.email && (
                          <button
                            onClick={() => toggleVisibility(teacher.id, 'email')}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title={emailVisible ? 'Ẩn email' : 'Hiện email'}
                          >
                            {emailVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{phoneVisible ? (teacher.phone || '-') : maskPhone(teacher.phone)}</span>
                        {teacher.phone && (
                          <button
                            onClick={() => toggleVisibility(teacher.id, 'phone')}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title={phoneVisible ? 'Ẩn SĐT' : 'Hiện SĐT'}
                          >
                            {phoneVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacherSubjects}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacher.mainClassName || mainClass?.name || '-'}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeachersView;