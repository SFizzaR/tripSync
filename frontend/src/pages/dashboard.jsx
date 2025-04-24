import React, { useState, useEffect } from "react";
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
import "./dashboard.css";

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [firstName, setFirstName] = useState("Guest");
  const [userLocation, setUserLocation] = useState("");
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const itineraryDates = ["2025-01-10", "2025-02-10", "2025-02-20"];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5001/api/users/getname", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          console.error("Unauthorized: Invalid token");
          return;
        }

        const data = await response.json();
        setUserId(data._id);
        setUserLocation(data.city);
        setFirstName(data.first_name || "Guest");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch("http://localhost:5001/api/notifications/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ notificationId, read: true }),
      });

      if (!response.ok) throw new Error("Failed to mark as read");

    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // Ensure you're using the correct token key
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/notifications/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
      console.log("Fetched notifications:", data);

      if (data) {
        data.forEach((notification) => {

          toast(notification.message);
          markNotificationAsRead(notification._id);

        });
      }

    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications().then(() => {
      console.log("✅ Fetch completed.");

    });
  }, []);



  useEffect(() => {
    generateToken();

    onMessage(messaging, (payload) => {
      console.log("FCM Message Received:", payload);

      const newNotification = {
        message: payload.notification.body,
        type: payload.data?.type || "default", // Assuming type is passed in data payload
        _id: payload.data?.id || new Date().getTime(), // Fallback ID
      };

      setNotifications((prev) => [...prev, newNotification]);


      toast(newNotification.message);
    });

  }, [userId, notifications]); // Only update if userId or notifications change


  return (
    <div style={{ paddingBottom: "100px" }}>
      <Toaster />
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
          animation: "slideIn 0.6s ease-out",
        }}
      >
        <Logo />
        <Sidebar currentPath={useLocation().pathname} />
      </nav>

      <Header title={`Welcome, ${firstName}`} text="WHERE ARE YOU HEADING NEXT?" />

      <section>
        <p className="section-title">WEATHER</p>
        <WeatherBox location={userLocation} />
      </section>

      <section>
        <p className="section-title">YOUR CALENDAR</p>
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={({ date }) => {
            const todayStr = new Date().toISOString().split("T")[0];
            const dateStr = date.toISOString().split("T")[0];
            if (dateStr === todayStr) return "highlight-today";
            if (itineraryDates.includes(dateStr)) return "highlight";
            return "";
          }}
        />
      </section>
    </div>
  );
}