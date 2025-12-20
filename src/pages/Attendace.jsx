// --- CODE GIỮ NGUYÊN HOÀN TOÀN CỦA BẠN ---
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Table,
  Tag,
  message,
  Upload,
  Button,
  Modal,
  Select,
} from "antd";
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
  AttendManualAction,
  AttendMultiManualAction,
  getAttendByCourseId,
} from "../redux/actions/AttendAction";
import { getAllStudentAction } from "../redux/actions/StudentAction";
import { getAllLessonAction } from "../redux/actions/LessonAction";
import { AiOutlineCheck, AiTwotoneEye } from "react-icons/ai";
import { BsXLg } from "react-icons/bs";

export default function Attendance() {
  const { id: course_id } = useParams();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const [openModal, setOpenModal] = useState(false);
  const [imageBase64, setImageBase64] = useState("");

  const [viewMode, setViewMode] = useState("nearest");

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  // const [bulkStatus, setBulkStatus] = useState("Present");

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

  const nearestDate = lessonDates
    .filter((d) => !dayjs(d, "DD/MM/YYYY").isAfter(dayjs(), "day"))
    .sort(
      (a, b) =>
        dayjs(b, "DD/MM/YYYY").valueOf() - dayjs(a, "DD/MM/YYYY").valueOf()
    )[0];

  const displayedDates = viewMode === "all" ? lessonDates : [nearestDate];

  // const handleAttend = async (lessonId, file) => {
  //   const formData = new FormData();
  //   formData.append("time_slot_id", lessonId);
  //   formData.append("threshold", 0.95);
  //   formData.append("image", file);

  //   const res = await dispatch(AttendAction(formData));

  //   if (res.success) {
  //     setImageBase64(res.data.visualized_image);
  //     messageApi.success("Điểm danh thành công");
  //   } else {
  //     messageApi.error("Dữ liệu không hợp lệ");
  //   }
  // };

  const handleManualAttend = async (studentId, lessonId, status) => {
    const payload = {
      student_id: studentId,
      course_id: course_id,
      time_slot_id: lessonId,
      status: status,
    };

    const res = await dispatch(AttendManualAction(payload));
    if (res.success) {
      dispatch(getAttendByCourseId(course_id));

      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    } else {
      messageApi.error("Dữ liệu không hợp lệ");
    }
  };

  // 🔥 NEW: tính năng điểm danh hàng loạt
  const handleBulkAttend = async () => {
    const lessonId = lessonMap[nearestDate];

    const payload = {
      student_id: selectedStudents, // ← gửi nguyên list student_id
      course_id: course_id,
      time_slot_id: lessonId,
      status: "Present",
    };

    const res = await dispatch(AttendMultiManualAction(payload));

    if (res.success) {
      messageApi.success("Điểm danh hàng loạt thành công!");
      dispatch(getAttendByCourseId(course_id));
      setSelectedStudents([]);
      setOpenBulkModal(false);
    } else {
      messageApi.error("Dữ liệu không hợp lệ");
    }
  };

  const pendingIds = [];
  const data =
    students?.map((s) => {
      const fullName = s.user ? `${s.user.last_name} ${s.user.first_name}` : "";
      const studentId = s.student_id || s.id;
      const studentCode = s?.student_code;
      const studentImage = s?.user?.url;

      const record = {
        id: studentId,
        studentId,
        studentCode,
        name: fullName,
        image: studentImage,
      };

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
          record[`${date}_image`] = attendForDate
            ? attendForDate.attendance_image
            : null;

          if (
            dayjs(date, "DD/MM/YYYY").isSame(today, "day") &&
            attendForDate?.status === "Pending"
          ) {
            pendingIds.push(studentId);
          }
        }
      });
      // setSelectedStudents(record);
      return record;
    }) || [];

  useEffect(() => {
    if (pendingIds.length > 0) {
      setSelectedStudents((prev) => {
        const merged = new Set([...prev, ...pendingIds]);
        return Array.from(merged);
      });
    }
  }, [students, attends]);

  // 🔥 Thêm checkbox đầu bảng
  const rowSelection = {
    selectedRowKeys: selectedStudents,
    onChange: (keys) => setSelectedStudents(keys),
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    // {
    //   title: "Student ID",
    //   dataIndex: "studentId",
    //   key: "studentId",
    //   fixed: "left",
    //   width: 140,
    // },
    {
      title: "Mã sinh viên",
      dataIndex: "studentCode",
      key: "studentCode",
      fixed: "left",
      width: 140,
    },
    {
      title: "Tên sinh viên",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 200,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      fixed: "left",
      width: 120,
      align: "center",
      render: (img) =>
        img ? (
          <img
            src={img.startsWith("http") ? img : `http://localhost:8000${img}`}
            alt='student'
            style={{
              width: 50,
              height: 50,
              // borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          "-"
        ),
    },
    ...displayedDates.map((date) => ({
      title: `Trạng thái: ${date}`,
      dataIndex: date,
      key: date,
      width: 130,
      render: (status, record) => {
        const today = dayjs().format("DD/MM/YYYY");

        if (date === today && status === null) {
          return (
            <button
              className='px-2 py-1 bg-blue-500 text-white rounded'
              onClick={() =>
                handleManualAttend(record.studentId, lessonMap[date], "Present")
              }
            >
              Điểm danh
            </button>
          );
        } else if (date === today && status === "Pending") {
          return (
            <>
              <button
                className='bg-blue-500 text-white rounded h-[20px]'
                onClick={() => {
                  setImageBase64(record[`${date}_image`]);
                  setOpenModal(true);
                }}
              >
                <AiTwotoneEye />
              </button>

              <button
                className='bg-blue-500 text-white rounded h-[20px] ml-2'
                onClick={async () => {
                  handleManualAttend(
                    record.studentId,
                    lessonMap[date],
                    "Present"
                  );
                }}
              >
                <AiOutlineCheck />
              </button>

              <BsXLg
                style={{ color: "green", fontSize: 16 }}
                onClick={() =>
                  handleManualAttend(
                    record.studentId,
                    lessonMap[date],
                    "Absent"
                  )
                }
              />
            </>
          );
        } else if (
          date === today &&
          status === "Absent" &&
          record.attendance_image != null
        ) {
          return (
            <>
              <button
                className='bg-blue-500 text-white rounded h-[20px]'
                onClick={() => {
                  setImageBase64(record.attendance_image);
                  setOpenModal(true);
                }}
              >
                <AiTwotoneEye />
              </button>

              <button
                className='bg-blue-500 text-white rounded ml-2 h-[20px]'
                onClick={() =>
                  handleManualAttend(
                    record.studentId,
                    lessonMap[date],
                    "Present"
                  )
                }
              >
                Điểm danh
              </button>
            </>
          );
        } else if (
          date === today &&
          status === "Absent" &&
          record.attendance_image == null
        ) {
          return (
            <button
              className='px-2 py-1 bg-blue-500 text-white rounded'
              onClick={() =>
                handleManualAttend(record.studentId, lessonMap[date], "Present")
              }
            >
              Điểm danh
            </button>
          );
        }

        if (status === "-") return "-";

        return status === "Present" ? (
          <CheckCircleOutlined
            style={{ color: "green", fontSize: 16 }}
            onClick={() =>
              handleManualAttend(record.studentId, lessonMap[date], "Absent")
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
              Thứ: {course_detail.weekday}, Tiết: {course_detail.start_period}
            </Tag>
          </Row>
          <Tag color='red' className='text-lg'>
            Thời gian: {course_detail.start_date} → {course_detail.end_date}
          </Tag>
        </Card>
      )}

      {/* Tab Bar */}
      <div className='flex gap-3 mb-4 mt-4'>
        <button
          className={`px-4 py-2 rounded font-semibold ${
            viewMode === "nearest"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => setViewMode("nearest")}
        >
          Điểm danh
        </button>

        <button
          className={`px-4 py-2 rounded font-semibold ${
            viewMode === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => setViewMode("all")}
        >
          Xem tất cả
        </button>

        {/* 🔥 Nút điểm danh hàng loạt */}
        <button
          disabled={selectedStudents.length === 0}
          className='px-4 py-2 rounded bg-green-600 text-white'
          onClick={() => setOpenBulkModal(true)}
        >
          Điểm danh nhiều sinh viên ({selectedStudents.length})
        </button>
      </div>

      <Table
        rowSelection={rowSelection}
        className='mt-4'
        dataSource={data}
        columns={columns}
        rowKey='id'
        bordered
        scroll={{ x: "max-content" }}
      />

      {/* Modal xem ảnh */}
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        centered
      >
        <img
          src={
            imageBase64 && imageBase64.startsWith("http")
              ? imageBase64
              : `http://localhost:8000${imageBase64}`
          }
          alt='attendance'
          style={{
            width: "100%",
            borderRadius: 10,
            objectFit: "contain",
          }}
        />
      </Modal>

      {/* 🔥 Modal điểm danh hàng loạt */}
      <Modal
        open={openBulkModal}
        onCancel={() => setOpenBulkModal(false)}
        onOk={handleBulkAttend}
        okText='Xác nhận'
        cancelText='Hủy'
        centered
      >
        <h3 className='font-bold mb-3 text-lg'>
          Điểm danh {selectedStudents.length} sinh viên
        </h3>

        {/* <Select
          value={bulkStatus}
          onChange={setBulkStatus}
          className='w-full'
          options={[
            { label: "Present", value: "Present" },
            { label: "Absent", value: "Absent" },
          ]}
        /> */}
      </Modal>
    </div>
  );
}
