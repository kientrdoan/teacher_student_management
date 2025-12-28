"use client";

import { useState, useMemo, useEffect } from "react";
import { Select, Button } from "antd";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCalendarToday,
  MdFullscreen,
} from "react-icons/md";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getAllSemeterAction, getCurrentSemeterAction } from "../redux/actions/SemesterAction";
import { getAllCourseByTeacherAndSemesterAction } from "../redux/actions/CourseAction";

// 🔹 Hàm sinh tuần
function generateAllWeeks(startDate, endDate) {
  const weeks = [];
  let start = dayjs(startDate);
  const end = dayjs(endDate);
  let weekNumber = 1;

  while (start.isBefore(end) || start.isSame(end, "day")) {
    const weekEnd = start.add(6, "day");
    const actualEnd = weekEnd.isAfter(end) ? end : weekEnd;

    weeks.push({
      value: weekNumber.toString(),
      label: `Tuần ${weekNumber} [${start.format("DD/MM/YYYY")} - ${actualEnd.format("DD/MM/YYYY")}]`,
      start: start.format("YYYY-MM-DD"),
      end: actualEnd.format("YYYY-MM-DD"),
      weekNumber,
    });

    start = actualEnd.add(1, "day");
    weekNumber++;
  }

  return weeks;
}

const DAYS = [
  { key: 0, label: "Thứ 2" },
  { key: 1, label: "Thứ 3" },
  { key: 2, label: "Thứ 4" },
  { key: 3, label: "Thứ 5" },
  { key: 4, label: "Thứ 6" },
  { key: 5, label: "Thứ 7" },
];

const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);

function convertWeekday(weekday) {
  const map = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thusday: 3,
    Friday: 4,
    Saturday: 5,
  };
  return map[weekday] ?? null;
}

export default function TimeTable() {
  const dispatch = useDispatch();

  const semesters = useSelector((state) => state.SemesterReducer.semesters);
  const semester_detail = useSelector((state) => state.SemesterReducer.semester_detail);
  const courses = useSelector((state) => state.CourseReducer.courses);
  const user = useSelector((state) => state.UserReducer.user);

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Lấy học kỳ
  useEffect(() => {
    dispatch(getAllSemeterAction());
    dispatch(getCurrentSemeterAction());
  }, [dispatch]);

  // Chọn học kỳ hiện tại mặc định
  useEffect(() => {
    if (semester_detail?.id && !selectedSemester) {
      setSelectedSemester(semester_detail.id.toString());
    }
  }, [semester_detail, selectedSemester]);

  // Lấy course theo học kỳ
  useEffect(() => {
    if (selectedSemester && user?.user_id) {
      dispatch(getAllCourseByTeacherAndSemesterAction(user.user_id, selectedSemester));
    }
  }, [dispatch, user?.user_id, selectedSemester]);

  // 🔹 Chuẩn hóa course
  const normalizedCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return courses.map((c) => {
      const startPeriod = c.start_period;
      const periodCount = c.period_count || 5; // Mặc định 4 tiết nếu API không trả

      const time_period = Array.from(
        { length: periodCount },
        (_, i) => startPeriod + i
      ).filter(p => p >= 1 && p <= 10); // Chỉ lấy tiết hợp lệ

      return {
        id: c.id,
        start_date: c.start_date,
        end_date: c.end_date,
        weekday: convertWeekday(c.weekday),
        subject: {
          code: c.subject?.code || "N/A",
          name: c.subject?.name || "Chưa có tên",
          credit: c.subject?.credit || 0,
        },
        class_st: c.class_st?.name || "Chưa cập nhật",
        room: c.room?.code || "Chưa cập nhật",
        time_period, // Danh sách tiết liên tục
      };
    }).filter(c => c.weekday !== null && c.time_period.length > 0);
  }, [courses]);

  // 🔹 Sinh danh sách tuần
  const weeks = useMemo(() => {
    if (!selectedSemester || !semesters?.length) return [];

    const selected = semesters.find(s => s.id.toString() === selectedSemester);
    if (!selected?.start_date || !selected?.end_date) return [];

    return generateAllWeeks(selected.start_date, selected.end_date);
  }, [selectedSemester, semesters]);

  // Chọn tuần đầu tiên
  useEffect(() => {
    if (weeks.length > 0 && !selectedWeek) {
      setSelectedWeek(weeks[0].value);
    }
  }, [weeks, selectedWeek]);

  const selectedWeekData = weeks.find(w => w.value === selectedWeek);

  // 🔹 Lọc course thuộc tuần hiện tại
  const filteredCourses = useMemo(() => {
    if (!selectedWeekData || !normalizedCourses.length) return [];

    const weekStart = dayjs(selectedWeekData.start);
    const weekEnd = dayjs(selectedWeekData.end);

    return normalizedCourses.filter(course => {
      if (!course.start_date || !course.end_date || course.weekday === null) return false;

      const courseStart = dayjs(course.start_date);
      const courseEnd = dayjs(course.end_date);

      // Course phải có ít nhất 1 ngày trùng với tuần
      return courseStart.isBefore(weekEnd.add(1, 'day')) && courseEnd.isAfter(weekStart);
    });
  }, [normalizedCourses, selectedWeekData]);

  // 🔹 Tạo map course theo (weekday-period)
  const courseMap = useMemo(() => {
    const map = new Map();
    filteredCourses.forEach(course => {
      course.time_period.forEach(period => {
        const key = `${course.weekday}-${period}`;
        map.set(key, { ...course, isFirst: period === course.time_period[0] });
      });
    });
    return map;
  }, [filteredCourses]);

  // 🔹 Xác định cell bị merge (không render)
  const mergedCells = useMemo(() => {
    const set = new Set();
    filteredCourses.forEach(course => {
      if (course.time_period.length > 1) {
        for (let i = 1; i < course.time_period.length; i++) {
          set.add(`${course.weekday}-${course.time_period[i]}`);
        }
      }
    });
    return set;
  }, [filteredCourses]);

  const getCourseForCell = (day, period) => courseMap.get(`${day}-${period}`);

  const handlePreviousWeek = () => {
    const idx = weeks.findIndex(w => w.value === selectedWeek);
    if (idx > 0) setSelectedWeek(weeks[idx - 1].value);
  };

  const handleNextWeek = () => {
    const idx = weeks.findIndex(w => w.value === selectedWeek);
    if (idx < weeks.length - 1) setSelectedWeek(weeks[idx + 1].value);
  };

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "#1890ff",
        color: "white",
        padding: "16px",
        borderRadius: "8px 8px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MdCalendarToday size={24} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            THỜI KHÓA BIỂU DẠNG TUẦN
          </h1>
        </div>
        <Button type="text" icon={<MdFullscreen size={20} />} style={{ color: "white" }} />
      </div>

      {/* Bộ lọc */}
      <div style={{
        background: "white",
        border: "1px solid #d9d9d9",
        borderTop: "none",
        padding: 16,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}>
          <Select
            placeholder="Chọn học kỳ"
            value={selectedSemester}
            onChange={setSelectedSemester}
            style={{ width: "100%" }}
            options={semesters?.map(item => ({
              value: item.id.toString(),
              label: `${item.semesters} - Năm học ${item.year}`,
            })) || []}
          />

          <Select
            placeholder="Chọn tuần"
            value={selectedWeek}
            onChange={setSelectedWeek}
            style={{ width: "100%" }}
            options={weeks}
          />
        </div>
      </div>

      {/* Bảng TKB */}
      <div style={{
        background: "white",
        border: "1px solid #d9d9d9",
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1890ff", color: "white" }}>
                <th style={{
                  border: "1px solid #40a9ff",
                  padding: 8,
                  width: 100,
                  position: "sticky",
                  left: 0,
                  background: "#1890ff",
                  zIndex: 10,
                }}>
                  <div onClick={handlePreviousWeek} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 4,
                  }}>
                    <MdChevronLeft size={20} />
                    <span style={{ fontSize: 14 }}>Trước</span>
                  </div>
                </th>

                {DAYS.map(day => (
                  <th key={day.key} style={{
                    border: "1px solid #40a9ff",
                    padding: 12,
                    minWidth: 140,
                  }}>
                    {day.label}
                  </th>
                ))}

                <th style={{
                  border: "1px solid #40a9ff",
                  padding: 8,
                  width: 100,
                  position: "sticky",
                  right: 0,
                  background: "#1890ff",
                  zIndex: 10,
                }}>
                  <div onClick={handleNextWeek} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 4,
                  }}>
                    <span style={{ fontSize: 14 }}>Sau</span>
                    <MdChevronRight size={20} />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  {/* Cột tiết trái */}
                  <td style={{
                    border: "1px solid #d9d9d9",
                    padding: 8,
                    textAlign: "center",
                    fontWeight: 500,
                    background: "#1890ff",
                    color: "white",
                    position: "sticky",
                    left: 0,
                    zIndex: 9,
                  }}>
                    Tiết {period}
                  </td>

                  {/* Các ngày */}
                  {DAYS.map(day => {
                    const cellKey = `${day.key}-${period}`;
                    if (mergedCells.has(cellKey)) return null;

                    const cellData = getCourseForCell(day.key, period);
                    const isFirstPeriod = cellData?.isFirst;

                    return (
                      <td
                        key={cellKey}
                        rowSpan={isFirstPeriod ? cellData.time_period.length : 1}
                        style={{
                          border: "1px solid #d9d9d9",
                          verticalAlign: "top",
                          minHeight: 80,
                        }}
                      >
                        {isFirstPeriod && (
                          <div style={{
                            background: "#e6f7ff",
                            margin: 4,
                            padding: 8,
                            borderRadius: 6,
                            height: "195px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                          }}>
                            <div style={{
                              fontWeight: 600,
                              color: "#003a8c",
                              marginBottom: 6,
                              fontSize: 14,
                            }}>
                              {cellData.subject.name}
                            </div>
                            <div style={{ color: "#595959", fontSize: 12, lineHeight: 1.4 }}>
                              <div><strong>Mã:</strong> {cellData.subject.code}</div>
                              <div><strong>Phòng:</strong> {cellData.room}</div>
                              <div><strong>Lớp:</strong> {cellData.class_st}</div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Cột tiết phải */}
                  <td style={{
                    border: "1px solid #d9d9d9",
                    padding: 8,
                    textAlign: "center",
                    fontWeight: 500,
                    background: "#1890ff",
                    color: "white",
                    position: "sticky",
                    right: 0,
                    zIndex: 9,
                  }}>
                    Tiết {period}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug (xóa khi ổn định) */}
      {/* {process.env.NODE_ENV === "development" && (
        <details style={{ marginTop: 20, padding: 10, background: "#f5f5f5" }}>
          <summary>Debug Info (Dev only)</summary>
          <pre>{JSON.stringify({ filteredCourses, selectedWeekData }, null, 2)}</pre>
        </details>
      )} */}
    </div>
  );
}