import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../font.css";
import menu from "../assets/icons/options/ellipsis-vertical-solid.svg";
import home from "../assets/icons/options/house-solid.svg";
import list from "../assets/icons/options/list-check-solid.svg";
import settings from "../assets/icons/options/gear-solid.svg";
import logout from "../assets/icons/options/right-from-bracket-solid.svg";
import { useNavigate } from "react-router-dom";
import notifs from "../assets/icons/options/inbox-solid.svg"
const Sidebar = ({ currentPath }) => {
  
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setFirstName(""); // Reset UI state
    navigate("/");
    window.location.reload();
  };

  return (
    <div
      style={{
        width: "200px",
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        marginRight: "30px",
        columnGap: "10px",
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
          src={menu}
          style={{
            width: "20%",
            padding: "6% 5% 0 5%",
          }}
          alt="Menu"
        />
      </button>

      {/* Side Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? "-5px" : "-280px", // Slide in effect
          width: "250px",
          height: "100vh",
          backgroundColor: "rgba(11, 30, 36, 0.85)",
          transition: "right 0.3s ease-in-out",
          borderRadius: "10px",
          padding: "10px",
          color: "white",
          border: "dashed 3px rgb(3, 24, 32)"
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
            right: "10px",
            backgroundColor: "transparent",
            color: "white",
            fontFamily: "Inter",
            fontWeight: "bold",
            fontSize: "27px",
            borderRadius: "10px",
            border: "none",
            padding: "5px 10px",
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
        <ul style={{ listStyle: "none", padding: "10px 0", marginTop: "0" }}>
          {[
            { name: "Home", path: "/dashboard", icon: home },
            { name: "My Itineraries", path: "/myitinerary", icon: list },
            { name: "Notifications", path: "/notifications", icon: notifs },
            { name: "Settings", path: "/settings", icon: settings },
            { name: "Log Out", icon: logout }, // No path for logout
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
                    borderRadius: "8px",
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
                    fontWeight: currentPath === item.path ? "bolder" : "normal",
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
  );
};

export default Sidebar;
