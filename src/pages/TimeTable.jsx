"use client"

import { useState, useMemo } from "react"
import { Select, Button } from "antd"
import { MdChevronLeft, MdChevronRight, MdPrint, MdCalendarToday, MdFullscreen } from "react-icons/md"
import dayjs from "dayjs"

const sampleCourses = [
  {
    id: 1,
    semester: { id: 1, semesters: "Học kỳ 1" },
    subject: { id: 1, code: "CS101", name: "Lập trình cơ bản", credits: 3 },
    teacher: { id: 1, teacher_code: "GV01", degree: "TS", name: "Nguyễn Văn A" },
    class_st: { id: 1, name: "D20PM01" },
    room: { id: 1, room_code: "A101" },
    max_capacity: 50,
    start_date: "2025-10-13",
    end_date: "2025-12-20",
    weekday: 2,
    time_period: [1, 2, 3],
    updated_at: "2025-10-11T02:31:24Z",
    created_at: "2025-10-11T02:31:24Z",
    is_deleted: false,
  },
  {
    id: 2,
    semester: { id: 1, semesters: "Học kỳ 1" },
    subject: { id: 2, code: "CS102", name: "Cấu trúc dữ liệu", credits: 3 },
    teacher: { id: 2, teacher_code: "GV02", degree: "ThS", name: "Trần Thị B" },
    class_st: { id: 1, name: "D20PM01" },
    room: { id: 2, room_code: "B205" },
    max_capacity: 45,
    start_date: "2025-10-13",
    end_date: "2025-12-20",
    weekday: 4,
    time_period: [4, 5, 6],
    updated_at: "2025-10-11T02:31:24Z",
    created_at: "2025-10-11T02:31:24Z",
    is_deleted: false,
  },
  {
    id: 3,
    semester: { id: 2, semesters: "Học kỳ 2" },
    subject: { id: 4, code: "CS121", name: "Introduction to Programming", credits: 2 },
    teacher: { id: 6, teacher_code: "GV21", degree: "PHP", name: "Kien Doan" },
    class_st: { id: 2, name: "D20PM" },
    room: { id: 2, room_code: "A25" },
    max_capacity: 55,
    start_date: "2026-01-15",
    end_date: "2026-04-20",
    weekday: 5,
    time_period: [7, 8, 9],
    updated_at: "2025-10-11T02:31:24Z",
    created_at: "2025-10-11T02:31:24Z",
    is_deleted: false,
  },
]

const SEMESTER_CONFIG = {
  1: {
    name: "Học kỳ 1",
    startDate: "2025-08-01",
    endDate: "2025-12-31",
  },
  2: {
    name: "Học kỳ 2",
    startDate: "2026-01-01",
    endDate: "2026-04-30",
  },
  3: {
    name: "Học kỳ 3",
    startDate: "2026-05-01",
    endDate: "2026-07-31",
  },
}

const ACADEMIC_YEAR_START = "2025-08-01"
const ACADEMIC_YEAR_END = "2026-07-31"

function generateAllWeeks() {
  const weeks = []
  let start = dayjs(ACADEMIC_YEAR_START)
  const end = dayjs(ACADEMIC_YEAR_END)
  let weekNumber = 1

  while (start.isBefore(end) || start.isSame(end, "day")) {
    const weekEnd = start.add(6, "day")
    const actualEnd = weekEnd.isAfter(end) ? end : weekEnd

    weeks.push({
      value: weekNumber.toString(),
      label: `Tuần ${weekNumber} [từ ngày ${start.format("DD/MM/YYYY")} đến ngày ${actualEnd.format("DD/MM/YYYY")}]`,
      start: start.format("YYYY-MM-DD"),
      end: actualEnd.format("YYYY-MM-DD"),
      weekNumber: weekNumber,
    })

    start = actualEnd.add(1, "day")
    weekNumber++
  }

  return weeks
}

const ALL_WEEKS = generateAllWeeks()

const DAYS = [
  { key: 2, label: "Thứ 2" },
  { key: 3, label: "Thứ 3" },
  { key: 4, label: "Thứ 4" },
  { key: 5, label: "Thứ 5" },
  { key: 6, label: "Thứ 6" },
  { key: 7, label: "Thứ 7" },
  { key: 1, label: "Chủ Nhật" },
]

const PERIODS = Array.from({ length: 14 }, (_, i) => i + 1)

export default function TimeTable() {
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [selectedView, setSelectedView] = useState("personal")
  const [selectedWeek, setSelectedWeek] = useState("1")

  const weeks = useMemo(() => {
    const config = SEMESTER_CONFIG[selectedSemester]
    const semesterStart = dayjs(config.startDate)
    const semesterEnd = dayjs(config.endDate)

    return ALL_WEEKS.filter((week) => {
      const weekStart = dayjs(week.start)
      const weekEnd = dayjs(week.end)

      return (
        (weekStart.isAfter(semesterStart) || weekStart.isSame(semesterStart, "day")) &&
        (weekEnd.isBefore(semesterEnd) || weekEnd.isSame(semesterEnd, "day"))
      )
    })
  }, [selectedSemester])

  useMemo(() => {
    if (weeks.length > 0) {
      setSelectedWeek(weeks[0].value)
    }
  }, [selectedSemester, weeks])

  const selectedWeekData = weeks.find((w) => w.value === selectedWeek) || weeks[0]

  const filteredCourses = sampleCourses.filter((course) => {
    if (course.semester.id.toString() !== selectedSemester) return false

    if (course.start_date && course.end_date && selectedWeekData) {
      const courseStart = dayjs(course.start_date)
      const courseEnd = dayjs(course.end_date)
      const weekStart = dayjs(selectedWeekData.start)
      const weekEnd = dayjs(selectedWeekData.end)

      return courseEnd.isAfter(weekStart) && courseStart.isBefore(weekEnd)
    }

    return true
  })

  const courseMap = new Map()
  filteredCourses.forEach((course) => {
    if (course.weekday && course.time_period) {
      course.time_period.forEach((period) => {
        const key = `${course.weekday}-${period}`
        courseMap.set(key, course)
      })
    }
  })

  const getCourseForCell = (day, period) => {
    return courseMap.get(`${day}-${period}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePreviousWeek = () => {
    const currentIndex = weeks.findIndex((w) => w.value === selectedWeek)
    if (currentIndex > 0) {
      setSelectedWeek(weeks[currentIndex - 1].value)
    }
  }

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex((w) => w.value === selectedWeek)
    if (currentIndex < weeks.length - 1) {
      setSelectedWeek(weeks[currentIndex + 1].value)
    }
  }

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>THỜI KHÓA BIỂU DẠNG TUẦN</h1>
        </div>
        <Button type="text" icon={<MdFullscreen size={20} />} style={{ color: "white" }} />
      </div>

      <div style={{ background: "white", border: "1px solid #d9d9d9", borderTop: "none", padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Select
            value={selectedSemester}
            onChange={setSelectedSemester}
            style={{ width: "100%" }}
            options={[
              { value: "1", label: "Học kỳ 1 - Năm học 2025 - 2026" },
              { value: "2", label: "Học kỳ 2 - Năm học 2025 - 2026" },
              { value: "3", label: "Học kỳ 3 - Năm học 2025 - 2026" },
            ]}
          />

          <Select
            value={selectedView}
            onChange={setSelectedView}
            style={{ width: "100%" }}
            options={[
              { value: "personal", label: "Thời khóa biểu cá nhân" },
              { value: "class", label: "Thời khóa biểu lớp" },
            ]}
          />

          <Select value={selectedWeek} onChange={setSelectedWeek} style={{ width: "100%" }} options={weeks} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" icon={<MdPrint />} onClick={handlePrint}>
            In
          </Button>
        </div>
      </div>

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
                  <th key={day.key} style={{ border: "1px solid #40a9ff", padding: 12, minWidth: 140 }}>
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
                  {DAYS.map((day) => {
                    const course = getCourseForCell(day.key, period)
                    const isFirstPeriod = course && course.time_period && course.time_period[0] === period

                    return (
                      <td
                        key={`${day.key}-${period}`}
                        style={{ border: "1px solid #d9d9d9", padding: 4, minHeight: 60, verticalAlign: "top" }}
                      >
                        {course && isFirstPeriod && (
                          <div
                            style={{
                              background: "#e6f7ff",
                              borderLeft: "4px solid #1890ff",
                              padding: 8,
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          >
                            <div style={{ fontWeight: 600, color: "#003a8c", marginBottom: 4 }}>
                              {course.subject.name}
                            </div>
                            <div style={{ color: "#595959" }}>
                              <div>Mã: {course.subject.code}</div>
                              <div>
                                GV: {course.teacher.degree}. {course.teacher.name}
                              </div>
                              <div>Phòng: {course.room.room_code}</div>
                              <div>Lớp: {course.class_st.name}</div>
                              <div style={{ color: "#1890ff", fontWeight: 500 }}>
                                Tiết: {course.time_period?.join(", ")}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
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
            <tfoot>
              <tr style={{ background: "#1890ff", color: "white" }}>
                <td
                  style={{
                    border: "1px solid #40a9ff",
                    padding: 8,
                    textAlign: "center",
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
                </td>
                {DAYS.map((day) => (
                  <td key={day.key} style={{ border: "1px solid #40a9ff", padding: 12, textAlign: "center" }}>
                    {day.label}
                  </td>
                ))}
                <td
                  style={{
                    border: "1px solid #40a9ff",
                    padding: 8,
                    textAlign: "center",
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
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
