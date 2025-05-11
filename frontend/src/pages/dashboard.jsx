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
  const [events, setEvents] = useState([]);

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

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/itineraries/calender', {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch itineraries");
        }

        const rawData = await response.json();
        console.log("Calendar API response:", rawData);

        const formattedEvents = rawData.map(event => ({
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          extendedProps: {
            city: event.city,
            id: event.id
          }
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching calendar itineraries:', error);
      }
    };

    fetchItineraries();
  }, []);


  // Filter events by selected date
  const isSameDay = (d1, d2) =>

    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const eventsForSelectedDate = events.filter(event =>
    isSameDay(event.start, date)
  );
  console.log("All Events:", events);
  console.log("Selected Date:", date);
  console.log("Events For Selected Date:", eventsForSelectedDate);

  const eventDates = new Set(events.map(event => {
    const d = new Date(event.start);
    return d.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  }));


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
        <div className="calendar-container">
          <h3>Select a Date</h3>
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={({ date }) => {
              const todayStr = new Date().toISOString().split("T")[0];
              const dateStr = date.toISOString().split("T")[0];
              if (dateStr === todayStr) return "highlight-today";
              return "";
            }}
            tileContent={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              return eventDates.has(dateStr) ? <div className="dot-marker"></div> : null;
            }}
          />

          <div className="event-list">
            <h4>Events on {date.toDateString()}:</h4>
            {eventsForSelectedDate.length > 0 ? (
              <ul>
                {eventsForSelectedDate.map((event, index) => (
                  <li key={index}>
                    <strong>{event.title}</strong> ({event.extendedProps.city})<br />
                    {event.start.toLocaleTimeString()} - {event.end.toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events on this day.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}