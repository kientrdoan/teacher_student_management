"use client"

import React, { useEffect, useState } from "react"
import { Table, Avatar } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getAllCourseByCourseId } from "../redux/actions/CourseAction"
import { getAttendByCourseId } from "../redux/actions/AttendAction"
import { getAllStudentAction } from "../redux/actions/StudentAction"

// Map weekday string sang số tương ứng với dayjs
const weekdayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

// Hàm tạo danh sách ngày học theo weekday
function getLessonDates(startDate, endDate, weekday) {
  const dates = []
  let current = dayjs(startDate)
  while (current.isBefore(dayjs(endDate)) || current.isSame(dayjs(endDate), "day")) {
    if (current.day() === weekday) {
      dates.push(current.format("DD/MM/YYYY"))
    }
    current = current.add(1, "day")
  }
  return dates
}

export default function Attendance() {
  const { id: course_id } = useParams()
  const dispatch = useDispatch()

  const course_detail = useSelector((state) => state.CourseReducer.course_detail)
  const students = useSelector((state) => state.StudentReducer.students)
  const attends = useSelector((state) => state.AttendReducer.attends)

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [weekday, setWeekday] = useState(null)

  // Gọi API khi mount
  useEffect(() => {
    if (course_id) {
      dispatch(getAllCourseByCourseId(course_id))
      dispatch(getAllStudentAction(course_id))
      dispatch(getAttendByCourseId(course_id))
    }
  }, [course_id, dispatch])

  // Set start/end date và weekday khi course_detail thay đổi
  useEffect(() => {
    if (course_detail) {
      setStartDate(course_detail.start_date)
      setEndDate(course_detail.end_date)
      // Chuyển weekday string sang số
      setWeekday(weekdayMap[course_detail.weekday])
    }
  }, [course_detail])

  // Tạo danh sách ngày học
  const lessonDates = startDate && endDate && weekday !== null ? getLessonDates(startDate, endDate, weekday) : []

  // Chuẩn bị dữ liệu table
  const data = students && students.length > 0
    ? students.map((s) => {
        const fullName = s.user
          ? `${s.user.last_name} ${s.user.first_name}`
          : s.student_code

        const record = {
          id: s.id || s.student_code,
          studentCode: s.student_code,
          name: fullName,
          avatar: s.user?.url || null,
        }

        lessonDates.forEach((date) => {
          const lessonDay = dayjs(date, "DD/MM/YYYY")
          const today = dayjs()

          if (lessonDay.isAfter(today, "day")) {
            record[date] = "-"
          } else {
            const att = attends.find((a) => a.student_code === s.student_code)
            const attendForDate = att?.attends?.find(
              (item) => dayjs(item.time_slot__date).format("DD/MM/YYYY") === date
            )
            record[date] = attendForDate ? true : false
          }
        })

        return record
      })
    : []

  const columns = [
    {
      title: "Student ID",
      dataIndex: "studentCode",
      key: "studentCode",
      fixed: "left",
      width: 120,
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {/* {record.avatar && <Avatar size={24} src={record.avatar} />} */}
          <span>{record.name}</span>
        </div>
      ),
    },
    ...lessonDates.map((date) => ({
      title: date,
      dataIndex: date,
      key: date,
      width: 120,
      render: (status) => {
        if (status === "-") return "-"
        return status
          ? <CheckCircleOutlined style={{ color: "green", fontSize: 16 }} />
          : <CloseCircleOutlined style={{ color: "red", fontSize: 16 }} />
      },
    })),
  ]

  if (!startDate || !endDate || weekday === null) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Attendance Table ({dayjs(startDate).format("DD/MM")} - {dayjs(endDate).format("DD/MM")})
      </h2>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        bordered
        scroll={{ x: "max-content" }}
      />
    </div>
  )
}
