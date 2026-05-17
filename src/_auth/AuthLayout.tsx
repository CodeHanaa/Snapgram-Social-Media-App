import { Outlet,Navigate } from "react-router-dom"

const AuthLayout = () => {
    const isAuthenticated = false; // Replace with actual authentication logic

  return (
  <>
       { isAuthenticated ? ( 
        <Navigate to="/" />) : (<>
           <section className="felx flex-1 justify-center items-center flex-col py-10">
            <Outlet />
           </section> 

           <img
            src="public/assets/images/side-img.svg"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-50 -z-10"
           />
           </>
        )
        }
  </>
  )
}

export default AuthLayout