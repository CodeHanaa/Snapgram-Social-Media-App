import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="flex h-screen w-full bg-black">
          {/* Form on the left */}

          <section className="flex flex-1 justify-center items-center flex-col py-10 ">
            <Outlet />
          </section>

          {/* Image on the right */}
          <img
            src="/assets/images/side-img.png"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </div>
      )}
    </>
  );
};

export default AuthLayout;