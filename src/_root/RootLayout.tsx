import Bottombar from "@/components/shared/Bottombar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import Topbar from "@/components/shared/Topbar"
import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <div className="w-full md:flex min-h-screen bg-dark-1 text-white">
      {/* التوب بار يظهر فقط في الموبايل ويختفي في الشاشات الكبيرة */}
      <div className="md:hidden w-full">
        <Topbar />
      </div>

      {/* السايد بار يظهر فقط في الشاشات الكبيرة */}
      <LeftSidebar />

      {/* المحتوى الرئيسي بياخد باقي المساحة المتاحة */}
      <main className="flex flex-1 h-full min-h-screen overflow-y-auto py-10 px-6 md:px-10 bg-dark-1 custom-scrollbar">
        <Outlet />
      </main>

      {/* البوتوم بار يظهر فقط في الموبايل */}
      <div className="md:hidden w-full sticky bottom-0 z-50">
        <Bottombar />
      </div>
    </div>
  )
}

export default RootLayout