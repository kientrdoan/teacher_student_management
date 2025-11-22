import React, { useEffect, useState } from "react";
import { message, Table } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getAllCourseByCourseId } from "../redux/actions/CourseAction";
import {
  AttendAction,
  getAttendByCourseId,
} from "../redux/actions/AttendAction";
import { getAllStudentAction } from "../redux/actions/StudentAction";
import { getAllLessonAction } from "../redux/actions/LessonAction";

export default function Attendance() {
  const { id: course_id } = useParams();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const students = useSelector((state) => state.StudentReducer.students);
  const reduxAttends = useSelector((state) => state.AttendReducer.attends);
  const lessons = useSelector((state) => state.LessonReducer.lessons);

  // Local state để quản lý attend tạm thời
  const [attends, setAttends] = useState([]);

  useEffect(() => {
    if (course_id) {
      dispatch(getAllCourseByCourseId(course_id));
      dispatch(getAllStudentAction(course_id));
      dispatch(getAttendByCourseId(course_id));
      dispatch(getAllLessonAction(course_id));
    }
  }, [course_id, dispatch]);

  // Sync Redux attend → local state
  useEffect(() => {
    setAttends(reduxAttends || []);
  }, [reduxAttends]);

  // Convert lessons → list date string
  const lessonDates =
    lessons?.map((l) => dayjs(l.date).format("DD/MM/YYYY")) || [];

  // Map date → lessonId
  const lessonMap =
    lessons?.reduce((acc, l) => {
      const formatted = dayjs(l.date).format("DD/MM/YYYY");
      acc[formatted] = l.id;
      return acc;
    }, {}) || {};

  // Handle điểm danh
  const handleAttend = async (studentId, lessonId, file) => {
    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("course_id", course_id);
    formData.append("time_slot_id", lessonId);
    formData.append("image", file);

    const res = await dispatch(AttendAction(formData));
    console.log("res", res);
    // console.log(res)

    if (res.success) {
      dispatch(getAttendByCourseId(course_id));
    }
    else{
      messageApi.error("Dữ liệu không hợp lệ")
    }
  };

  // Build table data
  const data =
    students?.map((s) => {
      const fullName = s.user ? `${s.user.last_name} ${s.user.first_name}` : "";
      const studentId = s.student_id || s.id;

      const record = {
        id: studentId,
        studentId,
        name: fullName,
      };

      lessonDates.forEach((date) => {
        const lessonDay = dayjs(date, "DD/MM/YYYY");
        const today = dayjs();

        if (lessonDay.isAfter(today, "day")) {
          record[date] = "-";
        } else {
          const att = attends.find((a) => a.id === studentId);
          console.log("att", attends);
          const attendForDate = att?.attends?.find(
            (item) => dayjs(item.time_slot__date).format("DD/MM/YYYY") === date
          );
          record[date] = attendForDate ? attendForDate.status : 'Absent';
        }
      });

      return record;
    }) || [];

  // Columns
  const columns = [
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
      fixed: "left",
      width: 140,
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
      width: 130,
      render: (status, record) => {
        const today = dayjs().format("DD/MM/YYYY");

        // Hôm nay + chưa điểm danh → hiện nút
        if (date === today && (status === null || status === "-")) {
          return (
            <>
              <input
                type='file'
                accept='image/*'
                id={`upload-${record.studentId}-${date}`}
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleAttend(record.studentId, lessonMap[date], file);
                  }
                }}
              />

              <button
                className='px-2 py-1 bg-blue-500 text-white rounded'
                onClick={() =>
                  document
                    .getElementById(`upload-${record.studentId}-${date}`)
                    .click()
                }
              >
                Điểm danh
              </button>
            </>
          );
        }

        if (status === "-") return "-";

        return status === 'Present' ? (
          <CheckCircleOutlined
            style={{ color: "green", fontSize: 16 }}
            onClick={() =>
              handleAttend(record.studentId, lessonMap[date], false)
            }
          />
        ) : (
          <CloseCircleOutlined style={{ color: "red", fontSize: 16 }} />
        );
      },
    })),
  ];

  return (
    <div className='p-4'>
      {contextHolder}
      <Table
        dataSource={data}
        columns={columns}
        rowKey='id'
        bordered
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
