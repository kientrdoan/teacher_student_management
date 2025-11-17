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
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllScoreStudentAction,
  updateScoreExelStudentAction,
  updateScoreStudentAction,
} from "../redux/actions/TermScoureAction";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Score() {
  const dispatch = useDispatch();
  const scores_students = useSelector(
    (state) => state.TermScoreReducer.scores_students
  );

  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      dispatch(getAllScoreStudentAction(id));
    }
  }, [id, dispatch]);

  // ======= HANDLE EDIT =========
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
      await dispatch(updateScoreStudentAction(editingRecord.id, values));
      message.success("Cập nhật điểm thành công!");
      setIsModalVisible(false);
      setEditingRecord(null);
      dispatch(getAllScoreStudentAction(id));
    } catch (error) {
      console.error(error);
      message.error("Không thể lưu điểm!");
    }
  };

  // ======= IMPORT EXCEL =========
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = rows.map((row) => ({
        student_code: String(row.student_code).trim(),
        attendance_score: Number(row.attendance_score) || 0,
        exercise_score: Number(row.exercise_score) || 0,
        mid_score: Number(row.mid_score) || 0,
        final_score: Number(row.final_score) || 0,
      }));

      console.log("Dữ liệu import:", formattedData);

      // Cập nhật điểm từng sinh viên
      for (const item of formattedData) {
        const existing = scores_students.find(
          (s) => s.student.student_code === item.student_code
        );
        if (existing) {
          await dispatch(updateScoreStudentAction(existing.id, item));
        }
      }

      message.success("Import và cập nhật điểm thành công!");
      dispatch(getAllScoreStudentAction(id));
      e.target.value = null;
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi đọc file Excel!");
    }
  };

  // ======= DOWNLOAD TEMPLATE =========
  const handleDownloadTemplate = () => {
    if (!scores_students || scores_students.length === 0) {
      message.warning("Không có dữ liệu sinh viên để tải!");
      return;
    }

    // Chuẩn bị dữ liệu từ danh sách hiện có
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

  // ======= TABLE COLUMNS =========
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
      title: "Môn học",
      dataIndex: ["subject", "name"],
      key: "subject_name",
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
        <Button type="link" onClick={() => handleEdit(record)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý điểm sinh viên</h2>

      <Space style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleImportExcel}
          style={{ marginRight: 8 }}
        />
        <Button onClick={handleDownloadTemplate}>
          Tải file mẫu có dữ liệu
        </Button>
      </Space>

      <Table
        dataSource={scores_students}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={`Chỉnh sửa điểm - ${
          editingRecord?.student?.student_code || ""
        }`}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Điểm chuyên cần"
            name="attendance_score"
            rules={[{ required: true, message: "Vui lòng nhập điểm chuyên cần" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Điểm bài tập"
            name="exercise_score"
            rules={[{ required: true, message: "Vui lòng nhập điểm bài tập" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Điểm giữa kỳ"
            name="mid_score"
            rules={[{ required: true, message: "Vui lòng nhập điểm giữa kỳ" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Điểm cuối kỳ"
            name="final_score"
            rules={[{ required: true, message: "Vui lòng nhập điểm cuối kỳ" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
