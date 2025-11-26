import React, { useEffect, useState } from "react";
import { Card, Row, Table, Tag, message, Upload, Button, Modal } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
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

  const [openModal, setOpenModal] = useState(false);
  const [imageBase64, setImageBase64] = useState("");

  const students = useSelector((state) => state.StudentReducer.students);
  const reduxAttends = useSelector((state) => state.AttendReducer.attends);
  const lessons = useSelector((state) => state.LessonReducer.lessons);
  const course_detail = useSelector(
    (state) => state.CourseReducer.course_detail
  );

  const [attends, setAttends] = useState([]);

  useEffect(() => {
    if (course_id) {
      dispatch(getAllCourseByCourseId(course_id));
      dispatch(getAllStudentAction(course_id));
      dispatch(getAttendByCourseId(course_id));
      dispatch(getAllLessonAction(course_id));
    }
  }, [course_id, dispatch]);

  useEffect(() => {
    setAttends(reduxAttends || []);
  }, [reduxAttends]);

  const lessonDates =
    lessons?.map((l) => dayjs(l.date).format("DD/MM/YYYY")) || [];

  const lessonMap =
    lessons?.reduce((acc, l) => {
      const formatted = dayjs(l.date).format("DD/MM/YYYY");
      acc[formatted] = l.id;
      return acc;
    }, {}) || {};

  const handleAttend = async (lessonId, file) => {
    const formData = new FormData();
    formData.append("time_slot_id", lessonId);
    formData.append("threshold", 0.95);
    formData.append("image", file);

    const res = await dispatch(AttendAction(formData));

    if (res.success) {
      console.log(res.data);
      setImageBase64(res.data.visualized_image); // gán ảnh
      setOpenModal(true);
      dispatch(getAttendByCourseId(course_id));
      messageApi.success("Điểm danh thành công");
    } else {
      messageApi.error("Dữ liệu không hợp lệ");
    }
  };

  const data =
    students?.map((s) => {
      const fullName = s.user ? `${s.user.last_name} ${s.user.first_name}` : "";
      const studentId = s.student_id || s.id;

      const record = { id: studentId, studentId, name: fullName };

      lessonDates.forEach((date) => {
        const lessonDay = dayjs(date, "DD/MM/YYYY");
        const today = dayjs();

        if (lessonDay.isAfter(today, "day")) {
          record[date] = "-";
        } else {
          const att = attends.find((a) => a.id === studentId);
          const attendForDate = att?.attends?.find(
            (item) => dayjs(item.time_slot__date).format("DD/MM/YYYY") === date
          );
          record[date] = attendForDate ? attendForDate.status : null;
        }
      });

      return record;
    }) || [];

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
                    handleAttend(lessonMap[date], file);
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

        return status === "Present" ? (
          <CheckCircleOutlined
            style={{ color: "green", fontSize: 16 }}
            onClick={() => handleAttend(lessonMap[date], false)}
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
      <div className='mb-4'>
        <h2 className='mb-4 text-2xl font-bold'>Quản lý điểm danh</h2>
      </div>
      {course_detail && (
        <Card className='mb-6 shadow-sm w-[50%]'>
          <Row className='mb-2'>
            <Tag color='blue' className='text-lg'>
              Lớp: {course_detail.class_st?.name}
            </Tag>
            <Tag color='green' className='text-lg'>
              Môn: {course_detail.subject?.name} ({course_detail.subject?.code})
            </Tag>
          </Row>
          <Row className='mb-2'>
            <Tag color='purple' className='text-lg'>
              Phòng: {course_detail.room?.code} - {course_detail.room?.building}
            </Tag>
            <Tag color='orange' className='text-lg'>
              Học kỳ: {course_detail.semester?.semester} (
              {course_detail.semester?.year})
            </Tag>
            <Tag color='cyan' className='text-lg'>
              Thứ: {course_detail.weekday}, Tiết bắt đầu:{" "}
              {course_detail.start_period}
            </Tag>
          </Row>
          <Tag color='red' className='text-lg'>
            Thời gian: {course_detail.start_date} → {course_detail.end_date}
          </Tag>
        </Card>
      )}

      <div className='mb-4 mt-4'>
        <Upload
          accept='image/*'
          showUploadList={false}
          beforeUpload={(file) => {
            const today = dayjs().format("DD/MM/YYYY");
            const lessonId = lessonMap[today];

            if (!lessonId) {
              messageApi.error("Hôm nay không có buổi học!");
              return Upload.LIST_IGNORE;
            }

            handleAttend(lessonId, file);
            return Upload.LIST_IGNORE; // ngăn hiển thị file
          }}
        >
          <Button type='primary'>
            Điểm danh: {dayjs().format("DD/MM/YYYY")}
          </Button>
        </Upload>
      </div>

      <Table
        className='mt-4'
        dataSource={data}
        columns={columns}
        rowKey='id'
        bordered
        scroll={{ x: "max-content" }}
      />

      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        centered
      >
        <img
          src={
            imageBase64.startsWith("data:")
              ? imageBase64
              : `data:image/jpeg;base64,${imageBase64}`
          }
          alt='attendance'
          style={{
            width: "100%",
            borderRadius: 10,
            objectFit: "contain",
          }}
        />
      </Modal>
    </div>
  );
}
