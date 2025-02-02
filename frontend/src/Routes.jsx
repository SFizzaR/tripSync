import { Routes, Route } from "react-router-dom";
import './index.css';
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/createAccount";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
};

export default AppRoutes;
