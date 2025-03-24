import React from "react";
import { useState, useEffect } from "react";
import logo from "../assets/plane.PNG";
import "../font.css";
import { useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "../components/CustomCalendar.css";
import WeatherBox from "../components/weather";
import { generateToken, messaging } from "../utils/firebaseUtils";
import { onMessage } from "firebase/messaging";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Logo from "../components/logo";

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("");

  const location = useLocation();
  const currentPath = location.pathname;

  const itineraryDates = ["2025-01-10", "2025-02-10", "2025-02-20"];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5001/api/users/getname",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("User Data: ", data);
        setUserLocation(data.city);
        console.log("City of user: ", data.city);

        if (response.status === 401) {
          console.error("Unauthorized: Invalid token");
        } else {
          setFirstName(data.first_name);
          setLoading(false); // Stop loading once data is set
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      console.log(payload);
      toast(payload.notification.body);
    });
  }, []);

  return (
    <div style={{ paddingBottom: "100px" }}>
      <Toaster />
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: "0",
          width: "100%",
          backgroundColor: "rgb(49, 89, 116)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          height: "43px",
          boxShadow: "0 2px 3px rgba(0, 0, 0, 0.2)",
          zIndex: "1000",
          animation: "slideIn 0.6s ease-out", // Navbar Slide-in animation
        }}
      >
        {/* Logo Section */}
        <Logo />

        {/* Navbar Buttons */}
        <Sidebar currentPath={window.location.pathname} />
      </nav>

      <Header
        title={`Welcome, ${firstName ?? "Guest"}`}
        text="WHERE ARE YOU HEADING NEXT?"
      />

      <section>
        <p
          style={{
            fontFamily: "P2P",
            fontWeight: "bold",
            color: "rgba(247, 253, 255, 0.86)",
            fontSize: "5vw",
            textAlign: "left",
            textShadow: "0 0 10px rgb(114, 153, 179)",
            margin: "7% -2px -2% 8px",
            padding: "7px 10px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          WEATHER
        </p>
        <WeatherBox location={userLocation} />
      </section>

      {/* Calendar Section */}
      <section>
        <p
          style={{
            fontFamily: "P2P",
            fontWeight: "bold",
            color: "rgba(247, 253, 255, 0.86)",
            fontSize: "5vw",
            textAlign: "left",
            textShadow: "0 0 10px rgb(114, 153, 179)",
            margin: "5% -2px 0 8px",
            padding: "7px 10px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          YOUR CALENDAR
        </p>
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={({ date }) => {
            const today = new Date();
            const dateStr = date.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD
            const todayStr = today.toLocaleDateString("en-CA");

            if (dateStr === todayStr) return "highlight-today"; // Highlight today
            if (itineraryDates.includes(dateStr)) return "highlight"; // Highlight itinerary dates

            return ""; // Default case
          }}
        />
      </section>
    </div>
  );
}
