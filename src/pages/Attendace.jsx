"use client"

import React, { useMemo } from "react"
import { Table, Tag } from "antd"
import dayjs from "dayjs"

const students = [
  { id: 1, name: "Nguyen Van A", studentCode: "SV001" },
  { id: 2, name: "Tran Thi B", studentCode: "SV002" },
  { id: 3, name: "Le Van C", studentCode: "SV003" },
]

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

export default function Attendace() {
  const startDate = "2025-11-04"
  const endDate = "2025-12-16"
  const weekday = 2

  const lessonDates = useMemo(() => getLessonDates(startDate, endDate, weekday), [])

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
    },
    ...lessonDates.map((date) => ({
      title: date,
      dataIndex: date,
      key: date,
      width: 120,
      render: (status) =>
        status ? (
          <Tag color="green">Present</Tag>
        ) : status === false ? (
          <Tag color="red">Absent</Tag>
        ) : (
          "-"
        ),
    })),
  ]

  // Tạo dữ liệu mẫu (trống, chưa điểm danh)
  const data = students.map((s) => {
    const record = { ...s }
    lessonDates.forEach((d) => {
      record[d] = null // chưa có dữ liệu
    })
    return record
  })

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
