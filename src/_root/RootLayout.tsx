import Bottombar from "@/components/shared/Bottombar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import Topbar from "@/components/shared/Topbar"
import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <div className="w-full md:flex min-h-screen bg-dark-1 text-white">
      {/* Topbar: visible only on mobile devices */}
      <div className="md:hidden w-full">
        <Topbar />
      </div>

      {/* LeftSidebar: visible only on larger screens */}
      <LeftSidebar />

      {/* Main content: takes up the remaining available space */}
      <main className="flex flex-1 h-full min-h-screen overflow-y-auto py-10 px-6 md:px-10 bg-dark-1 custom-scrollbar">
        <Outlet />
      </main>

      {/* Bottombar: visible only on mobile devices */}
      <div className="md:hidden w-full sticky bottom-0 z-50">
        <Bottombar />
      </div>
    </div>
  )
}

export default RootLayout