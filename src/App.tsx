import { Routes, Route } from 'react-router-dom';

import SignupForm from './_auth/forms/SignupForm'; 
import SigninForm from './_auth/forms/SigninForm'; 
import AuthLayout from './_auth/AuthLayout';

import RootLayout from './_root/RootLayout';
import Home from './_root/pages/Home';
import { Toaster } from './components/ui/sonner';


const App = () => {
  return (
    <main className='flex h-screen'>
      <Routes>
          {/* public routes */}
         <Route element={<AuthLayout />}>
           <Route path='/sign-up' element={<SignupForm />} />
           <Route path='/sign-in' element={<SigninForm />} />
         </Route>
         {/* private routes */}
         <Route element={<RootLayout />}>
           <Route index element={<Home />} />
         </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </main>
  )
}

export default App