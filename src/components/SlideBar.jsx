import { NavLink } from "react-router-dom"
import { FiHome, FiUsers, FiBook, FiCalendar, FiGrid, FiLayers, FiBookOpen, FiUser, FiUserCheck } from "react-icons/fi"

const menuItems = [
  { name: "Thông tin", path: "/profile", icon: FiGrid },
  { name: "Thời khoá biểu tuần", path: "/time-table", icon: FiGrid },
  { name: "Thời khoá biểu học kỳ", path: "/time-table-semester", icon: FiGrid },
  { name: "Danh sách lớp học", path: "/courses", icon: FiLayers },
  { name: "Quản lý điểm", path: "/score-management", icon: FiLayers },
  { name: "Quản lý điểm danh", path: "/attend-management", icon: FiLayers },
]

export default function SlideBar() {


  return (
    <div className="bg-[#1e293b] text-white w-64 flex-shrink-0 flex flex-col shadow-xl">
      <div className="flex items-center justify-center p-6 border-b border-slate-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Teacher</h1>
          {/* <p className="text-sm text-slate-400 mt-1">Management System</p> */}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#334155] text-white font-semibold shadow-md"
                        : "text-slate-300 hover:bg-[#334155] hover:text-white"
                    }`
                  }
                >
                  <Icon className="text-lg" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
