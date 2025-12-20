/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Table, Select, Card, Spin, message } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllSemeterAction, getCurrentSemeterAction } from "../redux/actions/SemesterAction";
import { getAllCourseByTeacherAndSemesterAction } from "../redux/actions/CourseAction";

const weekdayLabels = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thusday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
};

export default function TimeTableSemester() {
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.UserReducer.user);
  const courses = useSelector((state) => state.CourseReducer.courses);
  const semesters = useSelector((state) => state.SemesterReducer.semesters);
  const semester_detail = useSelector(
    (state) => state.SemesterReducer.semester_detail
  );

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getAllSemeterAction());
      await dispatch(getCurrentSemeterAction());
    })();
  }, [dispatch]);

  useEffect(() => {
    if (semester_detail && semester_detail.id && semester === null) {
      setSemester(semester_detail.id);
    }
  }, [semester_detail, semester]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.user_id || !semester) return;
      try {
        setLoading(true);
        console.log("📡 Gọi API với semester =", semester);
        await dispatch(
          getAllCourseByTeacherAndSemesterAction(user.user_id, semester)
        );
      } catch (err) {
        message.error("Lỗi khi tải danh sách lớp học!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch, user?.user_id, semester]);

  // 🧩 Map dữ liệu theo API mới
  const mappedCourses = courses?.map((item, index) => ({
    key: index + 1,
    maMH: item.subject?.code || "N/A",
    tenMH: item.subject?.name || "N/A",
    tinChi: item.subject?.credit || 0,
    thu: item.weekday || "N/A",
    tietBD: item.start_period || "N/A",
    phong: `${item.room?.code || ""}`,
    lop: item.class_st?.name || "N/A",
    // hocKy: item.semester?.semester || "N/A",
    // namHoc: item.semester?.year || "N/A",
    thoiGian: `${new Date(item.start_date).toLocaleDateString("vi-VN")} - ${new Date(item.end_date).toLocaleDateString("vi-VN")}`,
  }));

  // 🧾 Cấu hình các cột hiển thị
  const columns = [
    { title: "STT", dataIndex: "key", key: "key", align: "center" },
    { title: "Mã MH", dataIndex: "maMH", key: "maMH", align: "center" },
    { title: "Tên môn học", dataIndex: "tenMH", key: "tenMH" },
    { title: "Số tín chỉ", dataIndex: "tinChi", key: "tinChi", align: "center" },
    {
      title: "Thứ",
      dataIndex: "thu",
      key: "thu",
      render: (weekday) => {
        const key = weekday;
        return weekdayLabels[key] || "N/A";
      },
    },
    { title: "Tiết bắt đầu", dataIndex: "tietBD", key: "tietBD", align: "center" },
    { title: "Phòng học", dataIndex: "phong", key: "phong", align: "center" },
    { title: "Lớp", dataIndex: "lop", key: "lop", align: "center" },
    // { title: "Học kỳ", dataIndex: "hocKy", key: "hocKy", align: "center" },
    // { title: "Năm học", dataIndex: "namHoc", key: "namHoc", align: "center" },
    {
      title: "Thời gian học",
      dataIndex: "thoiGian",
      key: "thoiGian",
      align: "center",
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center text-white">
          <SettingOutlined className="mr-2" />
          <span className="font-semibold">THỜI KHÓA BIỂU THEO HỌC KỲ</span>
        </div>
      }
      headStyle={{
        backgroundColor: "#1890ff",
        borderRadius: "6px 6px 0 0",
      }}
      bodyStyle={{ backgroundColor: "#f9f9f9" }}
      className="shadow-md rounded-lg"
    >
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Select
          value={semester ?? undefined}
          onChange={(value) => {
            console.log("🎯 Chọn semester:", value);
            setSemester(value);
          }}
          options={semesters.map((s) => ({
            value: s.id,
            label: `${s.semesters} - Năm học ${s.year}`,
          }))}
          placeholder="Chọn học kỳ"
          className="w-full md:w-1/3"
        />
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          bordered
          size="middle"
          columns={columns}
          dataSource={mappedCourses}
          pagination={false}
          scroll={{ x: true }}
          className="bg-white"
        />
      </Spin>
    </Card>
  );
}
