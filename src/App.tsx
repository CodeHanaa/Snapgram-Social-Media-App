import { Routes, Route, Navigate } from 'react-router-dom';

import SignupForm from './_auth/forms/SignupForm'; 
import SigninForm from './_auth/forms/SigninForm'; 
import AuthLayout from './_auth/AuthLayout';

import RootLayout from './_root/RootLayout';
import Home from './_root/pages/Home';
import { Toaster } from './components/ui/sonner';
import Explore from './_root/pages/Explore';
import Saved from './_root/pages/Saved';
import AllUsers from './_root/pages/AllUsers';
import CreatePost from './_root/pages/CreatePost';
import EditPost from './_root/pages/EditPost';
import PostDetails from './_root/pages/PostDetails';
import Profile from './_root/pages/Profile';
import UpdateProfile from './_root/pages/UpdateProfile';
import { useUserContext } from './Context/useAuthContext';

const App = () => {
  const { isAuthenticated } = useUserContext();

  return (
    <main className='flex h-screen'>
      <Routes>

        {/* Root route: redirect based on authentication status */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/home" />
              : <Navigate to="/sign-in" />
          }
        />

        {/* Public routes: accessible without authentication */}
        <Route element={<AuthLayout />}>
          <Route path='/sign-up' element={<SignupForm />} />
          <Route path='/sign-in' element={<SigninForm />} />
        </Route>

        {/* Private routes: require authentication */}
        <Route element={<RootLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
        </Route>

        {/* Fallback route: redirect unknown paths to sign-in */}
        <Route path="*" element={<Navigate to="/sign-in" />} />

      </Routes>
      <Toaster richColors position="top-right" />
    </main>
  );
};

export default App;