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
import { getAllSemeterAction } from "../redux/actions/SemesterAction";
import { getAllCourseByTeacherAndSemesterAction } from "../redux/actions/CourseAction";

// 🔹 Hàm sinh tuần dựa vào ngày bắt đầu & kết thúc
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
      label: `Tuần ${weekNumber} [${start.format(
        "DD/MM/YYYY"
      )} - ${actualEnd.format("DD/MM/YYYY")}]`,
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
  { key: 2, label: "Thứ 2" },
  { key: 3, label: "Thứ 3" },
  { key: 4, label: "Thứ 4" },
  { key: 5, label: "Thứ 5" },
  { key: 6, label: "Thứ 6" },
  { key: 7, label: "Thứ 7" },
  { key: 1, label: "Chủ Nhật" },
];

const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);

function convertWeekday(weekday) {
  const map = {
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
    Sunday: 1,
  };
  return map[weekday] || null;
}

export default function TimeTable() {
  const dispatch = useDispatch();

  const semesters = useSelector((state) => state.SemesterReducer.semesters);
  const courses = useSelector((state) => state.CourseReducer.courses);
  const user = useSelector((state) => state.UserReducer.user);

  console.log("course page", courses)

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // 🔹 Lấy danh sách học kỳ
  useEffect(() => {
    dispatch(getAllSemeterAction());
  }, [dispatch]);

  // 🔹 Set học kỳ đầu tiên mặc định
  useEffect(() => {
    if (semesters?.length > 0 && !selectedSemester) {
      setSelectedSemester(semesters[0].id.toString());
    }
  }, [semesters, selectedSemester]);

  // 🔹 Lấy danh sách môn học theo học kỳ
  useEffect(() => {
    if (selectedSemester && user?.user_id) {
      dispatch(
        getAllCourseByTeacherAndSemesterAction(user.user_id, selectedSemester)
      );
    }
  }, [dispatch, user.user_id, selectedSemester]);

  // 🔹 Chuẩn hóa dữ liệu course trả về từ API
  const normalizedCourses = useMemo(() => {
    return (courses || []).map((c) => {


      return {
        id: c.id,
        start_date: c.start_date,
        end_date: c.end_date,
        weekday: convertWeekday(c.weekday),
        subject: {
          code: c.subject?.code,
          name: c.subject?.name,
          credit: c.subject?.credit,
        },
        class_st: c.class_st?.name || "Chưa cập nhật",
        // teacher: c.teacher || { name: "Chưa cập nhật", degree: "" },
        room: c.room?.code || "Chưa cập nhật",
        time_period: c.start_period
          ? [
              c.start_period,
              c.start_period + 1,
              c.start_period + 2,
              c.start_period + 3,
            ]
          : [],
      };
    });
  }, [courses]);

  // 🔹 Sinh danh sách tuần dựa vào học kỳ
  const weeks = useMemo(() => {
    if (!selectedSemester || semesters.length === 0) return [];

    const selected = semesters.find(
      (s) => s.id.toString() === selectedSemester
    );
    if (!selected || !selected.start_date || !selected.end_date) return [];

    return generateAllWeeks(selected.start_date, selected.end_date);
  }, [selectedSemester, semesters]);

  // 🔹 Set tuần đầu tiên mặc định
  useEffect(() => {
    if (weeks.length > 0 && !selectedWeek) {
      setSelectedWeek(weeks[0].value);
    }
  }, [weeks, selectedWeek]);

  const selectedWeekData = weeks.find((w) => w.value === selectedWeek);

  // 🔹 Lọc các course thuộc tuần đã chọn
  const filteredCourses = useMemo(() => {
    if (!selectedWeekData) return [];

    return normalizedCourses.filter((course) => {
      if (!course.start_date || !course.end_date) return false;

      const courseStart = dayjs(course.start_date);
      const courseEnd = dayjs(course.end_date);
      const weekStart = dayjs(selectedWeekData.start);
      const weekEnd = dayjs(selectedWeekData.end);

      return (
        courseEnd.isAfter(weekStart) &&
        courseStart.isBefore(weekEnd.add(1, "day"))
      );
    });
  }, [normalizedCourses, selectedWeekData]);

  // 🔹 Map truy cập course theo ngày - tiết
  const courseMap = useMemo(() => {
    const map = new Map();
    filteredCourses.forEach((course) => {
      if (course.weekday && course.time_period.length > 0) {
        course.time_period.forEach((period) => {
          const key = `${course.weekday}-${period}`;
          map.set(key, course);
        });
      }
    });
    return map;
  }, [filteredCourses]);

  // 🔹 Xác định cell cần merge
  const renderedCells = useMemo(() => {
    const set = new Set();
    filteredCourses.forEach((course) => {
      if (course.weekday && course.time_period.length > 1) {
        for (let i = 1; i < course.time_period.length; i++) {
          set.add(`${course.weekday}-${course.time_period[i]}`);
        }
      }
    });
    return set;
  }, [filteredCourses]);

  const getCourseForCell = (day, period) => courseMap.get(`${day}-${period}`);

  const handlePreviousWeek = () => {
    const currentIndex = weeks.findIndex((w) => w.value === selectedWeek);
    if (currentIndex > 0) setSelectedWeek(weeks[currentIndex - 1].value);
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex((w) => w.value === selectedWeek);
    if (currentIndex < weeks.length - 1)
      setSelectedWeek(weeks[currentIndex + 1].value);
  };

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: "#1890ff",
          color: "white",
          padding: "16px",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MdCalendarToday size={24} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            THỜI KHÓA BIỂU DẠNG TUẦN
          </h1>
        </div>
        <Button
          type="text"
          icon={<MdFullscreen size={20} />}
          style={{ color: "white" }}
        />
      </div>

      {/* Bộ lọc */}
      <div
        style={{
          background: "white",
          border: "1px solid #d9d9d9",
          borderTop: "none",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Select
            placeholder="Chọn học kỳ"
            value={selectedSemester}
            onChange={setSelectedSemester}
            style={{ width: "100%" }}
            options={
              semesters?.map((item) => ({
                value: item.id.toString(),
                label: `${item.semesters} - Năm học ${item.year}`,
              })) || []
            }
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
      <div
        style={{
          background: "white",
          border: "1px solid #d9d9d9",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1890ff", color: "white" }}>
                <th
                  style={{
                    border: "1px solid #40a9ff",
                    padding: 8,
                    width: 100,
                    position: "sticky",
                    left: 0,
                    background: "#1890ff",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={handlePreviousWeek}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <MdChevronLeft size={20} />
                    <span style={{ fontSize: 14 }}>Trước</span>
                  </div>
                </th>

                {DAYS.map((day) => (
                  <th
                    key={day.key}
                    style={{
                      border: "1px solid #40a9ff",
                      padding: 12,
                      minWidth: 140,
                    }}
                  >
                    {day.label}
                  </th>
                ))}

                <th
                  style={{
                    border: "1px solid #40a9ff",
                    padding: 8,
                    width: 100,
                    position: "sticky",
                    right: 0,
                    background: "#1890ff",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={handleNextWeek}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>Sau</span>
                    <MdChevronRight size={20} />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  {/* Cột tiết */}
                  <td
                    style={{
                      border: "1px solid #d9d9d9",
                      padding: 8,
                      textAlign: "center",
                      fontWeight: 500,
                      background: "#1890ff",
                      color: "white",
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                    }}
                  >
                    Tiết {period}
                  </td>

                  {/* Các cột thứ */}
                  {DAYS.map((day) => {
                    const cellKey = `${day.key}-${period}`;
                    if (renderedCells.has(cellKey)) return null;

                    const course = getCourseForCell(day.key, period);
                    const isFirstPeriod =
                      course && course.time_period[0] === period;
                    const rowSpan = isFirstPeriod
                      ? course.time_period.length
                      : 1;

                    return (
                      <td
                        key={cellKey}
                        rowSpan={rowSpan}
                        style={{
                          border: "1px solid #d9d9d9",
                          minHeight: 60 * 4,
                          verticalAlign: "top",
                        }}
                      >
                        {course && isFirstPeriod && (
                          <div
                            style={{
                              background: "#e6f7ff",
                              margin: 4,
                              padding: 6,
                              borderRadius: 6,
                              height: "100%",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#003a8c",
                                marginBottom: 4,
                              }}
                            >
                              {course.subject.name}
                            </div>
                            <div style={{ color: "#595959" }}>
                              <div>Mã: {course.subject.code}</div>
                              {/* <div>GV: {course.teacher.name}</div> */}
                              <div>Phòng: {course.room}</div>
                              <div>Lớp: {course.class_st}</div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Cột tiết bên phải */}
                  <td
                    style={{
                      border: "1px solid #d9d9d9",
                      padding: 8,
                      textAlign: "center",
                      fontWeight: 500,
                      background: "#1890ff",
                      color: "white",
                      position: "sticky",
                      right: 0,
                      zIndex: 10,
                    }}
                  >
                    Tiết {period}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
