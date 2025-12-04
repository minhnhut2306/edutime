import React from "react";
import { Trash2, Edit3, ChevronLeft, ChevronRight } from "react-feather";
import { recordTypeLabels } from "./../../utils/teachingUtils";

const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
      <div className="text-sm text-gray-600">
        Hiển thị trang {page} / {totalPages} (Tổng: {total} bản ghi)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`p-2 rounded-lg ${
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border hover:bg-gray-50 text-gray-700"
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded-lg bg-white border hover:bg-gray-50 text-gray-700"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg ${
              p === page
                ? "bg-blue-600 text-white"
                : "bg-white border hover:bg-gray-50 text-gray-700"
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded-lg bg-white border hover:bg-gray-50 text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`p-2 rounded-lg ${
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border hover:bg-gray-50 text-gray-700"
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const RecordsList = ({
  records,
  pagination,
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
  onPageChange,
}) => {
  const renderTable = (items) => (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tuần
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Giáo viên
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Lớp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Môn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Số tiết
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ghi chú
              </th>
              {!isReadOnly && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((record) => {
              const teacherName =
                record.teacherData?.name ||
                teachers.find((t) => t.id === record.teacherId)?.name ||
                "-";
              const weekNumber =
                record.weekData?.weekNumber ||
                weeks.find((w) => w.id === record.weekId)?.weekNumber ||
                "?";
              const className =
                record.classData?.name ||
                classes.find((c) => c.id === record.classId)?.name ||
                "-";
              const subjectName =
                record.subjectData?.name ||
                subjects.find((s) => s.id === record.subjectId)?.name ||
                "-";
              const canEdit =
                isAdmin ||
                (!isAdmin && record.teacherId === selectedTeacherId);

              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    Tuần {weekNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {teacherName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.recordType === "teaching"
                          ? "bg-blue-100 text-blue-700"
                          : record.recordType === "extra"
                          ? "bg-purple-100 text-purple-700"
                          : record.recordType === "exam"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {recordTypeLabels[record.recordType] || "Giảng dạy"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {className}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {subjectName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {record.periods}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 italic">
                    {record.notes || "-"}
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => onDelete(record.id)}
                          className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(record)}
                          disabled={!canEdit}
                          className={`p-2 rounded-md ${
                            !canEdit
                              ? "opacity-40 cursor-not-allowed"
                              : "bg-gray-50 hover:bg-blue-50 text-blue-600"
                          } transition`}
                          title={
                            canEdit ? "Sửa" : "Bạn không có quyền sửa"
                          }
                        >
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
      {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
    </>
  );

  if (groupBy && groupBy !== "none") {
    const groups = groupRecordsFn(groupBy);
    return (
      <div className="space-y-4">
        {groups.map((g) => (
          <div
            key={g.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{g.label}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {g.items.length} bản ghi
                </p>
              </div>
            </div>
            {renderTable(g.items)}
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
          <p className="text-sm text-gray-500 mt-1">
            Tổng: {pagination?.total || records.length} bản ghi
          </p>
        </div>
      </div>
      {renderTable(records)}
    </div>
  );
};

export default RecordsList;