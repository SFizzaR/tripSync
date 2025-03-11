import React, { useState, useEffect } from "react";
import axios from "axios";

import { Link, useNavigate } from "react-router-dom";
import Header from "../assets/headerBg.jpg";
import logo from "../assets/plane.PNG";
import menu from "../assets/icons/options/ellipsis-vertical-solid.svg";
import home from "../assets/icons/options/house-solid.svg";
import list from "../assets/icons/options/list-check-solid.svg";
import settings from "../assets/icons/options/gear-solid.svg";
import trash from "../assets/icons/options/trash-solid.svg";
import "../font.css";
import addPlaces from "../assets/icons/options/square-plus-regular.svg";
import hist from "../assets/icons/options/building-columns-solid.svg";
import rest from "../assets/icons/options/utensils-solid.svg";
import loc from "../assets/icons/options/location-dot-solid.svg";
import clear from "../assets/icons/options/minus-solid.svg";
import back from "../assets/icons/options/right-from-bracket-solid.svg";
import cafes from "../assets/icons/options/mug-hot-solid.svg";
import malls from "../assets/icons/options/bag-shopping-solid.svg";
import usersss from "../assets/icons/options/users-solid.svg";
import add from "../assets/icons/options/user-plus-solid.svg";
import userBye from "../assets/icons/options/user-xmark-solid.svg";
import edit from "../assets/icons/options/pen-to-square-solid.svg";
import citiesData from "./citiesData"; // Import the city list (JSON file)
import { FaCalendarAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export default function Itinerary() {
  const [isOpen, setIsOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const [city, setCity] = useState("");
  const [filteredCities, setFilteredCities] = useState(citiesData);

  const [takeoffDate, setTakeoffDate] = useState("");
  const [touchdownDate, setTouchdownDate] = useState("");

  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");

  const [nameOption, setNameOption] = useState("default");
  const [itineraryName, setItineraryName] = useState(city);

  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [soloItineraries, setSoloItineraries] = useState([]);
  const [colabItineraries, setColabItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  const [collabTab, setCollabTab] = useState(false);
  const [addUser, setAddUser] = useState(false);

  const [placesTab, setPlacesTab] = useState(false);

  const [places, setPlaces] = useState([]);


  const [selectedFilter, setSelectedFilter] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const filters = [
    { id: "historical", src: hist, label: "Historical" },
    { id: "restaurants", src: rest, label: "Restaurants" },
    { id: "shopping", src: malls, label: "Shopping" },
    { id: "cafes", src: cafes, label: "Cafes" },
  ];

  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
  const users = ["User 1", "User 2", "User 3", "User 4"];
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option) // Remove if already selected
        : [...prevSelected, option] // Add if not selected
    );
  };

  useEffect(() => {
    fetchSoloItineraries();
    fetchColabItineraries();
   // setSelectedFilter(null);
  }, []);

  useEffect(() => {
    console.log("Updated Itinerary:", selectedItinerary);
  }, [selectedItinerary]);

  const fetchSoloItineraries = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No token found. User not authenticated.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5001/api/itineraries/solo", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Fetched Solo Itineraries:", data); 
  
      if (response.ok) {
        if (Array.isArray(data)) {
          setSoloItineraries(
            data.map((itinerary) => ({
              ...itinerary,
              id: itinerary._id, 
            }))
          );
        } else {
          console.error("Expected an array but got:", data);
        }
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch itineraries:", error);
    }
  };
  
  
  const fetchColabItineraries = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No token found. User not authenticated.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5001/api/itineraries/colab", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        if (Array.isArray(data)) {
          setColabItineraries(
            data.map((itinerary) => ({
              ...itinerary,
              id: itinerary._id, 
            }))
          );
        } else {
          console.error("Expected an array but got:", data);
        }
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch itineraries:", error);
    }
  };
  
  const fetchPlaces = async (city) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/places/getplaces?city=${city}`);
      console.log("Fetched Places:", response.data);
      setAllPlaces(response.data);
      setPlaces(response.data); // Set initially as full data
    } catch (error) {
      console.error("Failed to fetch places:", error);
    }
  };
  
  const handleFilterClick = (id) => {
    setSelectedFilter(id); // Update the selected filter
  
    if (!id) {
      setPlaces(allPlaces); // Show all places when no filter is selected
    } else {
      const filtered = allPlaces.filter((place) =>
        place.categories.some((cat) => {
          return cat?.name?.toLowerCase() === categoryMapping[id]?.toLowerCase();
        })
      );
      setPlaces(filtered);
    }
  };
  
  const handleItineraryClick = (itineraryId) => {
    console.log("Clicked Itinerary ID:", itineraryId);
  
    if (!itineraryId) {
      console.error("❌ Error: Itinerary ID is null or undefined!");
      return;
    }
  
    const selected =
      soloItineraries.find(
        (itinerary) => String(itinerary.id) === String(itineraryId)
      ) ||
      colabItineraries.find(
        (itinerary) => String(itinerary.id) === String(itineraryId)
      );
  
    if (!selected) {
      console.error("❌ Error: No itinerary found with this ID!");
      return;
    }
  
    console.log("✅ Found Itinerary:", selected);
    setSelectedItinerary(selected);
    setSelectedOption(selected.collaborative ? "collaborative" : "solo");
  
    fetchPlaces(selected.city);
  };

  //my coded

const categoryMapping = {
  cafes: "Coffee Shop",
  historical: "Monument",
  restaurants: "Restaurant",
  shopping: "Shopping Mall",
};
  
  console.log("Selected filter:", selectedFilter);
console.log("All places:", allPlaces);

const filteredPlaces = selectedFilter
  ? allPlaces.filter((place) =>
      place.categories.some((cat) => {
        if (!cat || !cat.name) return false;
        return categoryMapping[selectedFilter]
          ?.toLowerCase()
          .includes(cat.name.toLowerCase());
      })
    )
  : allPlaces;


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
    console.log("TOken from hnadlefimish: ", token);
    if (!token) {
      alert("User not authenticated");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("DECODED TOKEN: ", decodedToken);
      const userId = decodedToken.user.id;

      const userBudget = "Standard"; // HARDCODEDDD
      const isCollaborative = selectedOption === "collaborative";

      const itineraryData = {
        userId,
        city,
        startDate: takeoffDate || null,
        endDate: touchdownDate || null,
        budget: userBudget,
        collaborative: isCollaborative,
        status: "planning",
        title: itineraryName || city,
      };

      console.log("📦 Sending Itinerary Data:", itineraryData);

      const response = await fetch(
        "http://localhost:5001/api/itineraries/CreateItinerary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(itineraryData),
        }
      );
      const data = await response.json();

      if (response.ok) {
        alert("🎉 Itinerary saved successfully!");

        const newItinerary = { ...data, id: data._id };

        if (isCollaborative) {
          setColabItineraries((prev) => [...prev, newItinerary]); // ✅ Add to colab only
        } else {
          setSoloItineraries((prev) => [...prev, newItinerary]); // ✅ Add to solo only
        }
      } else {
        alert("❌ Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Failed to save itinerary.");
    }
  };


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

  const [editingDate, setEditingDate] = useState(null);

  const handleBudgetToggle = () => {
    const budgetOptions = ["Economical", "Standard", "Luxury"];
    const currentIndex = budgetOptions.indexOf(
      selectedItinerary.budget || "Standard"
    );
    const newBudget = budgetOptions[(currentIndex + 1) % budgetOptions.length];
    setSelectedItinerary({ ...selectedItinerary, budget: newBudget });
  };

  const handleStatusChange = (event) => {};

  console.log("Selected Option:", selectedOption);


  return (
    <div style={{ paddingBottom: "0", overflowX: "hidden" }}>
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
          zIndex: "1100",
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
              ].map((item) => (
                <li
                  key={item.name}
                  style={{
                    margin: "30px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
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

      <button
        style={{
          background:
            "linear-gradient(135deg, rgb(12, 47, 80), rgb(125, 166, 213))",
          boxShadow: "1px 1px 3px rgb(9, 31, 51)",
          borderStyle: "none",
          margin: "20px auto -10px 70%",
          padding: "8px 15px",
          fontFamily: "Montserrat",
          fontWeight: "bold",
          fontSize: "clamp(16px, 2vw, 40px)",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          overflowX: "hidden",
        }}
        onMouseEnter={(e) =>
          (e.target.style.boxShadow = "0px 0px 15px rgb(22, 45, 66)")
        }
        onMouseLeave={(e) =>
          (e.target.style.boxShadow = "1px 1px 3px rgb(9, 31, 51)")
        }
        onClick={() => setIsDialogOpen(true)}
      >
        <img
          src={edit}
          style={{
            width: "clamp(16px, 2vw, 40px)",
            height: "auto",
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
            position: "fixed",
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
            fontFamily: "Montserrat",
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
                  color: "rgb(178, 80, 190)",
                  textShadow: "1px 2px 1px rgb(87, 14, 119)",
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                  color: "rgb(178, 80, 190)",
                  textShadow: "1px 2px 1px rgb(87, 14, 119)",
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
                      onClick={() => setCity(`${item.city}, ${item.country}`)}
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
                      <span style={{ marginRight: "10px" }}>{item.flag}</span>
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                  color: "rgb(178, 80, 190)",
                  textShadow: "1px 2px 1px rgb(87, 14, 119)",
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
                      top: !takeoffDate && !touchdownDate ? "71%" : "49%",
                      transform: "translateY(-50%)",
                      color: "white",
                      pointerEvents: "none",
                    }}
                  />
                  {!takeoffDate && (
                    <span
                      style={{
                        position: "absolute",
                        top: !takeoffDate && !touchdownDate ? "60%" : "43%",
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
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (selectedDate && selectedDate < takeoffDate) {
                        console.error(
                          "❌ Error: Touchdown date cannot be before takeoff date!"
                        );
                        alert(
                          "Touchdown date cannot be before the takeoff date!"
                        ); // User feedback
                        return;
                      }
                      setTouchdownDate(selectedDate);
                    }}
                    min={takeoffDate} // Prevents selecting past dates in the calendar UI
                    style={{
                      color: touchdownDate ? "white" : "black",
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
                      top: !touchdownDate && !takeoffDate ? "71%" : "49%",
                      transform: "translateY(-50%)",
                      color: "white",
                      pointerEvents: "none",
                    }}
                  />
                  {!touchdownDate && (
                    <span
                      style={{
                        position: "absolute",
                        top: !takeoffDate && !touchdownDate ? "60%" : "43%",
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                  color: "rgb(178, 80, 190)",
                  textShadow: "1px 2px 1px rgb(87, 14, 119)",
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
                    color: "white",
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
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
                    (e.target.style.boxShadow = "0px 0px 10px rgb(85, 51, 123)")
                  }
                >
                  FINISH
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ITINERARIES BOX */}
      <section>
        <div
          style={{
            borderStyle: "dotted",
            position: "relative",
            width: "95%", // Responsive width
            maxWidth: "1200px", // Prevents excessive stretching
            height: "110vw", // Increased height for a longer box
            maxHeight: "700px",
            borderColor: "rgba(217, 228, 231, 0.6)",
            margin: "20px auto", // Centers it horizontally
            display: "grid",
            gridTemplateColumns: "clamp(19vw, 38%, 30vw) 1fr",
            color: "white",
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
              gridTemplateRows: "4% 47% 47%",
              rowGap: "1%",
              borderRightStyle: "dotted",
              borderRightColor: "white",
              fontSize: "120%", // Adjusted base font size
              marginTop: 0,
              padding: "6px",
              overflow: "hidden", // Prevents text overflow
              wordWrap: "break-word", // Wraps long words
              whiteSpace: "normal", // Ensures text doesn't overflow
              marginBottom: "2%",
              paddingBottom: "20px",
            }}
          >
            {/* HEADER ROW */}
            <div
              style={{
                fontFamily: "P2P",
                fontWeight: "lighter",
                color: "rgba(247, 253, 255, 0.86)",
                fontSize: "clamp(10px, 2.55vw, 35px)", // Slightly larger for emphasis
                textShadow: "0 0 10px rgb(114, 153, 179)",
                marginTop: "3%",
                marginBottom: "0",
              }}
            >
              ITINERARIES
            </div>

            {/* SOLO ITINERARY ROW */}
            <div
              class="collab-itineraries"
              style={{
                borderTop: "3px dashed rgb(164, 203, 223)",
                fontSize: "clamp(12px, 2vw, 18px)",
                marginTop: "5%",
                padding: "3% 0 0 0",
                maxHeight: "30vh",
              }}
            >
              <strong style={{ color: "rgb(114, 153, 179)" }}>
                SOLO TRIP ITINERARIES
              </strong>
              <navbar>
                <ul
                  style={{
                    height: "40vh",
                    padding: "0",
                    overflowY: "auto",
                    overflowX: "hidden",
                    fontSize: "85%",
                    paddingBottom: "-20px",
                  }}
                >
                  {soloItineraries &&
                  Array.isArray(soloItineraries) &&
                  soloItineraries.length > 0 ? (
                    soloItineraries.map((itinerary) => (
                      <li
                        key={itinerary.id}
                        style={{
                          color: "white",
                          display: "block",
                          borderTop: "1px solid",
                          listStyle: "none",
                          width: "100%",
                          padding: "10px",
                          margin: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          console.log("Clicked Itinerary ID:", itinerary.id); // Debugging
                          handleItineraryClick(itinerary.id);
                        }}
                      >
                        {itinerary.title ||
                          itinerary.name ||
                          "Untitled Itinerary"}
                      </li>
                    ))
                  ) : (
                    <li
                      style={{
                        color: "gray",
                        textAlign: "center",
                        padding: "10px",
                        listStyle: "none",
                      }}
                    >
                      No Itineraries found.
                    </li>
                  )}
                </ul>
              </navbar>
            </div>

            {/* COLLAB ITINERARY ROW */}
            <div
              class="collab-itineraries"
              style={{
                borderTop: "3px dashed rgb(164, 203, 223)",
                fontSize: "clamp(12px, 2vw, 18px)",
                marginTop: "5%",
                padding: "3% 0 0 0",
                maxHeight: "30vh",
              }}
            >
              <strong style={{ color: "rgb(114, 153, 179)" }}>
                COLLAB ITINERARIES
              </strong>
              <navbar>
                <ul
                  style={{
                    height: "40vh",
                    padding: "0",
                    overflowY: "auto",
                    overflowX: "hidden",
                    fontSize: "85%",
                    padding: "0",
                    paddingBottom: "-10px",
                  }}
                >
                  {colabItineraries &&
                  Array.isArray(colabItineraries) &&
                  colabItineraries.length > 0 ? (
                    colabItineraries.map((itinerary) => (
                      <li
                        key={itinerary.id}
                        style={{
                          color: "white",
                          display: "block",
                          borderTop: "1px solid",
                          listStyle: "none",
                          width: "100%",
                          padding: "10px",
                          margin: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          console.log("Clicked Itinerary ID:", itinerary.id); // Debugging
                          handleItineraryClick(itinerary.id);
                        }}
                      >
                        {itinerary.title ||
                          itinerary.name ||
                          "Untitled Itinerary"}
                      </li>
                    ))
                  ) : (
                    <li
                      style={{
                        color: "gray",
                        textAlign: "center",
                        padding: "10px",
                        listStyle: "none",
                      }}
                    >
                      No Itineraries found.
                    </li>
                  )}
                </ul>
              </navbar>
            </div>
          </div>

          {/* Right Column (Details Box) */}
          <div
            style={{
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                color: "white",
                borderLeft: "1px solid gray",
                width: "100%",
                fontSize: "70%",
                padding: "1%",

                fontFamily: "P2P",
                fontWeight: "lighter",
              }}
            >
              {selectedItinerary ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRow: "10% 15% 1fr",
                      rowGap: "2px",
                    }}
                  >
                    {/* ITINERARY HEADER */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 15% 10%",
                        margin: "15px 0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(10px, 4.2vh, 3vw)",
                          color: "rgb(196, 164, 233)",
                          textShadow: "0px 0px 6px rgba(158, 86, 203, 0.8)",
                        }}
                      >
                        {selectedItinerary.title || "Untitled Itinerary"}
                      </div>

                      <div>
                        {selectedItinerary.collaborative && (
                          <button
                            style={{
                              backgroundColor: "transparent",
                              borderStyle: "none",
                              cursor: "pointer",
                            }}
                            onClick={() => setCollabTab(true)}
                          >
                            <img
                              src={usersss}
                              alt="Collaborative Trip"
                              style={{ width: "clamp(50%, 60%, 70%)" }}
                            />
                          </button>
                        )}
                      </div>

                      {collabTab && (
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
                          onClick={() => setCollabTab(false)}
                        />
                      )}

                      {collabTab && (
                        <div
                          className="filters"
                          style={{
                            position: "absolute",
                            top: "25%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "rgba(0, 0, 0, 1)",
                            padding: "15px",
                            boxShadow: "0px 0px 19px rgb(83, 39, 139)",
                            borderRadius: "10px",
                            borderStyle: "dotted",
                            color: "rgb(87, 51, 134)",
                            fontWeight: "bold",
                            width: "55%",
                            fontFamily: "Montserrat",
                            maxWidth: "500px",
                            height: !addUser ? "26%" : "50%",
                            zIndex: 1000,
                          }}
                        >
                          {/* HEADER */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateRows: "15% 1fr",
                              rowGap: "5px",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 12%",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 10%",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "clamp(15px, 150%, 50px)",
                                    color: "rgb(194, 198, 199)",
                                    fontFamily: "P2P",
                                    fontWeight: "lighter",
                                    paddingTop: "6px",
                                    textShadow: "1px 1px 4px white",
                                  }}
                                >
                                  COLLABORATORS
                                </div>

                                <div>
                                  <img
                                    src={back}
                                    style={{
                                      width: "80%",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setCollabTab(false), setAddUser(false);
                                    }}
                                  />
                                </div>
                              </div>

                              <button
                                style={{
                                  backgroundColor: "transparent",
                                  borderStyle: "none",
                                  cursor: "pointer",
                                }}
                                onClick={() => setAddUser(!addUser)}
                              >
                                <img src={add} style={{ width: "90%" }} />
                              </button>
                            </div>

                            <div style={{ marginTop: "1px" }}>
                              {/* USERS LIST */}
                              <ul
                                style={{
                                  height: "85%",
                                  padding: "0",
                                  overflowY: "auto",
                                  overflowX: "hidden",
                                  fontSize: "75%",
                                  marginTop: !addUser ? "8px" : "auto",
                                }}
                              >
                                {users.map((user) => (
                                  <li
                                  key="hello"
                                  style={{
                                    color: "white",
                                    display: "block",
                                    borderBottom: "1px solid",
                                    listStyle: "none",
                                    width: "100%",
                                    padding: "2px 4px",
                                    margin: 0,
                                    cursor: "pointer",
                                    display: "flex",
                                    fontSize: "150%",
                                    columnGap: "10px",
                                    alignItems: "center",
                                    fontWeight: "lighter"
                                  }}
                                >
                                  <div>
                                    <button
                                      style={{
                                        backgroundColor: "transparent",
                                        borderStyle: "none",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <img
                                        src={userBye}
                                        style={{ width: "25px" }}
                                      />
                                    </button>
                                  </div>

                                  <div>{user}</div>
                                </li>
                                ))}
                              </ul>
                            </div>

                            {/* ADD COLLABORATOR INPUT */}
                            {addUser && (
                              <>
                                <div
                                  style={{
                                    margin: "-10px 0 5px 0",
                                    fontSize: "130%",
                                    color: "rgb(194, 198, 199)",
                                    fontFamily: "P2P",
                                    fontWeight: "lighter",
                                    textShadow: "0px 0px 2px white",
                                  }}
                                >
                                  ADD COLLABORATOR
                                </div>

                                <div
                                  style={{
                                    marginBottom: "10px",
                                    position: "relative",
                                  }}
                                >
                                  <input
                                    type="text"
                                    placeholder="Add Username"
                                    value={searchText}
                                    onChange={(e) => {
                                      setSearchText(e.target.value);
                                      setShowDropdown(
                                        e.target.value.length > 0
                                      ); // Show dropdown only if there's input
                                    }}
                                    style={{
                                      width: "97%",
                                      padding: "5px",
                                      backgroundColor: "transparent",
                                      borderRadius: "8px",
                                      borderStyle: "solid",
                                      borderWidth: "1px",
                                      fontFamily: "Inter",
                                      fontSize: "15px",
                                      color: "grey",
                                    }}
                                  />

                                  {/* SCROLLABLE DROPDOWN */}
                                  {showDropdown && (
                                    <div
                                      style={{
                                        width: "100%",
                                        maxHeight: "126px",
                                        overflowY: "auto",
                                        borderRadius: "5px",
                                        background: "rgb(0, 0, 0)",
                                        position: "absolute",
                                        top: "100%", // Expands downward
                                        left: 0,
                                        zIndex: 10,
                                        marginTop: "5px",
                                        boxShadow:
                                          "0px 4px 8px rgba(0,0,0,0.2)",
                                      }}
                                    >
                                      {filteredCities
                                        .filter((item) =>
                                          item.city
                                            .toLowerCase()
                                            .includes(searchText.toLowerCase())
                                        )
                                        .map((item) => (
                                          <div
                                            key={item.city}
                                            style={{
                                              padding: "8px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              cursor: "pointer",
                                              borderBottom:
                                                "1px solid rgb(124, 126, 126)",
                                              fontFamily: "Inter",
                                              fontSize: "110%",
                                            }}
                                          >
                                            <span>
                                              {item.flag} {item.city},{" "}
                                              {item.country}
                                            </span>

                                            {/* INVITE BUTTON */}
                                            <button
                                              style={{
                                                padding: "5px 10px",
                                                backgroundColor:
                                                  "rgb(51, 90, 134)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                fontSize: "100%",
                                              }}
                                              onClick={() => {
                                                alert(
                                                  `Invited ${item.city}, ${item.country}`
                                                );
                                                setShowDropdown(false); // Hide dropdown after invite
                                              }}
                                            >
                                              Invite
                                            </button>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <button
                          style={{
                            backgroundColor: "transparent",
                            borderStyle: "none",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={trash}
                            alt="Collaborative Trip"
                            style={{ width: "clamp(60%, 70%, 70%)" }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* ITINERARY DETAILS */}
                    {selectedItinerary.title !== selectedItinerary.city && (
                      <div
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(36, 6, 85, 0.67), rgba(73, 18, 161, 0.67))",
                          borderRadius: "10px",
                          padding: "0 5%",
                          color: "white",
                          textAlign: "center",
                          marginBottom: "10px",
                          fontWeight: "lighter",
                          fontSize: "clamp(12px, 1.7vw, 18px)",
                          display: "flex",
                          gap: "15px",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img src={loc} style={{ width: "4%" }} />
                        <p>City: {selectedItinerary.city}</p>
                      </div>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        background:
                          "linear-gradient(90deg, rgba(86, 39, 161, 0.72), rgb(129, 56, 179))",
                        borderRadius: "10px",
                        padding: "2% 5%",
                        color: "white",
                        textAlign: "center",
                        boxShadow: "1px 1px 15px rgba(42, 17, 82, 0.85)",
                        fontSize: "clamp(12px, 1.8vw, 18px)",
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                      }}
                    >
                      {/* Start Date */}
                      <div onClick={() => setEditingDate("start")}>
                        <div
                          style={{
                            textShadow: "1px 1px 5px rgb(0,0,0)",
                          }}
                        >
                          TAKE OFF
                        </div>
                        {editingDate === "start" ? (
                          <input
                            type="date"
                            value={selectedItinerary.startDate || ""}
                            onChange={(e) =>
                              setSelectedItinerary({
                                ...selectedItinerary,
                                startDate: e.target.value,
                              })
                            }
                            onBlur={() => setEditingDate(null)}
                            autoFocus
                          />
                        ) : (
                          <div
                            style={{
                              cursor: "pointer",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              border: "2px solid rgba(255, 255, 255, 0.5)", // Subtle border for better visibility
                              fontFamily: "Montserrat",
                              width: "92%",
                              marginLeft: "4%",
                              color: "white",
                              fontWeight: "bold",
                              padding: "2px 0", // Padding for better spacing
                              borderRadius: "5px", // Rounded corners for a modern look
                              fontSize: "clamp(10px, 1.5vw, 18px)",
                            }}
                          >
                            {selectedItinerary.startDate
                              ? selectedItinerary.startDate
                              : "--/--/--"}
                          </div>
                        )}
                      </div>

                      {/* End Date */}
                      <div
                        onClick={() => setEditingDate("end")}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignContent: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            textShadow: "1px 1px 5px rgb(0,0,0)",
                          }}
                        >
                          RETURN
                        </div>
                        {editingDate === "end" ? (
                          <input
                            type="date"
                            value={selectedItinerary.endDate || ""}
                            min={selectedItinerary.startDate}
                            onChange={(e) =>
                              setSelectedItinerary({
                                ...selectedItinerary,
                                endDate: e.target.value,
                              })
                            }
                            onBlur={() => setEditingDate(null)}
                            autoFocus
                          />
                        ) : (
                          <div
                            style={{
                              cursor: "pointer",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              border: "2px solid rgba(255, 255, 255, 0.5)", // Subtle border for better visibility
                              fontFamily: "Montserrat",
                              color: "white",
                              width: "92%",
                              marginLeft: "4%",
                              fontWeight: "bold",
                              padding: "2px 0", // Padding for better spacing
                              borderRadius: "5px", // Rounded corners for a modern look
                              fontSize: "clamp(10px, 1.5vw, 18px)",
                            }}
                          >
                            {selectedItinerary.endDate
                              ? selectedItinerary.endDate
                              : "--/--/--"}
                          </div>
                        )}
                      </div>

                      {/* Status Dropdown */}
                      <div
                        style={{
                          textShadow: "1px 1px 5px rgb(0,0,0)",
                        }}
                      >
                        STATUS{" "}
                        <select
                          value={selectedItinerary.status || "Planning"}
                          onChange={handleStatusChange}
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight transparency for elegance
                            border: "2px solid rgba(255, 255, 255, 0.5)", // Subtle border for better visibility
                            fontFamily: "Montserrat",
                            color: "white",
                            fontWeight: "bold",
                            padding: "2px", // Padding for better spacing
                            borderRadius: "5px", // Rounded corners for a modern look
                            cursor: "pointer",
                            outline: "none",
                            appearance: "none", // Removes default dropdown arrow styling
                            textAlign: "center",
                            fontSize: "clamp(10px, 1.5vw, 18px)",
                          }}
                        >
                          <option
                            value="Planning"
                            style={{ backgroundColor: "black", color: "white" }}
                          >
                            Planning
                          </option>
                          <option
                            value="Experiencing"
                            style={{ backgroundColor: "black", color: "white" }}
                          >
                            Experiencing
                          </option>
                          <option
                            value="Completed"
                            style={{ backgroundColor: "black", color: "white" }}
                          >
                            Completed
                          </option>
                        </select>
                      </div>

                      {/* Budget Toggle */}
                      <div>
                        <div
                          style={{
                            textShadow: "1px 1px 5px rgb(0,0,0)",
                          }}
                        >
                          BUDGET
                        </div>
                        <button
                          onClick={handleBudgetToggle}
                          style={{
                            cursor: "pointer",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "2px solid rgba(255, 255, 255, 0.5)", // Subtle border for better visibility
                            fontFamily: "Montserrat",
                            color: "white",
                            fontWeight: "bold",
                            padding: "2px 8px", // Padding for better spacing
                            borderRadius: "5px", // Rounded corners for a modern look
                            fontSize: "clamp(10px, 1.5vw, 18px)",
                          }}
                        >
                          {selectedItinerary.budget}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        height: selectedItinerary.title !== selectedItinerary.city ? "min(100vw, 425px)" : "min(110vw, 500px)",
                        maxHeight:  "495px",
                        borderColor: "grey",
                        borderStyle: "solid",
                        marginTop: "5px",
                        borderWidth: "0.5px",
                        borderRadius: "8px",
                        padding: "5px",
                        overflowY: "auto"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start" }}>
                        <button
                          style={{
                            backgroundColor: "transparent",
                            borderStyle: "none",
                            margin: "5px",
                            padding: "5px 15px",
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            fontSize: "clamp(12px, 1.2vw, 20px)",
                            color: "white",
                            borderRadius: "5px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "start",
                            gap: "4px",
                            overflowX: "hidden",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => setPlacesTab(true)}
                        >
                          <img
                            src={addPlaces}
                            style={{
                              width: "4.5%",
                              height: "auto",
                              boxShadow: "none",
                            }}
                          />
                          Add to Itinerary
                        </button>
                      </div>

                      {placesTab && (
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
                          onClick={() => {
                            setPlacesTab(false), setSelectedFilter(null);
                          }}
                        />
                      )}

                      {placesTab && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "rgba(0, 0, 0, 1)",
                            padding: "15px",
                            boxShadow: "0px 0px 19px rgb(83, 39, 139)",
                            borderRadius: "10px",
                            borderStyle: "dotted",
                            color: "rgb(87, 51, 134)",
                            fontWeight: "bold",
                            width: "60%",
                            fontFamily: "Montserrat",
                            maxWidth: "500px",
                            height: "60%",
                            zIndex: 1000,
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 10%",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "160%",
                                color: "rgb(140, 87, 205)",
                                fontFamily: "P2P",
                                marginBottom: "10px",
                                fontWeight: "lighter",
                                paddingTop: "6px",
                                textShadow:
                                  "1px 1px 4px rgba(66, 23, 118, 0.8)",
                              }}
                            >
                              ADD PLACES TO ITINERARY
                            </div>

                            <div>
                              <img
                                src={back}
                                style={{
                                  width: "90%",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setPlacesTab(false), setSelectedFilter(null);
                                }}
                              />
                            </div>
                          </div>

                          {/* FILTER PLACES */}
                          <div
                            className="filters"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              padding: "5px 0", // Reduce top-bottom padding
                              width: "100%", // Ensure full width
                            }}
                          >
                            {selectedFilter && (
                              <button
                                onClick={() => setSelectedFilter(null)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  backgroundColor: "rgb(75, 20, 141)",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "white",
                                  padding: "10px 12px",
                                  borderRadius: "20px",
                                  fontFamily: "monospace",
                                  fontSize: "13px",
                                  fontWeight: "bold",
                                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                  transition: "background-color 0.3s ease",
                                }}
                              >
                                <img src={clear} style={{ width: "10px" }} />
                                CLEAR
                              </button>
                            )}

                            {/* FILTER BUTTON COMPONENT */}
                            {filters.map((filter) => (
                              <button
                                key={filter.id}
                                onClick={() => handleFilterClick(filter.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  backgroundColor:
                                    selectedFilter === filter.id
                                      ? "rgba(130, 90, 180, 1)"
                                      : "rgba(210, 173, 226, 0.8)",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "rgb(243, 251, 255)",
                                  padding: "6px 10px",
                                  borderRadius: "20px",
                                  fontFamily: "monospace",
                                  fontSize: "13px",
                                  boxShadow:
                                    selectedFilter === filter.id
                                      ? "0px 4px 8px rgba(0, 0, 0, 0.2)"
                                      : "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                  whiteSpace: "nowrap",
                                  textShadow: "1px 1px 5px rgb(68, 26, 103)",
                                  boxShadow: "0px 0px 15px rgb(153, 92, 206)",
                                }}
                              >
                                <img
                                  src={filter.src}
                                  style={{ width: "20px", height: "20px" }}
                                />
                                {filter.label}
                              </button>
                            ))}
                          </div>

                          <div>
                          <ul
                            className="filters"
                            style={{
                              height: "45vh",
                              padding: "0",
                              overflowY: "auto",
                              overflowX: "hidden",
                              fontSize: "110%",
                              marginTop: "15px",
                            }}
                          >
                            {Array.isArray(filteredPlaces) && filteredPlaces.length > 0 ? (
                              filteredPlaces.map((allPlaces, index) => (
                                <li
                                  key={index}
                                  style={{
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    borderTop: "1px solid",
                                    listStyle: "none",
                                    padding: "10px",
                                    cursor: "pointer",
                                  }}
                                  //onClick={() => addPlaces(allPlaces)}
                                >
                                  <img
                                    src={addPlaces}
                                    style={{ width: "5%" }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevents the parent click
                                      alert("Place added");
                                    }}
                                  />
                                  {allPlaces.name}
                                </li>
                              ))
                            ) : (
                              <li
                                style={{
                                  color: "gray",
                                  textAlign: "center",
                                  padding: "10px",
                                  listStyle: "none",
                                }}
                              >
                                No Places found.
                              </li>
                            )}
                          </ul>

                          </div>
                        </div>
                      )}

                      <div style={{
                        marginTop: "2px",
                        color: "purple",
                        fontSize: "clamp(20px, 1.6vw, 25px)",
                        textShadow: "1px 1px 10px rgb(83, 6, 118)"
                      }}>
                        NAME & CATEGORY
                      </div>

                      <div style={{
                        fontFamily: "Inter",
                        fontSize: "clamp(12px, 1.2vw, 20px)",
                        fontWeight: "bolder"
                      }}>
                        {options.map((option, index) => (
                          <label
                          key={index}
                          style={{
                            display: "block",
                            margin: "5px 0",
                            textDecoration: selectedOptions.includes(option) ? "line-through" : "none",
                            color: selectedOptions.includes(option) ? "grey" : "white",
                            padding: "6px 0",
                            borderTop: "1px solid grey",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleCheckboxChange(option)}
                            style={{ marginRight: "5px" }}
                          />
                          {option}
                        </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : soloItineraries.length > 0 ? (
                <p
                  style={{
                    color: "gray",
                    textAlign: "center",
                    padding: "10px",
                    listStyle: "none",
                    marginTop: "90%",
                  }}
                >
                  Select an itinerary to see details
                </p>
              ) : (
                <p
                  style={{
                    color: "gray",
                    textAlign: "center",
                    padding: "10px",
                    listStyle: "none",
                    marginTop: "50vh",
                  }}
                >
                  Create your first itinerary
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
