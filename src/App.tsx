import { Routes, Route } from "react-router-dom";

const App = () => (
  <main className="flex flex-col h-screen">
    <Routes>
      {/* public routes */}
      <Route path="/sign-in" element={<SigninForm />} />
      {/* private routes */}
      <Route index element={<Home />} />
    </Routes>
  </main>
);

export default App;