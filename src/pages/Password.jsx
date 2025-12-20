/* eslint-disable no-unused-vars */
"use client";

import {
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { changePasswordAction } from "../redux/actions/UserAction";

export default function Password() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.UserReducer.user);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values) => {
    const payload = {
      user_id: user.user_id,
      old_password: values.old_password,
      new_password: values.new_password,
    };

    const result = await dispatch(changePasswordAction(payload));

    if (result?.success) {
      messageApi.success("Đổi mật khẩu thành công");
      form.resetFields();
    } else {
      messageApi.error(result?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <>
      {contextHolder}
      <div className="h-full overflow-auto p-2">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-sm border border-gray-200">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Đổi mật khẩu
              </h3>

              <Row gutter={16}>
                {/* MẬT KHẨU CŨ */}
                <Col span={8}>
                  <Form.Item
                    label="Mật khẩu cũ"
                    name="old_password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Nhập mật khẩu cũ"
                    />
                  </Form.Item>
                </Col>

                {/* MẬT KHẨU MỚI */}
                <Col span={8}>
                  <Form.Item
                    label="Mật khẩu mới"
                    name="new_password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    //   { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự!" },
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      size="large"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </Form.Item>
                </Col>

                {/* XÁC NHẬN MẬT KHẨU */}
                <Col span={8}>
                  <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirm_password"
                    dependencies={["new_password"]}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác nhận mật khẩu!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("new_password") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Mật khẩu xác nhận không khớp!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="mb-0">
                <Space>
                  <Button type="primary" htmlType="submit" size="large">
                    Lưu
                  </Button>
                  <Button
                    size="large"
                    onClick={() => form.resetFields()}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
}
