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
import spinner from "../assets/icons/options/snowflake-solid.svg";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../font.css"

export default function Dashboard() {
  const [Loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [firstName, setFirstName] = useState("Guest");
  const [userLocation, setUserLocation] = useState("");
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [countdowns, setCountdowns] = useState([]);

  const itineraryDates = ["2025-05-10", "2025-05-13", "2025-02-20"];

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        // Decode token to get userId
        const decoded = jwtDecode(token);
        const id = decoded.user?.id || decoded._id;
        setUserId(id);

        const response = await fetch("http://localhost:5001/api/users/getname", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          console.error("Unauthorized: Invalid token");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUserLocation(data.city);
        setFirstName(data.first_name || "Guest");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/itineraries/calendar", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch itineraries");

        const rawData = await response.json();

        const formattedEvents = rawData.map((event) => ({
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          extendedProps: {
            city: event.city,
            id: event.id,
          },
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching calendar itineraries:", error);
      }
    };

    fetchItineraries();
  }, []);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const eventsForSelectedDate = events.filter((event) =>
    isSameDay(event.start, date)
  );

  const eventDates = new Set(
    events.map((event) => {
      const d = new Date(event.start);
      return d.toISOString().split("T")[0];
    })
  );

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch("http://localhost:5001/api/notifications/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ notificationId, read: true }),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch("http://localhost:5001/api/notifications/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data);

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
    fetchNotifications();
  }, []);

  useEffect(() => {
    generateToken();

    onMessage(messaging, (payload) => {
      const newNotification = {
        message: payload.notification.body,
        type: payload.data?.type || "default",
        _id: payload.data?.id || new Date().getTime(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      toast(newNotification.message);
    });
  }, [userId]);

  const calculateCountdown = (startDate) => {
    const targetDate = new Date(startDate);
    const now = new Date();
    const diffMs = targetDate - now;
    const timeremaining = {}

    if (diffMs <= 0) {
      return "✈️ Itinerary has started.";
    }

    timeremaining.days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    timeremaining.hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    timeremaining.minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return timeremaining;
  };

  useEffect(() => {
    if (!userId) return;

    let intervalId;
    let baseItineraries = [];

    const fetchOnceAndStartInterval = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get(
          `http://localhost:5001/api/itineraries/getStartDates`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        baseItineraries = response.data;

        if (baseItineraries.length === 0) {
          setCountdowns([
            {
              title: "No Itineraries",
              countdownText: "📭 No upcoming itineraries.",
            },
          ]);
          return;
        }

        // Start interval to update time remaining
        intervalId = setInterval(() => {
          const updatedCountdowns = baseItineraries.map((itinerary) => {
            const time = calculateCountdown(itinerary.startDate);
            return {
              itineraryId: itinerary.itineraryId,
              title: itinerary.title,
              city: itinerary.city,
              timeremaining: typeof time === "string" ? null : time,
              countdownText: typeof time === "string" ? time : null,
            };
          });

          setCountdowns(updatedCountdowns);
        }, 1000);
      } catch (error) {
        console.error("Countdown error:", error);
        setCountdowns([
          {
            title: "Error",
            countdownText: "⚠️ Error fetching countdowns.",
          },
        ]);
      }
    };

    fetchOnceAndStartInterval();

    return () => clearInterval(intervalId); // cleanup when component unmounts
  }, [userId]);
  return (
    <div style={{ paddingBottom: "100px", minHeight: "100vh" }}>
      {Loading ? (
        <>
          <img
            src={spinner}
            style={{
              position: "fixed",
              width: "10%",
              top: "15vw",
              left: "43vw",
              animation: "spin 10s linear infinite",
            }}
          />
          <div
            style={{
              position: "fixed",
              width: "10%",
              top: "28vw",
              left: "41.5vw",
              color: "white",
              fontSize: "3vw",
              fontFamily: "Inter",
            }}
          >
            <i>Loading...</i>
          </div>
        </>
      ) : (
        <>
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
                tileClassName={({ date: tileDate }) => {
                  const todayStr = new Date().toLocaleDateString();
                  const tileStr = tileDate.toLocaleDateString();

                  let className = "";

                  if (tileStr === todayStr) className += " highlight-today";
                  if (
                    itineraryDates.includes(
                      tileDate.toISOString().split("T")[0]
                    )
                  )
                    className += " highlight";
                  if (date && tileStr === new Date(date).toLocaleDateString())
                    className += " selected-tile";

                  return className.trim();
                }}
                tileContent={({ date }) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return eventDates.has(dateStr) ? (
                    <div className="dot-marker"></div>
                  ) : null;
                }}
              />
            </div>
            <div className="event-section">
              <h3>Events for {date.toDateString()}</h3>
              {eventsForSelectedDate.length === 0 ? (
                <p>No events on this date.</p>
              ) : (
                <ul>
                  {eventsForSelectedDate.map((event, index) => (
                    <li key={index}>
                      <strong>{event.title}</strong> in{" "}
                      {event.extendedProps.city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

   <section>
            <p className="section-title">COUNTDOWN</p>
            <div className="countdown-box space-y-4">
              {countdowns.map((countdown, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    color: "white",
                    fontFamily: "Inter"
                  }}
                >
                  <strong>{countdown.title}</strong>
                  {countdown.city && <span> in {countdown.city}</span>}


                  {countdown.timeremaining ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        marginTop: "20px"
                      }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                        }}>
                        {/* Days */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                          <motion.span
                            key={countdown.timeremaining.days}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              fontFamily: "DigitalNumbers",
                              fontSize: "2rem"
                            }}
                          >{countdown.timeremaining.days}</motion.span>
                          <p>days:</p>
                        </div>

                        <span
                          className="blink"
                          style={{
                            fontSize: "2rem"
                          }}>:</span>

                        {/* Hours */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                          <motion.span
                            key={countdown.timeremaining.hours}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              fontFamily: "DigitalNumbers",
                              fontSize: "2rem"
                            }}

                          >{countdown.timeremaining.hours}</motion.span>
                          <p>hours:</p>
                        </div>

                        <span
                          className="blink"
                          style={{
                            fontSize: "2rem"
                          }}>:</span>

                        {/* Minutes */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                          <motion.span
                            key={countdown.timeremaining.minutes}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              fontFamily: "DigitalNumbers",
                              fontSize: "2rem"
                            }}

                          >{countdown.timeremaining.minutes}</motion.span>
                          <p>minutes</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>
                      {countdown.countdownText}
                    </p>
                  )}

                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

