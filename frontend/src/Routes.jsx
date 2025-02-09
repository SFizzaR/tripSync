import { Routes, Route } from "react-router-dom";
import './index.css';
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/createAccount";
import Dashboard from "./pages/dashboard";
import Itinerary from "./pages/itinerary";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/myitinerary" element={<Itinerary />} />
    </Routes>
  );
};

export default AppRoutes;
