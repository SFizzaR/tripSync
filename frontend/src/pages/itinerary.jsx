import React, { useState, useEffect } from "react";
import axios from "axios";
import "./itinerary.css";
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

  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [itineraryIdnow, setitineraryIdnow] = useState([]);

  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false); // State for toggling list
  const [usersList, setUsersList] = useState([]);

  const filters = [
    { id: "history", src: hist, label: "Historical" },
    { id: "restaurant", src: rest, label: "Restaurants" },
    { id: "mall", src: malls, label: "Shopping" },
    { id: "cafe", src: cafes, label: "Cafes" },
  ];

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions(
      (prevSelected) =>
        prevSelected.includes(option)
          ? prevSelected.filter((item) => item !== option) // Remove if already selected
          : [...prevSelected, option] // Add if not selected
    );
  };

  useEffect(() => {
    if (selectedItinerary) {
      console.log("Updated Selected Itinerary:", selectedItinerary);
      console.log(
        "Places inside selected itinerary:",
        selectedItinerary.places
      );
    }
  }, [selectedItinerary]);

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
      const response = await fetch(
        "http://localhost:5001/api/itineraries/solo",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      const response = await fetch(
        "http://localhost:5001/api/itineraries/colab",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    setitineraryIdnow(selected.id);
    setSelectedOption(selected.collaborative ? "collaborative" : "solo");

    if (selected.city) {
      setCity(selected.city); // Ensure city is set before fetching
      fetchPlaces(selected.city);
    } else {
      console.error("❌ Error: City not found in itinerary");
    }
  };

  useEffect(() => {
    console.log("Updated places:", places);
  }, [places]);

  const handleAddPlace = (placeId) => {
    if (!placeId) {
      console.error("❌ Error: placeId is null or undefined.");
      alert("Error: Place data not loaded yet.");
      return;
    }

    console.log(
      "✅ Adding place to itinerary:",
      itineraryIdnow,
      "Place ID:",
      placeId
    );
    addPlaceToItinerary(itineraryIdnow, placeId);
  };

  const handlePlaceClick = (placeId, placeName) => {
    console.log("Clicked Place ID:", placeId);
    setSelectedPlaceId(placeId); // Store the clicked place ID
  };

  const fetchPlaces = async (city, filter = "") => {
    try {
      console.log("Fetching places for city:", city, "with filter:", filter);

      const response = await axios.get(
        `http://localhost:5001/api/places/getplaces?city=${city}&filter=${filter}`
      );

      console.log("Fetched Places:", response.data); // Debugging

      response.data.forEach((place, index) => {
        if (!place.fsq_id) {
          console.error(
            `❌ Error: Missing _id for place at index ${index}`,
            place
          );
        }
      });

      setAllPlaces(response.data);
      setPlaces(response.data); // Ensure correct data is set
    } catch (error) {
      console.error("Failed to fetch places:", error);
    }
    //addPlaceToItinerary(itineraryIdnow,placeId)
  };

  const addPlaceToItinerary = async (itineraryIdnow, placeId) => {
    if (!itineraryIdnow || !placeId) {
      console.error("❌ Error: Missing itineraryId or placeId.");
      return;
    }

    console.log("📌 Sending request to add place:");
    console.log("➡️ Itinerary ID:", itineraryIdnow);
    console.log("➡️ Place ID:", placeId);

    const url = `http://localhost:5001/api/itineraries/${itineraryIdnow}/places/${placeId}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.message}`);
      }

      const data = await response.json();
      console.log("✅ Successfully added place:", data);

      // Ensure UI updates by setting a new reference
      if (data.itinerary) {
        setSelectedItinerary({ ...data.itinerary });
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }
  };

  //setSelectedItinerary((prevItinerary) => ({
  //...prevItinerary,
  //allPlaces: [...prevItinerary.allPlaces, newPlace], // Ensure new reference
  //}));

  const handleFilterClick = (id) => {
    console.log("Filter clicked:", id);
    if (!city) {
      console.error("❌ Error: City is not selected!");
      return;
    }

    setSelectedFilter(id);
    fetchPlaces(city, id);
  };

  const clearFilter = () => {
    console.log("Clearing filter...");
    setSelectedFilter(null);
    fetchPlaces(city); // Fetch all places again
  };

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

  const fetchUsersList = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("❌ No token found. User not authenticated.");
        return;
      }

      const response = await fetch("http://localhost:5001/api/users/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Fetched user from data: ", data);

      if (response.ok) {
        setUsersList(data); // Store users except logged-in one
        
      } else {
        console.error("❌ Error:", data.message);
      }
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
    console.log("Fetched user from users: ", usersList);
  };

  useEffect(() => {
    console.log("Updated usersList:", usersList);
  }, [usersList]);
  

  useEffect(() => {
    fetchUsersList();
  }, []);

  const sendInvitation = async (itineraryIdnow, receiverId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user")); // Convert string back to object
      const userId = user ? user._id : null; 

      const response = await fetch(
        "http://localhost:5001/api/invite/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itinerary_id: itineraryIdnow,
            sender_id: userId,
            reciver: receiverId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("✅ Invitation sent successfully!");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("❌ Error sending invitation:", error);
      alert("Failed to send invitation.");
    }
  };

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
        className="create-button"
        onMouseEnter={(e) =>
          (e.target.style.boxShadow = "0px 0px 15px rgb(78, 145, 124)")
        }
        onMouseLeave={(e) =>
          (e.target.style.boxShadow = "1px 1px 3px rgb(31, 63, 53)")
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

      {isDialogOpen && <div className="overlay" />}

      {isDialogOpen && (
        <div className="create-container">
          {step === 1 && (
            <>
              <h2 className="stepNum">Step 1 of 4:</h2>
              <h2 className="heading">Choose Mode</h2>
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

              <div className="create-buttons-grid">
                <button
                  onClick={() => {
                    setSelectedOption("");
                    setIsDialogOpen(false);
                    setStep(1);
                    setCity("");
                    setTouchdownDate("");
                    setTakeoffDate("");
                  }}
                  className="create-box-buttons"
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
                  className="create-box-buttons"
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
              <h2 className="stepNum">Step 2 of 4:</h2>
              <h2 className="heading">Select City</h2>
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
                  className="dropdown"
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

              <div className="create-buttons-grid">
                <button
                  onClick={handleBack}
                  className="create-box-buttons"
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
                  className="create-box-buttons"
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
              <h2 className="stepNum">Step 1 of 4:</h2>
              <h2 className="heading">Select Dates</h2>

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
                <div className="takeoff-container">
                  <span className="section-title">TAKEOFF</span>
                  <input
                    type="date"
                    value={takeoffDate}
                    onChange={(e) => setTakeoffDate(e.target.value)}
                    className={`date-input ${
                      takeoffDate ? "date-filled" : "date-empty"
                    }`}
                  />
                  <FaCalendarAlt
                    className={`calendar-icon ${
                      !takeoffDate && !touchdownDate
                        ? "calendar-icon-default"
                        : "calendar-icon-adjusted"
                    }`}
                  />
                  {takeoffDate && (
                    <button
                      className="reset-button"
                      onClick={() => setTakeoffDate("")}
                    >
                      RESET
                    </button>
                  )}
                </div>

                {/* Touchdown Section */}
                <div className="touchdown-container">
                  <span className="section-title">TOUCHDOWN</span>
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
                        );
                        return;
                      }
                      setTouchdownDate(selectedDate);
                    }}
                    min={takeoffDate}
                    className={`date-input ${
                      touchdownDate ? "date-filled" : "date-empty"
                    }`}
                  />
                  <FaCalendarAlt
                    className={`calendar-icon ${
                      !takeoffDate && !touchdownDate
                        ? "calendar-icon-default"
                        : "calendar-icon-adjusted"
                    }`}
                  />
                  {touchdownDate && (
                    <button
                      className="reset-button"
                      onClick={() => setTouchdownDate("")}
                    >
                      RESET
                    </button>
                  )}
                </div>
              </div>

              <div className="create-buttons-grid">
                <button
                  onClick={handleBack}
                  className="create-box-buttons"
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
                  className="create-box-buttons"
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
              <h2 className="stepNum">Step 1 of 4:</h2>
              <h2 className="heading">Set Name</h2>

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
                  className="name-input"
                />
              )}

              <div className="create-buttons-grid">
                <button
                  onClick={handleBack}
                  className="create-box-buttons"
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
                  className="create-box-buttons"
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
        <div className="itinerary-box">
          {/* Left Column */}
          <div className="left-column">
            {/* HEADER ROW */}
            {/* SOLO ITINERARY ROW */}
            <div class="solo-itineraries">
              <strong className="heading-types">SOLO ITINERARIES</strong>
              <navbar>
                <ul className="itinerary-list">
                  {soloItineraries &&
                  Array.isArray(soloItineraries) &&
                  soloItineraries.length > 0 ? (
                    soloItineraries.map((itinerary) => (
                      <li
                        key={itinerary.id}
                        className="itinerary-list-item"
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
                    <li className="nothing">No Itineraries found.</li>
                  )}
                </ul>
              </navbar>
            </div>

            {/* COLLAB ITINERARY ROW */}
            <div class="collab-itineraries">
              <strong className="heading-types">COLLAB ITINERARIES</strong>
              <navbar>
                <ul className="itinerary-list">
                  {colabItineraries &&
                  Array.isArray(colabItineraries) &&
                  colabItineraries.length > 0 ? (
                    colabItineraries.map((itinerary) => (
                      <li
                        key={itinerary.id}
                        className="itinerary-list-item"
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
                    <li className="nothing">No Itineraries found.</li>
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
                    className="filters"
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

                      {collabTab && <div className="overlay" />}

                      {collabTab && (
                        <div
                          className="users-box"
                          style={{
                            height: !addUser ? "26%" : "50%",
                            top: addUser ? "36%" : "26%",
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
                                gridTemplateColumns: "1fr 15%",
                                placeContent: "center",
                                alignContent: "center",
                              }}
                            >
                              <div
                                className="header-box"
                                style={{
                                  color: "rgb(194, 198, 199)",
                                  textShadow: "1px 1px 2px white",
                                  fontSize: "clamp(10px, 2.55vw, 25px)",
                                }}
                              >
                                COLLABORATORS
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  columnGap: "12px",
                                  placeContent: "center",
                                  alignContent: "center",
                                  marginTop: "10px",
                                }}
                              >
                                <div>
                                  <img
                                    src={back}
                                    style={{
                                      width: "110%",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setCollabTab(false), setAddUser(false);
                                    }}
                                  />
                                </div>

                                <div>
                                  <img
                                    src={add}
                                    style={{
                                      width: "120%",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => setAddUser(!addUser)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div style={{ marginTop: "1px" }}>
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
                                {users.length > 0 ? (
                                  users.map((user) => (
                                    <li
                                      key={user._id}
                                      className="users-list-item"
                                    >
                                      <div>
                                        <button
                                          style={{
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <img
                                            src={userBye}
                                            style={{ width: "15px" }}
                                          />
                                        </button>
                                      </div>
                                      <div>{user.username}</div>
                                    </li>
                                  ))
                                ) : (
                                  <p className="nothing">
                                    No collaborators invited yet.
                                  </p>
                                )}
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
                                    className="dropdown"
                                      style={{
                                        width: "100%",
                                        maxHeight: "126px",
                                        position: "absolute",
                                        top: "100%", // Expands downward
                                        left: 0,
                                        zIndex: 10,
                                        marginTop: "5px",
                                        boxShadow:
                                          "0px 4px 8px rgba(0,0,0,0.2)",
                                      }}
                                    >
                                      {usersList
                                        .filter(
                                          (user) =>
                                            user.username
                                              .toLowerCase()
                                              .includes(
                                                searchText.toLowerCase()
                                              ) // Filter based on search input
                                        )
                                        .map((user) => (
                                          <div
                                            key={user._id}
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
                                            <span>{user.username}</span>

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
                                              //onClick={() => {
                                              //alert(
                                              //</div>`Invited ${item.city}, ${item.country}`
                                              //);
                                              //setShowDropdown(false); // Hide dropdown after invite
                                              // }}
                                              onClick={() =>
                                                sendInvitation(
                                                  selectedItinerary.id,
                                                  user._id
                                                )
                                              }
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
                      className="deets"
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
                            className="dates"
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
                            className="dates"
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
                          className="status"
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
                          className="budget"
                        >
                          {selectedItinerary.budget}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        height:
                          selectedItinerary.title !== selectedItinerary.city
                            ? "min(100vw, 425px)"
                            : "min(110vw, 500px)",
                        maxHeight: "495px",
                        borderColor: "grey",
                        borderStyle: "solid",
                        marginTop: "5px",
                        borderWidth: "0.5px",
                        borderRadius: "8px",
                        padding: "5px",
                        overflowY: "auto",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start" }}>
                        <button
                          className="places-button"
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
                              {Array.isArray(places) && places.length > 0 ? (
                                places.map((place, index) => (
                                  <li
                                    key={place.fsq_id}
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
                                    onClick={() =>
                                      handlePlaceClick(place.fsq_id)
                                    }
                                  >
                                    <img
                                      src={addPlaces}
                                      style={{ width: "5%" }}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevents the parent click
                                        //alert("Place added");
                                        handleAddPlace(place.fsq_id);
                                      }}
                                    />
                                    {place.name}
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

                      <div
                        style={{
                          marginTop: "2px",
                          color: "purple",
                          fontSize: "clamp(20px, 1.6vw, 25px)",
                          textShadow: "1px 1px 10px rgb(83, 6, 118)",
                        }}
                      >
                        NAME & CATEGORY
                      </div>

                      <div
                        style={{
                          fontFamily: "Inter",
                          fontSize: "clamp(12px, 1.2vw, 20px)",
                          fontWeight: "bolder",
                        }}
                      >
                        {selectedItinerary &&
                        selectedItinerary.places?.length > 0 ? (
                          selectedItinerary.places.map((place) => (
                            <label
                              key={place.fsq_id}
                              style={{
                                display: "block",
                                margin: "5px 0",
                                textDecoration: selectedOptions.includes(
                                  place._id
                                )
                                  ? "line-through"
                                  : "none",
                                color: selectedOptions.includes(place._id)
                                  ? "grey"
                                  : "white",
                                padding: "6px 0",
                                borderTop: "1px solid grey",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedOptions.includes(place.fsq_id)}
                                onChange={() =>
                                  handleCheckboxChange(place.fsq_id)
                                }
                                style={{ marginRight: "5px" }}
                              />
                              {place.name}
                            </label>
                          ))
                        ) : (
                          <p>No places added yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : soloItineraries.length > 0 ? (
                <p className="nothing">Select an itinerary to see details</p>
              ) : (
                <p className="nothing">Create your first itinerary</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
