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
  const { id } = useParams();
  const [form] = Form.useForm();

  const scores_students = useSelector(
    (state) => state.TermScoreReducer.scores_students
  );
  const course_detail = useSelector(
    (state) => state.CourseReducer.course_detail
  );

  const [messageApi, contextHolder] = message.useMessage();
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      dispatch(getAllScoreStudentAction(id)),
      dispatch(getAllCourseByCourseId(id)),
    ]);
    setLoading(false);
  };

  /* ================= EDIT ================= */
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      attendance_score: record.attendance_score,
      discuss_score: record.discuss_score,
      exercise_score: record.exercise_score,
      project_score: record.project_score,
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
      await loadData();
    } catch {
      messageApi.error("Không thể lưu điểm!");
    } finally {
      setSaveLoading(false);
    }
  };

  /* ================= IMPORT EXCEL ================= */
  const handleImportExcel = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setImportLoading(true);
      const res = await dispatch(updateScoreExelStudentAction(id, formData));
      res?.success
        ? messageApi.success("Nhập điểm thành công!")
        : messageApi.error("Nhập điểm thất bại!");
      await loadData();
    } catch {
      messageApi.error("Lỗi import Excel!");
    } finally {
      setImportLoading(false);
    }
  };

  /* ================= EXPORT EXCEL ================= */
  const handleDownloadTemplate = () => {
    if (!scores_students?.length) {
      messageApi.warning("Không có dữ liệu!");
      return;
    }

    const header = [
      "student_code",
      "full_name",
      "attendance_score",
      "discuss_score",
      "exercise_score",
      "project_score",
      "mid_score",
      "final_score",
    ];

    const data = scores_students.map((s) => [
      s.student.student_code,
      `${s.student.last_name} ${s.student.first_name}`,
      s.attendance_score,
      s.discuss_score,
      s.exercise_score,
      s.project_score,
      s.mid_score,
      s.final_score,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scores");
    XLSX.writeFile(wb, "diem_sinh_vien.xlsx");
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "STT", render: (_, __, i) => i + 1 },
    { title: "Mã SV", dataIndex: ["student", "student_code"] },
    {
      title: "Họ tên",
      render: (_, r) => `${r.student.last_name} ${r.student.first_name}`,
    },
    { title: "Chuyên cần", dataIndex: "attendance_score" },
    { title: "Thảo luận", dataIndex: "discuss_score" },
    { title: "Bài tập", dataIndex: "exercise_score" },
    { title: "Đồ án", dataIndex: "project_score" },
    { title: "Giữa kỳ", dataIndex: "mid_score" },
    { title: "Cuối kỳ", dataIndex: "final_score" },
    {
      title: "Hành động",
      render: (_, r) => (
        <Button type='link' onClick={() => handleEdit(r)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <h2 className='text-2xl font-bold mb-4'>Quản lý điểm sinh viên</h2>

      <Space className='mb-4'>
        <Upload
          accept='.xlsx,.xls'
          showUploadList={false}
          beforeUpload={() => false}
          onChange={(info) => handleImportExcel(info.file)}
        >
          <Button icon={<UploadIcon />} loading={importLoading} type='primary'>
            Nhập điểm
          </Button>
        </Upload>

        <Button onClick={handleDownloadTemplate} type='primary'>
          Tải danh sách
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Table rowKey='id' columns={columns} dataSource={scores_students} />
      </Spin>

      <Modal
        title={`Chỉnh sửa điểm - ${editingRecord?.student?.student_code || ""}`}
        open={isModalVisible}
        onOk={handleSave}
        confirmLoading={saveLoading}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout='vertical' form={form}>
          <Form.Item label='Chuyên cần' name='attendance_score'>
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label='Thảo luận' name='discuss_score'>
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label='Bài tập' name='exercise_score'>
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label='Đồ án' name='project_score'>
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label='Giữa kỳ' name='mid_score'>
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label='Cuối kỳ' name='final_score'>
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
