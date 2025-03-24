import { Routes, Route } from "react-router-dom";
import './index.css';
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/createAccount";
import Dashboard from "./pages/dashboard";
import Itinerary from "./pages/itinerary";
import Notifs from "./pages/Notifs";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/myitinerary" element={<Itinerary />} />
      <Route path="/notifications" element={<Notifs />} />
    </Routes>
  );
};

export default AppRoutes;
