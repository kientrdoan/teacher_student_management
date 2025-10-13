import { useEffect, useState } from "react"
import { Table, Input, Space, Dropdown, Checkbox, Tag, Button, Card } from "antd"
import { SearchOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getAllStudentAction } from "../redux/actions/StudentAction"

export default function Student() {
  const { id: courseId } = useParams()
  const dispatch = useDispatch()

  const students = useSelector((state) => state.StudentReducer.students)

  const [searchText, setSearchText] = useState("")
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    student_code: true,
    name: true,
    email: true,
    phone: true,
    gender: true,
    birthday: true,
    address: true,
  })

  useEffect(() => {
    if (courseId) {
      dispatch(getAllStudentAction(courseId))
    }
  }, [dispatch, courseId])

  const filteredData = students.filter((item) => {
    const searchLower = searchText.toLowerCase()
    return (
      item.student_code.toLowerCase().includes(searchLower) ||
      `${item.user.first_name} ${item.user.last_name}`.toLowerCase().includes(searchLower) ||
      item.user.email.toLowerCase().includes(searchLower)
    )
  })

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const columnMenu = {
    items: [
      { key: "id", label: <Checkbox checked={visibleColumns.id} onChange={() => toggleColumn("id")}>ID</Checkbox> },
      { key: "student_code", label: <Checkbox checked={visibleColumns.student_code} onChange={() => toggleColumn("student_code")}>Student Code</Checkbox> },
      { key: "name", label: <Checkbox checked={visibleColumns.name} onChange={() => toggleColumn("name")}>Full Name</Checkbox> },
      { key: "email", label: <Checkbox checked={visibleColumns.email} onChange={() => toggleColumn("email")}>Email</Checkbox> },
      { key: "phone", label: <Checkbox checked={visibleColumns.phone} onChange={() => toggleColumn("phone")}>Phone</Checkbox> },
      { key: "gender", label: <Checkbox checked={visibleColumns.gender} onChange={() => toggleColumn("gender")}>Gender</Checkbox> },
      { key: "birthday", label: <Checkbox checked={visibleColumns.birthday} onChange={() => toggleColumn("birthday")}>Birthday</Checkbox> },
      { key: "address", label: <Checkbox checked={visibleColumns.address} onChange={() => toggleColumn("address")}>Address</Checkbox> },
    ],
  }

  const allColumns = [
    { title: "ID", dataIndex: "id", key: "id", visible: visibleColumns.id, width: 80 },
    {
      title: "Student Code",
      dataIndex: "student_code",
      key: "student_code",
      visible: visibleColumns.student_code,
      align: "center",
    },
    {
      title: "Full Name",
      key: "name",
      visible: visibleColumns.name,
      render: (_, record) => `${record.user.first_name} ${record.user.last_name}`,
      align: "center",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      visible: visibleColumns.email,
      align: "center",
    },
    {
      title: "Phone",
      dataIndex: ["user", "phone"],
      key: "phone",
      visible: visibleColumns.phone,
      align: "center",
    },
    {
      title: "Gender",
      dataIndex: ["user", "gender"],
      key: "gender",
      visible: visibleColumns.gender,
      align: "center",
      render: (gender) => (gender === "M" ? "Male" : "Female"),
    },
    {
      title: "Birthday",
      dataIndex: ["user", "birthday"],
      key: "birthday",
      visible: visibleColumns.birthday,
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Address",
      dataIndex: ["user", "address"],
      key: "address",
      visible: visibleColumns.address,
      align: "center",
    },
  ]

  const columns = allColumns.filter((col) => col.visible)

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-full">
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TeamOutlined className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Students in Course #{courseId}</h1>
              <p className="text-sm text-gray-500">View all students enrolled in this course</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4 flex-shrink-0">
          <Space size="middle">
            <Input
              placeholder="Search by name, email or student code..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              size="large"
              allowClear
              className="rounded-lg"
            />

            <Dropdown menu={columnMenu} trigger={["click"]}>
              <Button icon={<SettingOutlined />} size="large" className="rounded-lg">
                Columns
              </Button>
            </Dropdown>
          </Space>
        </div>

        <div className="flex-1 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            bordered
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} students`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
