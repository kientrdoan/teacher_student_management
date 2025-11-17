import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import Login from "./pages/Login";
import Home from "./pages/Home";
import HomeTemplate from "./my_templates/HomeTemplate";
import { TOKEN } from "../utils/Config";
import Profile from "./pages/Profile";
import TimeTable from "./pages/TimeTable";
import Course from "./pages/Course";
import Score from "./pages/Score";
import { LOGIN_ACTION } from "./redux/types/UserType";
import Student from "./pages/Student";
import ScoreManagement from "./pages/ScoreManagement";
import TimeTableSemester from "./pages/TimeTableSemester";
import AttendManage from "./pages/AttendManage";
import Attendace from "./pages/Attendace";

function App() {
  const dispatch = useDispatch();

  // 🔹 Decode token và restore user ngay khi App mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN);
    if (token) {
      try {
        const payload = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (payload.exp > currentTime) {
          dispatch({
            type: LOGIN_ACTION,
            access_token: token,
            user: {
              user_id: payload.user_id,
              name: payload.name,
              role: payload.role,
            },
          });
        } else {
          localStorage.removeItem(TOKEN);
        }
      } catch (error) {
        console.error("Decode token lỗi:", error);
        localStorage.removeItem(TOKEN);
      }
    }
  }, [dispatch]);

  // 🔹 Route bảo vệ
  const ProtectedRoute = () => {
    const token = localStorage.getItem(TOKEN);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeTemplate />}>
            {/* <Route index element={<Home />} /> */}

            <Route index path="time-table-semester" element={<TimeTableSemester />} />

            <Route path="profile" element={<Profile />} />
            <Route path="time-table" element={<TimeTable />} />
            
            <Route path="courses" element={<Course />} />
            <Route path="/courses/students/:id" element={<Student></Student>} />
            <Route path="score-management" element={<ScoreManagement />} />
            <Route path="scores/:id" element={<Score />} />
            <Route path="attend-management" element={<AttendManage />} />
            <Route path="attend/:id" element={<Attendace />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
