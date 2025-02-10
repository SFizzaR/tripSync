import React from "react";
import { useState, useEffect } from "react";
import Header from "../assets/headerBg.jpg";
import logo from "../assets/plane.PNG";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";
import "../font.css";
import axios from "axios";
import menu from "../assets/icons/ellipsis-vertical-solid.svg";
import home from "../assets/icons/house-solid.svg";
import list from "../assets/icons/list-check-solid.svg";
import settings from "../assets/icons/gear-solid.svg";
import logout from "../assets/icons/right-from-bracket-solid.svg";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "./CustomCalendar.css";
import WeatherBox from "./weather";

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = window.location.pathname;
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); 
  const [userLocation,setUserLocation]=useState("");

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
        console.log("User Data: ",data);
        setUserLocation(data.city);
        console.log('City of user: ',data.city)

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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setFirstName(""); // Reset UI state
    navigate("/");
    window.location.reload();
  };

  return (
    <div style={{ paddingBottom: "100px" }}>
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
        <div
          style={{
            margin: "0",
            width: "200px",
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            columnGap: "15px",
            left: "0",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "60px",
              height: "auto",
              margin: "0",
              padding: "0",
              marginTop: "1px",
              left: "0",
            }}
          />
          <p
            style={{
              fontFamily: "Significent",
              color: "rgb(147, 204, 234)",
              fontSize: "41px",
              letterSpacing: "1px",
              marginTop: "15%",
              display: "block",
              textShadow: "1px 1px 1px rgba(13, 39, 59, 0.57)",
            }}
          >
            tripsync
          </p>
        </div>

        {/* Navbar Buttons */}
        <div
          style={{
            width: "200px",
            display: "flex",
            justifyContent: "end",
            alignContent: "center",
            marginRight: "30px",
            columnGap: "10px",
            padding: "-10px",
            position: "relative",
          }}
        >
          {/* Button */}
          <button
            style={{
              backgroundColor: "transparent",
              width: "40px",
              height: "40px",
              padding: "0",
              borderStyle: "none",
              borderRadius: "10px",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "rgba(25, 57, 78, 0.5)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src={menu} // Ensure 'menu' is a valid image path or import
              style={{
                width: "20%",
                padding: "6% 5% 0 5%",
              }}
            />
          </button>

          {/* Side Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: isOpen ? "-15px" : "-270px", // Slide in effect
              width: "250px",
              height: "100vh",
              backgroundColor: "rgba(2, 40, 53, 0.8)",
              transition: "right 0.3s ease-in-out",
              borderRadius: "10px",
              padding: "10px",
              color: "white",
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(93, 131, 156, 0.9)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
              style={{
                position: "absolute",
                top: "0px",
                fontFamily: "Montserrat",
                right: "10px",
                backgroundColor: "transparent",
                color: "white",
                fontFamily: "Inter",
                fontWeight: "bold",
                fontSize: "27px",
                borderRadius: "10px",
                border: "none",
                padding: "5px 10px",
                float: "right",
              }}
            >
              X
            </button>

            <p
              style={{
                fontFamily: "Significent",
                fontWeight: "lighter",
                fontSize: "70px",
                margin: "0",
                color: "rgb(255, 255, 255)",
                textShadow: "0 0 10px rgba(199, 217, 222, 0.89)",
              }}
            >
              Menu
            </p>
            <ul
              style={{ listStyle: "none", padding: "10px 0", marginTop: "0" }}
            >
              {[
                { name: "Home", path: "/dashboard", icon: home },
                { name: "My Itineraries", path: "/myitinerary", icon: list },
                { name: "Settings", path: "/", icon: settings },
                { name: "Log Out", icon: logout, onClick: handleLogout }, // No path for logout
              ].map((item) => (
                <li
                  key={item.name}
                  style={{
                    margin: "30px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.name === "Log Out" ? (
                    // Logout Button
                    <button
                      onClick={handleLogout}
                      style={{
                        fontFamily: "Montserrat",
                        fontSize: "18px",
                        color: "white",
                        background: "none",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 15px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(255, 255, 255, 0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      <img
                        src={item.icon}
                        alt="Log Out icon"
                        style={{ width: "20px", height: "20px" }}
                      />
                      {item.name}
                    </button>
                  ) : (
                    // Navigation Links
                    <Link
                      to={item.path}
                      style={{
                        fontFamily: "Montserrat",
                        fontSize: "18px",
                        color:
                          currentPath === item.path
                            ? "rgb(158, 190, 211)"
                            : "white",
                        textShadow:
                          currentPath === item.path
                            ? "0 0 10px rgb(158, 190, 211)"
                            : "none",
                        fontWeight:
                          currentPath === item.path ? "bolder" : "normal",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        transition: "background 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(255, 255, 255, 0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      <img
                        src={item.icon}
                        alt={`${item.name} icon`}
                        style={{ width: "20px", height: "20px" }}
                      />
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section
        style={{
          width: "100%",
          padding: "0",
          position: "relative",
          overflow: "hidden",
          margin: "0",
          marginTop: "60px", // Add margin to offset fixed navbar
        }}
      >
        {/* Background Image */}
        <img
          src={Header}
          alt="Header"
          style={{
            width: "100%",
            display: "block",
            margin: "0",
            padding: "0",
          }}
        />

        {/* Overlay Text/Image */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "fadeIn 1s ease-in-out", // Fade-in effect for overlay text
          }}
        >
          <h1
            style={{
              fontFamily: "Significent",
              color: "white",
              fontSize: "9.5vw",
              fontWeight: "100",
              padding: "50px",
              overflow: "hidden",
              textShadow: "1px 1px 5px rgb(0, 0, 0, 0.7)",
              whiteSpace: "nowrap",
            }}
          >
            Welcome, {firstName ? firstName : "Guest"}
          </h1>
        </div>
      </section>

      {/*ONE LINER*/}
      <section
        className="oneLiner"
        style={{
          backgroundColor: "rgb(114, 153, 179)",
          margin: "0",
          paddingLeft: "2%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "P2P",
            fontWeight: "lighter",
            color: "rgba(255, 255, 255, 0.8)",
            padding: "2% 0 1% 0",
            overflow: "hidden", // Ensures the typing effect works
            whiteSpace: "nowrap", // Prevents wrapping
            display: "inline-block", // Keeps text inline
            borderRight: "2px solid white", // Cursor effect
            fontSize: "3.5vw", // Adjust font size
            textShadow: "0 0 4px rgba(13, 99, 99, 0.96)",
            animation:
              "typing 3s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
          }}
        >
          WHERE ARE YOU HEADING NEXT?
        </div>
      </section>

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
        >WEATHER</p>
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
        >YOUR CALENDAR</p>
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
