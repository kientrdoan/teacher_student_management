/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Space,
  DatePicker,
  message,
  Row,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getDetailTeacherByUserIdAction } from "../redux/actions/ProfileAction";

export default function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null); // <== avatar
  const [messageApi, contextHolder] = message.useMessage();
  const user = useSelector((state) => state.UserReducer.user);

  useEffect(() => {
    const fetchData = async () => {
      const res = await dispatch(getDetailTeacherByUserIdAction(user.user_id));
      if (res.success) {
        const profileData = res.data;

        // --- LẤY URL ẢNH AVATAR ---
        const fullAvatarUrl = profileData.user?.url
          ? `http://localhost:8000${profileData.user.url}`
          : null;

        console.log(fullAvatarUrl)
        setAvatar(fullAvatarUrl);

        form.setFieldsValue({
          teacher_code: profileData.teacher_code,
          degree: profileData.degree,
          title: profileData.title,
          department: profileData.department.name,
          first_name: profileData.user?.first_name,
          last_name: profileData.user?.last_name,
          email: profileData.user?.email,
          phone: profileData.user?.phone,
          address: profileData.user?.address,
          identity_number: profileData.user?.identity_number,
          birthday: profileData.user?.birthday
            ? dayjs(profileData.user.birthday)
            : null,
          gender:
            profileData.user?.gender === "M"
              ? "Nam"
              : profileData.user?.gender === "F"
              ? "Nữ"
              : "Khác",
        });
      } else {
        messageApi.error("Không tìm thấy teacher!");
      }
    };

    if (user && user.user_id) {
      fetchData();
    }
  }, [user, dispatch, form, messageApi]);

  const handleSubmit = async (values) => {
    const payload = {
      teacher_code: values.teacher_code,
      degree: values.degree,
      title: values.title,
      department: values.department,
      user: {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        address: values.address,
        identity_number: values.identity_number,
        birthday: values.birthday
          ? values.birthday.format("YYYY-MM-DD")
          : null,
        gender: values.gender === "Nam" ? "M" : "F",
        password: "12345",
        role: "TEACHER",
        is_active: true,
      },
    };
    console.log("Submit payload:", payload);
  };

  return (
    <>
      {contextHolder}
      <div className="h-full overflow-auto p-2">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-sm border border-gray-200">
            <div className="flex mb-6">
              {/* ---- AVATAR TEACHER ---- */}
              <div className="mr-6">
                <img
                  src={avatar || "https://via.placeholder.com/150"}
                  alt="Avatar"
                  className="w-36 h-36 rounded-full object-cover border shadow"
                />
              </div>

              <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ flex: 1 }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Teacher Information
                </h3>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Instructor Code"
                      name="teacher_code"
                      rules={[{ required: true, message: "Please input instructor code!" }]}
                    >
                      <Input placeholder="e.g. T20001" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Degree" name="degree">
                      <Input placeholder="e.g. PhD, Master" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Title" name="title">
                      <Input placeholder="e.g. Professor" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Department"
                  name="department"
                  rules={[{ required: true, message: "Please select department!" }]}
                >
                  <Select placeholder="Select department" size="large">
                    <Select.Option value="CSE">Computer Science</Select.Option>
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="First Name"
                      name="first_name"
                      rules={[{ required: true, message: "Please input first name!" }]}
                    >
                      <Input placeholder="Enter first name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Last Name"
                      name="last_name"
                      rules={[{ required: true, message: "Please input last name!" }]}
                    >
                      <Input placeholder="Enter last name" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Please input email!" },
                        { type: "email", message: "Invalid email!" },
                      ]}
                    >
                      <Input placeholder="Enter email" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: "Please input phone!" }]}
                    >
                      <Input placeholder="Enter phone" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Identity Number" name="identity_number">
                      <Input placeholder="ID/Passport" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Birthday" name="birthday">
                      <DatePicker style={{ width: "100%" }} size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Gender" name="gender">
                      <Select placeholder="Select gender" size="large">
                        <Select.Option value="Nam">Male</Select.Option>
                        <Select.Option value="Nữ">Female</Select.Option>
                        <Select.Option value="Khác">Other</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Address" name="address">
                  <Input.TextArea rows={2} placeholder="Enter address" />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Space size="middle">
                    <Button type="primary" htmlType="submit" size="large">
                      Save
                    </Button>
                    <Button size="large" onClick={() => navigate("/time-table-semester")}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
