/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputNumber, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllScoreStudentAction,
  updateScoreStudentAction,
} from "../redux/actions/TermScoureAction";
import { useParams } from "react-router-dom";

export default function Score() {
  const dispatch = useDispatch();
  const scores_students = useSelector(
    (state) => state.TermScoreReducer.scores_students
  );
  const user = useSelector((state) => state.UserReducer.user);

  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { id } = useParams(); // courseId

  useEffect(() => {
    if (id) {
      dispatch(getAllScoreStudentAction(id));
    }
  }, [id, dispatch]);

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
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
      dispatch(getAllScoreStudentAction(id)); // Refresh lại danh sách
    } catch (error) {
      console.error(error);
      message.error("Không thể lưu điểm!");
    }
  };

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
