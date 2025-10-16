"use client";

import { useState, useMemo, useEffect } from "react";
import { Select, Button } from "antd";
import {
  MdChevronLeft,
  MdChevronRight,
  MdPrint,
  MdCalendarToday,
  MdFullscreen,
} from "react-icons/md";
import dayjs from "dayjs";
import { getAllCourseByTeacherAndSemesterAction } from "../redux/actions/CourseAction";
import { useDispatch, useSelector } from "react-redux";

const SEMESTER_CONFIG = {
  3: {
    name: "Học kỳ 1",
    startDate: "2025-08-01",
    endDate: "2025-12-31",
  },
  4: {
    name: "Học kỳ 2",
    startDate: "2026-01-01",
    endDate: "2026-04-30",
  },
  5: {
    name: "Học kỳ 3",
    startDate: "2026-05-01",
    endDate: "2026-07-31",
  },
};

const ACADEMIC_YEAR_START = "2025-08-01";
const ACADEMIC_YEAR_END = "2026-07-31";

function generateAllWeeks() {
  const weeks = [];
  let start = dayjs(ACADEMIC_YEAR_START);
  const end = dayjs(ACADEMIC_YEAR_END);
  let weekNumber = 1;

  while (start.isBefore(end) || start.isSame(end, "day")) {
    const weekEnd = start.add(6, "day");
    const actualEnd = weekEnd.isAfter(end) ? end : weekEnd;

    weeks.push({
      value: weekNumber.toString(),
      label: `Tuần ${weekNumber} [từ ngày ${start.format(
        "DD/MM/YYYY"
      )} đến ngày ${actualEnd.format("DD/MM/YYYY")}]`,
      start: start.format("YYYY-MM-DD"),
      end: actualEnd.format("YYYY-MM-DD"),
      weekNumber: weekNumber,
    });

    start = actualEnd.add(1, "day");
    weekNumber++;
  }

  return weeks;
}

const ALL_WEEKS = generateAllWeeks();

const DAYS = [
  { key: 2, label: "Thứ 2" },
  { key: 3, label: "Thứ 3" },
  { key: 4, label: "Thứ 4" },
  { key: 5, label: "Thứ 5" },
  { key: 6, label: "Thứ 6" },
  { key: 7, label: "Thứ 7" },
  { key: 1, label: "Chủ Nhật" },
];

// ✨ FIX 1: Tạo đối tượng để chuyển đổi weekday từ string sang number
const WEEKDAY_MAP = {
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
  Sunday: 1,
};

// ✨ FIX 3: Định nghĩa thời lượng mặc định (nên yêu cầu backend trả về end_period)
const DEFAULT_COURSE_DURATION_IN_PERIODS = 5;


const PERIODS = Array.from({ length: 14 }, (_, i) => i + 1);

export default function TimeTable() {
  const user = useSelector((state) => state.UserReducer.user);
  const courses = useSelector((state) => state.CourseReducer.courses);
  const dispatch = useDispatch();
  const [selectedSemester, setSelectedSemester] = useState("3");
  const [selectedWeek, setSelectedWeek] = useState("1");

  console.log(courses)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.user_id) {
        return;
      }
      // ✨ FIX: Fetch data theo học kỳ đã chọn
      await dispatch(
        getAllCourseByTeacherAndSemesterAction(user.user_id, 3)
      );
    };
    fetchData();
  }, [dispatch, user, selectedSemester]);

  const weeks = useMemo(() => {
    const config = SEMESTER_CONFIG[selectedSemester];
    if (!config) return [];
    const semesterStart = dayjs(config.startDate);
    const semesterEnd = dayjs(config.endDate);

    return ALL_WEEKS.filter((week) => {
      const weekStart = dayjs(week.start);
      const weekEnd = dayjs(week.end);
      return (
        (weekStart.isAfter(semesterStart) || weekStart.isSame(semesterStart, "day")) &&
        (weekEnd.isBefore(semesterEnd) || weekEnd.isSame(semesterEnd, "day"))
      );
    });
  }, [selectedSemester]);

  useEffect(() => {
    if (weeks.length > 0 && !weeks.find(w => w.value === selectedWeek)) {
      setSelectedWeek(weeks[0].value);
    }
  }, [weeks, selectedWeek]);

  const selectedWeekData =
    weeks.find((w) => w.value === selectedWeek) || weeks[0];

  const filteredCourses = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    return courses.filter((course) => {
      if (course.semester.id.toString() !== selectedSemester) return false;

      if (course.start_date && course.end_date && selectedWeekData) {
        const courseStart = dayjs(course.start_date);
        const courseEnd = dayjs(course.end_date);
        const weekStart = dayjs(selectedWeekData.start);
        const weekEnd = dayjs(selectedWeekData.end);
        return courseEnd.isAfter(weekStart) && courseStart.isBefore(weekEnd);
      }
      return true;
    });
  }, [courses, selectedSemester, selectedWeekData]);

  const courseMap = useMemo(() => {
    const map = new Map();
    filteredCourses.forEach((course) => {
      // ✨ FIX 2: Chuyển đổi weekday và sử dụng end_period (hoặc giá trị mặc định)
      const numericWeekday = WEEKDAY_MAP[course.weekday];
      const startPeriod = course.start_period;
      // Ưu tiên dùng end_period từ API, nếu không có thì dùng giá trị mặc định
      const endPeriod = course.end_period || (startPeriod + DEFAULT_COURSE_DURATION_IN_PERIODS - 1);
      
      if (numericWeekday && startPeriod) {
        for (let period = startPeriod; period <= endPeriod; period++) {
          const key = `${numericWeekday}-${period}`; // Key bây giờ là "2-1", "2-2", ...
          map.set(key, course);
        }
      }
    });
    return map;
  }, [filteredCourses]);

  const getCourseForCell = (dayKey, period) => {
    return courseMap.get(`${dayKey}-${period}`);
  };

  const handlePrint = () => { window.print(); };

  const handlePreviousWeek = () => {
    const currentIndex = weeks.findIndex((w) => w.value === selectedWeek);
    if (currentIndex > 0) {
      setSelectedWeek(weeks[currentIndex - 1].value);
    }
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex((w) => w.value === selectedWeek);
    if (currentIndex < weeks.length - 1) {
      setSelectedWeek(weeks[currentIndex + 1].value);
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "#1890ff", color: "white", padding: "16px", borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MdCalendarToday size={24} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            THỜI KHÓA BIỂU DẠNG TUẦN
          </h1>
        </div>
        <Button type="text" icon={<MdFullscreen size={20} />} style={{ color: "white" }} />
      </div>

      {/* Controls */}
      <div style={{ background: "white", border: "1px solid #d9d9d9", borderTop: "none", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 16 }}>
          <Select value={selectedSemester} onChange={setSelectedSemester} style={{ width: "100%" }} options={[
            { value: "1", label: "Học kỳ 1 - Năm học 2025 - 2026" },
            { value: "2", label: "Học kỳ 2 - Năm học 2025 - 2026" },
            { value: "3", label: "Học kỳ 3 - Năm học 2025 - 2026" },
          ]} />
          <Select value={selectedWeek} onChange={setSelectedWeek} style={{ width: "100%" }} options={weeks} notFoundContent={<div>Không có tuần nào</div>} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" icon={<MdPrint />} onClick={handlePrint}>In</Button>
        </div>
      </div>

      {/* Timetable */}
      <div style={{ background: "white", border: "1px solid #d9d9d9", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1890ff", color: "white" }}>
                <th style={{ border: "1px solid #40a9ff", padding: 8, width: 100, position: "sticky", left: 0, background: "#1890ff", zIndex: 10 }}>
                  <div onClick={handlePreviousWeek} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: 4, borderRadius: 4 }}>
                    <MdChevronLeft size={20} />
                    <span style={{ fontSize: 14 }}>Trước</span>
                  </div>
                </th>
                {DAYS.map((day) => (<th key={day.key} style={{ border: "1px solid #40a9ff", padding: 12, minWidth: 140 }}>{day.label}</th>))}
                <th style={{ border: "1px solid #40a9ff", padding: 8, width: 100, position: "sticky", right: 0, background: "#1890ff", zIndex: 10 }}>
                  <div onClick={handleNextWeek} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: 4, borderRadius: 4 }}>
                    <span style={{ fontSize: 14 }}>Sau</span>
                    <MdChevronRight size={20} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td style={{ border: "1px solid #d9d9d9", padding: 8, textAlign: "center", fontWeight: 500, background: "#f0f2f5", color: "#333", position: "sticky", left: 0, zIndex: 9, }}>
                    Tiết {period}
                  </td>
                  {DAYS.map((day) => {
                    const course = getCourseForCell(day.key, period);
                    const isFirstPeriod = course && course.start_period === period;
                    const endPeriod = course ? (course.end_period || (course.start_period + DEFAULT_COURSE_DURATION_IN_PERIODS - 1)) : 0;
                    const courseDuration = course ? endPeriod - course.start_period + 1 : 0;

                    if (course && !isFirstPeriod) {
                      return null;
                    }

                    return (
                      <td key={`${day.key}-${period}`} rowSpan={isFirstPeriod ? courseDuration : 1} style={{ border: "1px solid #d9d9d9", padding: 4, minHeight: 60, verticalAlign: "top" }}>
                        {isFirstPeriod && (
                          <div style={{ background: "#e6f7ff", borderLeft: "4px solid #1890ff", padding: 8, borderRadius: 4, fontSize: 12, height: '100%' }}>
                            <div style={{ fontWeight: 600, color: "#003a8c", marginBottom: 4 }} >{course.subject.name}</div>
                            <div style={{ color: "#595959" }}>
                              <div>Mã: {course.subject.code}</div>
                              {/* <div>GV: {course.teacher.degree}. {course.teacher.name}</div> */}
                              <div>Phòng: {course.room.code}</div>
                              <div>Lớp: {course.class_st.name}</div>
                              <div style={{ color: "#1890ff", fontWeight: 500 }} >
                                Tiết: {course.start_period} - {endPeriod}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ border: "1px solid #d9d9d9", padding: 8, textAlign: "center", fontWeight: 500, background: "#f0f2f5", color: "#333", position: "sticky", right: 0, zIndex: 9 }}>
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