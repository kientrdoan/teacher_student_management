import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Dropdown,
  Checkbox,
  Tag,
  Select,
} from "antd";
import {
  SearchOutlined,
  SettingOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { getAllCourseByTeacherAndSemesterAction } from "../redux/actions/CourseAction";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSemeterAction,
  getCurrentSemeterAction,
} from "../redux/actions/SemesterAction";

const weekdayLabels = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
};

export default function ScoreManagement() {
  const user = useSelector((state) => state.UserReducer.user);
  const courses = useSelector((state) => state.CourseReducer.courses);
  const semesters = useSelector((state) => state.SemesterReducer.semesters);
  const semester_detail = useSelector(
    (state) => state.SemesterReducer.semester_detail
  );

  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState({
    // id: true,
    stt: true,
    semester: true,
    class_st: true,
    subject: true,
    credit: true,
    room: true,
    start_date: true,
    end_date: true,
    weekday: true,
  });

  useEffect(() => {
    if (!user?.user_id) return;

    const fetchData = async () => {
      await dispatch(getAllSemeterAction());
      await dispatch(getCurrentSemeterAction());
    };

    fetchData();
  }, [dispatch, user]);

  useEffect(() => {
    if (!user?.user_id || !semester_detail?.id) return;
    const semesterId = selectedSemester || semester_detail.id;
    setSelectedSemester(semesterId);
    dispatch(getAllCourseByTeacherAndSemesterAction(user.user_id, semesterId));
  }, [dispatch, user, selectedSemester, semester_detail]);

  const filteredData = courses.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      item.class_st.name.toLowerCase().includes(searchLower) ||
      item.subject.name.toLowerCase().includes(searchLower) ||
      item.subject.code.toLowerCase().includes(searchLower);

    const matchesSemester =
      !selectedSemester || item.semester.id === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const columnMenu = {
    items: [
      // {
      //   key: "id",
      //   label: (
      //     <Checkbox
      //       checked={visibleColumns.id}
      //       onChange={() => toggleColumn("id")}
      //     >
      //       ID
      //     </Checkbox>
      //   ),
      // },
      {
        key: "stt",
        label: (
          <Checkbox
            checked={visibleColumns.stt}
            onChange={() => toggleColumn("stt")}
          >
            STT
          </Checkbox>
        ),
      },
      {
        key: "semester",
        label: (
          <Checkbox
            checked={visibleColumns.semester}
            onChange={() => toggleColumn("semester")}
          >
            Học kỳ
          </Checkbox>
        ),
      },
      {
        key: "class_st",
        label: (
          <Checkbox
            checked={visibleColumns.class_st}
            onChange={() => toggleColumn("class_st")}
          >
            Lớp sinh viên
          </Checkbox>
        ),
      },
      {
        key: "subject",
        label: (
          <Checkbox
            checked={visibleColumns.subject}
            onChange={() => toggleColumn("subject")}
          >
            Môn học
          </Checkbox>
        ),
      },
      {
        key: "credit",
        label: (
          <Checkbox
            checked={visibleColumns.credit}
            onChange={() => toggleColumn("credit")}
          >
            Số tín chỉ
          </Checkbox>
        ),
      },
      {
        key: "room",
        label: (
          <Checkbox
            checked={visibleColumns.room}
            onChange={() => toggleColumn("room")}
          >
            Phòng học
          </Checkbox>
        ),
      },
      {
        key: "start_date",
        label: (
          <Checkbox
            checked={visibleColumns.start_date}
            onChange={() => toggleColumn("start_date")}
          >
            Ngày bắt đầu
          </Checkbox>
        ),
      },
      {
        key: "end_date",
        label: (
          <Checkbox
            checked={visibleColumns.end_date}
            onChange={() => toggleColumn("end_date")}
          >
            Ngày kết thúc
          </Checkbox>
        ),
      },
      {
        key: "weekday",
        label: (
          <Checkbox
            checked={visibleColumns.weekday}
            onChange={() => toggleColumn("weekday")}
          >
            Thứ
          </Checkbox>
        ),
      },
    ],
  };

  const allColumns = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   visible: visibleColumns.id,
    //   width: 80,
    // },
    {
      title: "STT",
      width: 60,
      align: "center",
      fixed: "left",
      visible: visibleColumns.stt,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Class",
      key: "class_st",
      visible: visibleColumns.class_st,
      render: (_, record) => (
        <NavLink
          to={`/scores/${record.id}`}
          className='text-indigo-600 hover:underline font-medium'
        >
          {record.class_st.name}
        </NavLink>
      ),
    },
    {
      title: "Semester",
      key: "semester",
      visible: visibleColumns.semester,
      render: (_, record) => (
        <span>
          {record.semester.year} -{" "}
          <Tag color='blue'>{record.semester.semester}</Tag>
        </span>
      ),
    },
    {
      title: "Subject",
      key: "subject",
      visible: visibleColumns.subject,
      render: (_, record) => (
        <span>
          <Tag color='green'>{record.subject.code}</Tag> {record.subject.name}
        </span>
      ),
    },
    {
      title: "Credit",
      key: "credit",
      visible: visibleColumns.credit,
      render: (_, record) => <span>{record.subject.credit}</span>,
    },
    {
      title: "Room",
      key: "room",
      visible: visibleColumns.room,
      render: (_, record) => (
        <span>
          {record.room.building} - <Tag color='purple'>{record.room.code}</Tag>
        </span>
      ),
    },
    {
      title: "Max Capacity",
      dataIndex: "max_capacity",
      key: "max_capacity",
      visible: visibleColumns.max_capacity,
    },
    {
      title: "Start date",
      dataIndex: "start_date",
      key: "start_date",
      visible: visibleColumns.start_date,
    },
    {
      title: "End date",
      dataIndex: "end_date",
      key: "end_date",
      visible: visibleColumns.end_date,
    },
    {
      title: "Thứ",
      dataIndex: "weekday",
      key: "weekday",
      visible: visibleColumns.weekday,
      render: (weekday) => {
        const key = weekday;
        return weekdayLabels[key] || "N/A";
      },
    },
  ];

  const columns = allColumns.filter((col) => col.visible);

  return (
    <div className='h-full flex flex-col'>
      <div className='bg-white rounded-xl shadow-sm p-6 flex flex-col h-full'>
        <div className='mb-6 flex-shrink-0'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center'>
              <BookOutlined className='text-indigo-600 text-lg' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Quản lý điểm
              </h1>
              <p className='text-sm text-gray-500'>Manage and view score</p>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between mb-6 gap-4 flex-shrink-0'>
          <Space size='middle'>
            <Input
              placeholder='Tìm kiếm...'
              prefix={<SearchOutlined className='text-gray-400' />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              size='large'
              allowClear
              className='rounded-lg'
            />
            <Select
              placeholder='Select semester'
              size='large'
              allowClear
              value={selectedSemester}
              onChange={(value) => setSelectedSemester(value)}
              style={{ width: 220 }}
              options={semesters.map((s) => ({
                label: `${s.year} - ${s.semesters}`,
                value: s.id,
              }))}
            />
            <Dropdown menu={columnMenu} trigger={["click"]}>
              <Button
                icon={<SettingOutlined />}
                size='large'
                className='rounded-lg'
              >
                Columns
              </Button>
            </Dropdown>
          </Space>
        </div>

        <div className='flex-1 overflow-hidden'>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey='id'
            bordered
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} records`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
