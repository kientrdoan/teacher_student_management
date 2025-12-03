/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  message,
  Space,
  Card,
  Row,
  Tag,
  Upload,
  Spin,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllScoreStudentAction,
  updateScoreExelStudentAction,
  updateScoreStudentAction,
} from "../redux/actions/TermScoureAction";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { getAllCourseByCourseId } from "../redux/actions/CourseAction";
import { UploadIcon } from "lucide-react";

export default function Score() {
  const dispatch = useDispatch();
  const scores_students = useSelector(
    (state) => state.TermScoreReducer.scores_students
  );
  const course_detail = useSelector(
    (state) => state.CourseReducer.course_detail
  );

  const [messageApi, contextHolder] = message.useMessage();

  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, dispatch]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      dispatch(getAllScoreStudentAction(id)),
      dispatch(getAllCourseByCourseId(id)),
    ]);
    setLoading(false);
  };

  // ------------------ EDIT POINT ------------------
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      attendance_score: record.attendance_score,
      exercise_score: record.exercise_score,
      mid_score: record.mid_score,
      final_score: record.final_score,
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaveLoading(true);
      await dispatch(updateScoreStudentAction(editingRecord.id, values));
      messageApi.success("Cập nhật điểm thành công!");
      setIsModalVisible(false);
      setEditingRecord(null);
      await loadData();
    } catch (error) {
      console.error(error);
      messageApi.error("Không thể lưu điểm!");
    } finally {
      setSaveLoading(false);
    }
  };

  // ------------------ IMPORT EXCEL ------------------
  const handleImportExcel = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    // const register_id = scores_students.length > 0 ? scores_students[0].dang_ky_id : null;
    // console.log("register_id", scores_students, register_id);

    try {
      setImportLoading(true);
      // Gọi API hiện tại, BE sẽ xử lý toàn bộ file
      const res = await dispatch(updateScoreExelStudentAction(id, formData));
      console.log("res", res);
      if (res.success) {
        messageApi.success("Nhập điểm thành công!");
      } else {
        messageApi.error(res.error.response.data.data || "Nhập điểm thất bại!");
      }
      await loadData();
    } catch (err) {
      console.error(err);
      messageApi.error("Lỗi khi import file Excel!");
    } finally {
      setImportLoading(false);
    }
  };

  // ------------------ DOWNLOAD TEMPLATE ------------------
  const handleDownloadTemplate = () => {
    if (!scores_students || scores_students.length === 0) {
      messageApi.warning("Không có dữ liệu sinh viên để tải!");
      return;
    }

    const header = [
      "student_code",
      "full_name",
      "attendance_score",
      "exercise_score",
      "mid_score",
      "final_score",
    ];

    const data = scores_students.map((s) => [
      s.student.student_code,
      `${s.student.last_name} ${s.student.first_name}`,
      s.attendance_score ?? 0,
      s.exercise_score ?? 0,
      s.mid_score ?? 0,
      s.final_score ?? 0,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scores");
    XLSX.writeFile(workbook, "diem_sinh_vien.xlsx");
  };

  // ------------------ TABLE COLUMNS ------------------
  const columns = [
    {
      title: "Mã SV",
      dataIndex: ["student", "student_code"],
      key: "student_code",
    },
    {
      title: "Họ tên",
      key: "full_name",
      render: (_, record) =>
        `${record.student.last_name} ${record.student.first_name}`,
    },
    {
      title: "Chuyên cần",
      dataIndex: "attendance_score",
      key: "attendance_score",
    },
    {
      title: "Bài tập",
      dataIndex: "exercise_score",
      key: "exercise_score",
    },
    {
      title: "Giữa kỳ",
      dataIndex: "mid_score",
      key: "mid_score",
    },
    {
      title: "Cuối kỳ",
      dataIndex: "final_score",
      key: "final_score",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type='link' onClick={() => handleEdit(record)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <h2 className='mb-4 text-2xl font-bold'>Quản lý điểm sinh viên</h2>

      {/* ================== COURSE INFO ================== */}
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

      {/* ================== ACTION BUTTONS ================== */}
      <Space className='mb-4 mt-4'>
        <Upload
          accept='.xlsx,.xls'
          showUploadList={false}
          beforeUpload={() => false}
          onChange={(info) => handleImportExcel(info.file)}
        >
          <Button type='primary' icon={<UploadIcon />} loading={importLoading}>
            {importLoading ? "Đang import..." : "Nhập điểm"}
          </Button>
        </Upload>

        <Button onClick={handleDownloadTemplate} type='primary'>
          Tải danh sách sinh viên
        </Button>
      </Space>

      {/* ================== TABLE WITH LOADING ================== */}
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          dataSource={scores_students}
          columns={columns}
          rowKey='id'
          pagination={false}
        />
      </Spin>

      {/* ================== MODAL EDIT ================== */}
      <Modal
        title={`Chỉnh sửa điểm - ${editingRecord?.student?.student_code || ""}`}
        open={isModalVisible}
        onOk={handleSave}
        confirmLoading={saveLoading}
        onCancel={() => setIsModalVisible(false)}
        okText='Lưu'
        cancelText='Hủy'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            label='Điểm chuyên cần'
            name='attendance_score'
            rules={[
              { required: true, message: "Vui lòng nhập điểm chuyên cần" },
            ]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label='Điểm bài tập'
            name='exercise_score'
            rules={[{ required: true, message: "Vui lòng nhập điểm bài tập" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label='Điểm giữa kỳ'
            name='mid_score'
            rules={[{ required: true, message: "Vui lòng nhập điểm giữa kỳ" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label='Điểm cuối kỳ'
            name='final_score'
            rules={[
              { required: true, message: "Vui lòng nhập điểm cuối kỳ" },
            ]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
