import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import SlideBar from "../components/SlideBar";

export default function HomeTemplate() {

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SlideBar />

      {/* Phần chính */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Nội dung */}
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
