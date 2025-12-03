import React from "react";
import { Trash2, Edit3 } from "react-feather";
import { recordTypeLabels } from "./../../utils/teachingUtils";

const RecordsList = ({
  records,
  groupBy,
  groupRecordsFn,
  weeks,
  teachers,
  classes,
  subjects,
  isAdmin,
  isReadOnly,
  selectedTeacherId,
  onEdit,
  onDelete,
}) => {
  if (groupBy && groupBy !== "none") {
    const groups = groupRecordsFn(groupBy);
    return (
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{g.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{g.items.length} bản ghi</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giáo viên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiết</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                    {!isReadOnly && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {g.items
                    .sort((a, b) => {
                      const weekA = weeks.find((w) => w.id === a.weekId);
                      const weekB = weeks.find((w) => w.id === b.weekId);
                      return (weekB?.weekNumber || 0) - (weekA?.weekNumber || 0);
                    })
                    .map((record) => {
                      const teacherName = record.teacherData?.name || teachers.find((t) => t.id === record.teacherId)?.name || "-";
                      const weekNumber = record.weekData?.weekNumber || weeks.find((w) => w.id === record.weekId)?.weekNumber || "?";
                      const className = record.classData?.name || classes.find((c) => c.id === record.classId)?.name || "-";
                      const subjectName = record.subjectData?.name || subjects.find((s) => s.id === record.subjectId)?.name || "-";
                      const canEdit = isAdmin || (!isAdmin && record.teacherId === selectedTeacherId);

                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">Tuần {weekNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{teacherName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.recordType === 'teaching' ? 'bg-blue-100 text-blue-700' :
                              record.recordType === 'extra' ? 'bg-purple-100 text-purple-700' :
                                record.recordType === 'exam' ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'
                              }`}>
                              {recordTypeLabels[record.recordType] || 'Giảng dạy'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{className}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{subjectName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{record.periods}</td>
                          <td className="px-4 py-3 text-sm text-gray-400 italic">{record.notes || '-'}</td>
                          {!isReadOnly && (
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="inline-flex items-center justify-end gap-2">
                                <button onClick={() => onDelete(record.id)} className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" title="Xóa">
                                  <Trash2 size={16} />
                                </button>
                                <button onClick={() => onEdit(record)} disabled={!canEdit} className={`p-2 rounded-md ${!canEdit ? "opacity-40 cursor-not-allowed" : "bg-gray-50 hover:bg-blue-50 text-blue-600"} transition`} title={canEdit ? "Sửa" : "Bạn không có quyền sửa"}>
                                  <Edit3 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Non-grouped (flat) view
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Danh sách bản ghi</h3>
          <p className="text-sm text-gray-500 mt-1">Tổng: {records.length} bản ghi</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giáo viên</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiết</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
              {!isReadOnly && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records
              .sort((a, b) => {
                const weekA = weeks.find((w) => w.id === a.weekId);
                const weekB = weeks.find((w) => w.id === b.weekId);
                return (weekB?.weekNumber || 0) - (weekA?.weekNumber || 0);
              })
              .map((record) => {
                const teacherName = record.teacherData?.name || teachers.find((t) => t.id === record.teacherId)?.name || "-";
                const weekNumber = record.weekData?.weekNumber || weeks.find((w) => w.id === record.weekId)?.weekNumber || "?";
                const className = record.classData?.name || classes.find((c) => c.id === record.classId)?.name || "-";
                const subjectName = record.subjectData?.name || subjects.find((s) => s.id === record.subjectId)?.name || "-";
                const canEdit = isAdmin || (!isAdmin && record.teacherId === selectedTeacherId);

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">Tuần {weekNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{teacherName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.recordType === 'teaching' ? 'bg-blue-100 text-blue-700' :
                        record.recordType === 'extra' ? 'bg-purple-100 text-purple-700' :
                          record.recordType === 'exam' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {recordTypeLabels[record.recordType] || 'Giảng dạy'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{className}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{subjectName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{record.periods}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 italic">{record.notes || '-'}</td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button onClick={() => onDelete(record.id)} className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" title="Xóa">
                            <Trash2 size={16} />
                          </button>
                          <button onClick={() => onEdit(record)} disabled={!canEdit} className={`p-2 rounded-md ${!canEdit ? "opacity-40 cursor-not-allowed" : "bg-gray-50 hover:bg-blue-50 text-blue-600"} transition`} title={canEdit ? "Sửa" : "Bạn không có quyền sửa"}>
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsList;