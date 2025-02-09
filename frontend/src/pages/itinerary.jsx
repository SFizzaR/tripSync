import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../assets/headerBg.jpg";
import logo from "../assets/plane.PNG";
import menu from "../assets/icons/ellipsis-vertical-solid.svg";
import home from "../assets/icons/house-solid.svg";
import list from "../assets/icons/list-check-solid.svg";
import settings from "../assets/icons/gear-solid.svg";
import logout from "../assets/icons/right-from-bracket-solid.svg";
import "../font.css";
import edit from "../assets/icons/pen-to-square-solid.svg";

export default function Itinerary() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState(
    localStorage.getItem("userData") || "Guest"
  );
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setFirstName("Guest"); // Reset UI state
    navigate("/");
    window.location.reload();
  };

  return (
    <div style={{ paddingBottom: "100px", overflowX: "hidden" }}>
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
              fontSize: "15vw",
              fontWeight: "lighter",
              padding: "20px",
              overflow: "hidden",
              textShadow: "1px 1px 5px rgb(0, 0, 0, 0.7)",
              whiteSpace: "nowrap",
            }}
          >
            My Itineraries
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
          PLAN YOUR ITINERARIES HERE
        </div>
      </section>

      {/* ITINERARIES BOX */}
      <section>
        <div
          style={{
            borderStyle: "dotted",
            width: "91%", // Responsive width
            maxWidth: "1000px", // Prevents excessive stretching
            height: "900px", // Increased height for a longer box
            borderColor: "rgba(217, 228, 231, 0.6)",
            margin: "20px auto", // Centers it horizontally
            display: "grid",
            gridTemplateColumns: "30% 1fr",
            color: "white",
            padding: "0",
            borderRadius: "5px",
            backgroundColor: "rgb(0,0,0)",
            boxShadow: "0px 0px 10px rgba(6, 73, 106, 0.5)",
            fontFamily: "Montserrat"
          }}
        >
          {/* Left Column */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "32px 1fr 1fr",
              borderRightStyle: "dotted",
              borderRightColor: "white",
              fontSize: "1.8vw",
              whiteSpace: "nowrap",
              marginTop: 0,
              padding: "10px"
            }}
          >
            {/* HEADER ROW */}
            <div style={{
                  fontFamily: "P2P",
                  fontWeight: "lighter",
                  color: "rgba(247, 253, 255, 0.86)",
                  fontSize: "2.2vw",
                  textShadow: "0 0 10px rgb(114, 153, 179)",
                  whiteSpace: "nowrap",
                }}
              >
                ITINERARIES
            </div>

            {/* SOLO ITINERARY ROW */}
            <div style={{
                whiteSpace: "nowrap",
                borderTopColor: "grey",
                borderTopStyle: "solid",
                borderTopWidth: "1px",
                padding: "10px 2px"
            }}>
                SOLO TRIP ITINERARIES
            </div>

            {/* COLLAB ITINERARY ROW */}
            <div style={{
                whiteSpace: "nowrap",
                borderTopColor: "grey",
                borderTopStyle: "solid",
                borderTopWidth: "1px",
                padding: "10px 2px"
            }}>
                COLLAB ITINERARIES
            </div>
          </div>

          {/* Right Column (Button) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              style={{
                backgroundColor: "rgb(71, 47, 110)",
                boxShadow: "0px 0px 10px rgb(85, 51, 123)",
                borderStyle: "none",
                padding: "10px 20px",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: "19px",
                color: "white",
                width: "150px",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.target.style.boxShadow = "0px 0px 15px rgb(145, 117, 177)")
              }
              onMouseLeave={(e) =>
                (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
              }
            >
              <img
                src={edit}
                style={{
                  width: "20px",
                  height: "20px",
                  boxShadow: "none",
                }}
                alt="Edit"
              />
              CREATE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
