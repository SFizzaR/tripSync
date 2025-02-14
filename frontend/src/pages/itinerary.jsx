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
import citiesData from "./citiesData"; // Import the city list (JSON file)
import { FaCalendarAlt } from "react-icons/fa";

export default function Itinerary() {
  const [isOpen, setIsOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const [city, setCity] = useState("");
  const [filteredCities, setFilteredCities] = useState(citiesData);

  const [takeoffDate, setTakeoffDate] = useState("");
  const [touchdownDate, setTouchdownDate] = useState("");

  const [nameOption, setNameOption] = useState("default");
  const [itineraryName, setItineraryName] = useState(city);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setCity(e.target.value);
    setFilteredCities(
      citiesData.filter(
        (item) =>
          item.city.toLowerCase().includes(searchValue) ||
          item.country.toLowerCase().includes(searchValue)
      )
    );
  };

  const handleFinish = async () => {
    console.log("CAllledddddddd");
    const token = localStorage.getItem("accessToken"); 
    console.log("TOken from hnadlefimish: ",token)
    if (!token) {
        alert("User not authenticated");
        return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("DECODED TOKEN: ",decodedToken)
      const userId = decodedToken.user.id;

      const userBudget = "Standard";  // HARDCODEDDD
      const isCollaborative = selectedOption === "collaborative"; 

      const itineraryData = {
        userId,
        city,
        startDate: takeoffDate || null,
        endDate: touchdownDate || null, 
        budget: userBudget, 
        collaborative: isCollaborative, 
        status: "planning",
        title: itineraryName || city
      };
      

      console.log("📦 Sending Itinerary Data:", itineraryData);

      const response = await fetch("http://localhost:5001/api/itineraries/CreateItinerary", {
          method: "POST",  
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  
          },
        
          body: JSON.stringify(itineraryData)
      });

      const data = await response.json();

      if (response.ok) {
          alert("🎉 Itinerary saved successfully!");
      } else {
          alert("❌ Error: " + (data.error || "Unknown error"));
      }
  } catch (error) {
      alert("Failed to save itinerary.");
  }
};


  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setFirstName("Guest"); // Reset UI state
    navigate("/");
    window.location.reload();
  };

  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");

  const handleNext = () => {
    if (step === 1 && !selectedOption) {
      alert("Please select an option");
      return;
    }
    if (step === 2 && !city) {
      alert("Please select a city before proceeding.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
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
            position: "relative",
            width: "91%", // Responsive width
            maxWidth: "1000px", // Prevents excessive stretching
            height: "500px", // Increased height for a longer box
            borderColor: "rgba(217, 228, 231, 0.6)",
            margin: "20px auto", // Centers it horizontally
            display: "grid",
            gridTemplateColumns: "30vw 1fr",
            color: "white",
            padding: "0",
            borderRadius: "5px",
            backgroundColor: "rgb(0,0,0)",
            boxShadow: "0px 0px 10px rgba(6, 73, 106, 0.5)",
            fontFamily: "Montserrat",
          }}
        >
          {/* Left Column */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "5% 1fr 1fr",
              borderRightStyle: "dotted",
              borderRightColor: "white",
              fontSize: "120%", // Adjusted base font size
              whiteSpace: "nowrap",
              marginTop: 0,
              padding: "6px",
            }}
          >
            {/* HEADER ROW */}
            <div
              style={{
                fontFamily: "P2P",
                fontWeight: "lighter",
                color: "rgba(247, 253, 255, 0.86)",
                fontSize: "65%", // Slightly larger for emphasis
                textShadow: "0 0 10px rgb(114, 153, 179)",
                marginTop: "3px",
                paddingBottom: "10px",
              }}
            >
              ITINERARIES
            </div>

            {/* SOLO ITINERARY ROW */}
            <div
              style={{
                borderTop: "1px solid grey",
                padding: "10px 2px",
                fontSize: "60%", 
              }}
            >
              SOLO TRIP ITINERARIES
            </div>

            {/* COLLAB ITINERARY ROW */}
            <div
              style={{
                borderTop: "1px solid grey",
                padding: "10px 2px",
                fontSize: "60%", // Matched to Solo Itineraries for consistency
              }}
            >
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
              onClick={() => setIsDialogOpen(true)}
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

            {isDialogOpen && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  zIndex: 999,
                }}
              />
            )}

            {isDialogOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(0, 0, 0, 1)",
                  padding: "20px",
                  boxShadow: "0px 0px 19px rgb(49, 16, 102)",
                  borderRadius: "10px",
                  borderStyle: "dotted",
                  color: "rgb(172, 120, 191)",
                  fontWeight: "bold",
                  width: "65%",
                  maxWidth: "500px",
                  zIndex: 1000,
                }}
              >
                {step === 1 && (
                  <>
                    <h2
                      style={{
                        fontSize: "132%",
                        marginTop: "0",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        marginBottom: "20px",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Step 1 of 4:
                    </h2>
                    <h2
                      style={{
                        marginTop: "-15px",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Choose Mode
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "5px",
                        placeItems: "start",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <input
                          type="radio"
                          name="myRadio"
                          value="solo"
                          required
                          style={{ accentColor: "purple" }}
                          checked={selectedOption === "solo"} // Ensure the selected option stays checked
                          onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        Solo
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="myRadio"
                          value="collaborative"
                          required
                          style={{ accentColor: "purple" }}
                          checked={selectedOption === "collaborative"} // Ensure the selected option stays checked
                          onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        Collaborative
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "10px",
                        placeItems: "center",
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedOption("");
                          setIsDialogOpen(false);
                          setStep(1);
                          setCity("");
                          setTouchdownDate("");
                          setTakeoffDate("");
                        }}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        CANCEL
                      </button>

                      <button
                        onClick={handleNext}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        NEXT
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2
                      style={{
                        fontSize: "132%",
                        marginTop: "0",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        marginBottom: "20px",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Step 2 of 4:
                    </h2>
                    <h2
                      style={{
                        marginTop: "-15px",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Select City
                    </h2>
                    {/* Searchable Input Field */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateRows: "20% 70%",
                        placeItems: "center",
                        rowGap: "10px",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter city name"
                        value={city}
                        onChange={handleSearch}
                        style={{
                          width: "90%",
                          padding: "10px",
                          marginBottom: "5px",
                          background: "black",
                          borderWidth: "1px",
                          borderStyle: "dashed",
                          fontFamily: "Inter",
                          color: "grey",
                          fontSize: "100%",
                        }}
                      />

                      {/* Scrollable Dropdown */}
                      <div
                        style={{
                          width: "90%",
                          maxHeight: "200px",
                          overflowY: "auto",
                          borderRadius: "5px",
                          background: "rgb(0, 0, 0)",
                          marginBottom: "10px",
                        }}
                      >
                        {filteredCities.map((item) => (
                          <div
                            key={item.city}
                            onClick={() =>
                              setCity(`${item.city}, ${item.country}`)
                            }
                            style={{
                              padding: "8px",
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              borderBottom: "1px solid rgb(124, 126, 126)",
                              fontFamily: "Inter",
                              fontSize: "80%",
                            }}
                          >
                            <span style={{ marginRight: "10px" }}>
                              {item.flag}
                            </span>
                            {item.city}, {item.country}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "10px",
                        placeItems: "center",
                        width: "100%",
                      }}
                    >
                      <button
                        onClick={handleBack}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        BACK
                      </button>

                      <button
                        onClick={handleNext}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        NEXT
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2
                      style={{
                        fontSize: "132%",
                        marginTop: "0",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        marginBottom: "20px",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Step 3 of 4:
                    </h2>
                    <h2
                      style={{
                        marginTop: "-15px",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Select Dates
                    </h2>

                    <p style={{ fontSize: "92%" }}>
                      NOTE: <i>Enter dates if decided, else continue...</i>
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        border: "1px solid purple",
                        borderRadius: "10px",
                        padding: "10px",
                        marginBottom: "5%",
                      }}
                    >
                      {/* Takeoff Section */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "10px",
                          borderRight: "1px solid purple",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            color: "rgb(187, 150, 218)",
                            fontSize: "90%",
                            fontWeight: "bold",
                            marginBottom: "10%",
                          }}
                        >
                          TAKEOFF
                        </span>

                        <input
                          type="date"
                          value={takeoffDate}
                          onChange={(e) => setTakeoffDate(e.target.value)}
                          style={{
                            color: takeoffDate ? "white" : "black",
                            fontSize: "90%",
                            textAlign: "center",
                            border: "1px dashed grey",
                            padding: "5px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            backgroundColor: "black",
                            width: "85%",
                          }}
                        />
                        <FaCalendarAlt
                          style={{
                            position: "absolute",
                            right: "12%",
                            top: "69%",
                            transform: "translateY(-50%)",
                            color: "white",
                            pointerEvents: "none",
                          }}
                        />
                        {!takeoffDate && (
                          <span
                            style={{
                              position: "absolute",
                              top: "60%",
                              fontSize: "14px",
                              color: "grey",
                              pointerEvents: "none",
                            }}
                          >
                            --/--/--
                          </span>
                        )}

                        {takeoffDate && (
                          <button
                            style={{
                              backgroundColor: "purple",
                              boxShadow: "0px 0px 2px rgb(85, 51, 123)",
                              borderStyle: "none",
                              padding: "8px 10px",
                              fontFamily: "Montserrat",
                              fontWeight: "bold",
                              fontSize: "12px",
                              color: "white",
                              borderRadius: "10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: "10px",
                            }}
                            onClick={() => setTakeoffDate("")}
                          >
                            RESET
                          </button>
                        )}
                      </div>

                      {/* Touchdown Section */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "10px",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            color: "rgb(187, 150, 218)",
                            fontSize: "90%",
                            fontWeight: "bold",
                            marginBottom: "10%",
                          }}
                        >
                          TOUCHDOWN
                        </span>
                        <input
                          type="date"
                          value={touchdownDate}
                          onChange={(e) => setTouchdownDate(e.target.value)}
                          style={{
                            color: takeoffDate ? "white" : "black",
                            fontSize: "90%",
                            textAlign: "center",
                            border: "1px dashed grey",
                            padding: "5px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            backgroundColor: "black",
                            width: "85%",
                          }}
                        />
                        <FaCalendarAlt
                          style={{
                            position: "absolute",
                            right: "12%",
                            top: "69%",
                            transform: "translateY(-50%)",
                            color: "white",
                            pointerEvents: "none",
                          }}
                        />
                        {!touchdownDate && (
                          <span
                            style={{
                              position: "absolute",
                              top: "60%",
                              fontSize: "14px",
                              color: "grey",
                              pointerEvents: "none",
                            }}
                          >
                            --/--/--
                          </span>
                        )}

                        {touchdownDate && (
                          <button
                            style={{
                              backgroundColor: "purple",
                              boxShadow: "0px 0px 2px rgb(85, 51, 123)",
                              borderStyle: "none",
                              padding: "8px 10px",
                              fontFamily: "Montserrat",
                              fontWeight: "bold",
                              fontSize: "12px",
                              color: "white",
                              borderRadius: "10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: "10px",
                            }}
                            onClick={() => setTouchdownDate("")}
                          >
                            RESET
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "10px",
                        placeItems: "center",
                        width: "100%",
                      }}
                    >
                      <button
                        onClick={handleBack}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        BACK
                      </button>

                      <button
                        onClick={handleNext}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        NEXT
                      </button>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <h2
                      style={{
                        fontSize: "132%",
                        marginTop: "0",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        marginBottom: "20px",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Step 4 of 4:
                    </h2>
                    <h2
                      style={{
                        marginTop: "-15px",
                        fontFamily: "P2P",
                        fontWeight: "lighter",
                        color: "purple",
                        textShadow: "2px 2px 1px rgb(62, 8, 85)",
                      }}
                    >
                      Set Name
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        placeItems: "center",
                        marginBottom: "5%",
                      }}
                    >
                      <div>
                        <input
                          type="radio"
                          name="myRadio"
                          value="nameIt"
                          required
                          style={{ accentColor: "purple" }}
                          checked={nameOption === "nameIt"}
                          onChange={() => setNameOption("nameIt")}
                        />
                        Name Itinerary
                      </div>

                      <div>
                        <input
                          type="radio"
                          name="myRadio"
                          value="default"
                          required
                          style={{ accentColor: "purple" }}
                          checked={nameOption === "default"}
                          onChange={() => {
                            setNameOption("default");
                            setItineraryName(city); // Reset to city name
                          }}
                        />
                        Default (City)
                      </div>
                    </div>

                    {/* Show input field if "Name Itinerary" is selected */}
                    {nameOption === "nameIt" && (
                      <input
                        type="text"
                        value={itineraryName}
                        onChange={(e) => setItineraryName(e.target.value)}
                        placeholder="Enter itinerary name..."
                        style={{
                          width: "95%",
                          maxHeight: "200px",
                          overflowY: "auto",
                          borderRadius: "5px",
                          background: "rgb(0, 0, 0)",
                          marginBottom: "10px",
                          borderStyle: "solid",
                          borderWidth: "1px",
                          padding: "8px",
                          fontFamily: "Inter",
                          fontSize: "14px",
                          marginTop: "-10px",
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: "10px",
                        placeItems: "center",
                        width: "100%",
                      }}
                    >
                      <button
                        onClick={handleBack}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        BACK
                      </button>

                      <button
                        onClick={() => {
                          handleFinish();
                          setSelectedOption("");
                          setIsDialogOpen(false);
                          setStep(1);
                          setCity("");
                          setTouchdownDate("");
                          setTakeoffDate("");
                          setNameOption("");
                          setItineraryName("");
                        }}
                        style={{
                          backgroundColor: "rgb(71, 47, 110)",
                          boxShadow: "0px 0px 5px rgb(85, 51, 123)",
                          borderStyle: "none",
                          padding: "10px 20px",
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "white",
                          width: "70%",
                          borderRadius: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 15px rgb(145, 117, 177)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.boxShadow =
                            "0px 0px 10px rgb(85, 51, 123)")
                        }
                      >
                        FINISH
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
