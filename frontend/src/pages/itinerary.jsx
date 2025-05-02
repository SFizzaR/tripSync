import React, { useState, useEffect } from "react";
import axios from "axios";
import "./itinerary.css";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/plane.PNG";
import trash from "../assets/icons/options/trash-solid.svg";
import "../font.css";
import addPlaces from "../assets/icons/options/square-plus-solid.svg";
import hist from "../assets/icons/options/building-columns-solid.svg";
import rest from "../assets/icons/options/utensils-solid.svg";
import attr from "../assets/icons/options/binoculars-solid.svg";
import nature from "../assets/icons/options/tree-solid.svg";
import music from "../assets/icons/options/music-solid.svg";
import hotels from "../assets/icons/options/city-solid.svg";
import enter from "../assets/icons/options/film-solid.svg";
import loc from "../assets/icons/options/location-dot-solid.svg";
import clear from "../assets/icons/options/minus-solid.svg";
import back from "../assets/icons/options/share-solid.svg";
import cafes from "../assets/icons/options/mug-hot-solid.svg";
import malls from "../assets/icons/options/bag-shopping-solid.svg";
import usersss from "../assets/icons/options/users-solid.svg";
import add from "../assets/icons/options/user-plus-solid.svg";
import userBye from "../assets/icons/options/user-xmark-solid.svg";
import edit from "../assets/icons/options/pen-to-square-solid.svg";
import citiesData from "./citiesData";
import { FaCalendarAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Logo from "../components/logo";
import toast, { Toaster } from "react-hot-toast";

export default function Itinerary() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
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
  const [itineraryIdnow, setitineraryIdnow] = useState("");
  const [users, setUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [placesDeets, setPlacesDeets] = useState(false);
  const [placesDeetsId, setPlaceDeetsId] = useState(null);
  const [checkedPlaces, setCheckedPlaces] = useState({});
  const [placeDetails, setPlaceDetails] = useState(null);
  const [ratings, setRatings] = useState({});
  const [ratingError, setRatingError] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const filters = [
    { id: "history", src: hist, label: "History" },
    { id: "restaurant", src: rest, label: "Restaurants" },
    { id: "shopping", src: malls, label: "Shopping" },
    { id: "cafe", src: cafes, label: "Cafes" },
    { id: "music", src: music, label: "Music" },
    { id: "hotel", src: hotels, label: "Hotels" },
    { id: "attraction", src: attr, label: "Attraction" },
    { id: "nature", src: nature, label: "Nature" },
    { id: "entertainment", src: enter, label: "Entertainment" },
  ];

  useEffect(() => {
    if (selectedItinerary && selectedItinerary.places) {
      const initialCheckedState = {};
      selectedItinerary.places.forEach((place) => {
        initialCheckedState[place.placeId] = false;
      });
      setCheckedPlaces(initialCheckedState);
    } else {
      setCheckedPlaces({});
    }
  }, [selectedItinerary]);

  const handleCheckboxChange = (placeId) => {
    setCheckedPlaces((prev) => ({
      ...prev,
      [placeId]: !prev[placeId],
    }));
  };

  useEffect(() => {
    if (selectedItinerary) {
      console.log("Updated Selected Itinerary:", selectedItinerary);
      console.log("Places inside selected itinerary:", selectedItinerary.places);
    }
  }, [selectedItinerary]);

  useEffect(() => {
    fetchSoloItineraries();
    fetchColabItineraries();
  }, []);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!placesDeets || !placesDeetsId) {
        setPlaceDetails(null);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:5001/api/places/place/${placesDeetsId}`
        );
        setPlaceDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch place details:", error);
        setPlaceDetails(null);
      }
    };
    fetchPlaceDetails();
  }, [placesDeets, placesDeetsId]);

  useEffect(() => {
    console.log("Updated Itinerary:", selectedItinerary);
  }, [selectedItinerary]);

  // Fetch recommendations when selectedItinerary or itineraryIdnow changes
  useEffect(() => {
    if (selectedItinerary && itineraryIdnow) {
      fetchRecommendations(itineraryIdnow);
    }
  }, [selectedItinerary, itineraryIdnow]);

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

  const fetchColabUsers = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No token found. User not authenticated.");
      return;
    }
    if (!selectedItinerary || !selectedItinerary._id) {
      console.log("No selected itinerary or itinerary ID.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5001/api/itineraries/users/${selectedItinerary._id}`,
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
        if (Array.isArray(data.collaborators)) {
          const mappedUsers = data.collaborators.map((user) => ({
            ...user,
            id: user._id,
            displayName: user.isYou
              ? `${user.username} (You)`
              : user.role === "admin"
              ? `Admin - ${user.username}`
              : user.username,
          }));
          mappedUsers.sort((a, b) => {
            if (a.role === "admin") return -1;
            if (b.role === "admin") return 1;
            return 0;
          });
          setUsers(mappedUsers);
        } else {
          console.error(
            "Expected 'collaborators' to be an array, but got:",
            data
          );
        }
      } else {
        console.error("Error:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to fetch collaborators:", error);
    }
  };

  const handleDeleteUser = async (userId, isTargetAdmin) => {
    const token = localStorage.getItem("accessToken");
    const currentUserId = localStorage.getItem("userId");
    if (!token) {
      alert("No token found. User not authenticated.");
      return;
    }
    const isCurrentUserAdmin = users.some(
      (u) => u._id === currentUserId && u.role === "admin"
    );
    if (!isCurrentUserAdmin && isTargetAdmin) {
      alert("Admin cannot be removed.");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this user?"
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `http://localhost:5001/api/itineraries/${selectedItinerary._id}/remove-user/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        if (userId === currentUserId) {
          alert("You left the itinerary.");
          navigate("/dashboard");
        } else {
          alert("User removed successfully.");
        }
      } else {
        alert(data.message || "Error removing user.");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Something went wrong.");
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
    setitineraryIdnow(String(itineraryId));
    setSelectedOption(selected.collaborative ? "collaborative" : "solo");
    if (selected.city) {
      setCity(selected.city);
      fetchPlaces(selected.city);
    } else {
      console.error("❌ Error: City not found in itinerary");
      setRecommendations([]);
    }
    // Remove direct call to fetchRecommendations
  };

  const handleAddPlace = (placeId, placeName) => {
    if (!placeId || !itineraryIdnow || !placeName) {
      console.error("❌ Error: Missing itineraryId, placeId, or placeName.");
      alert("Error: Itinerary, Place ID, or Place Name is missing.");
      return;
    }
    console.log(
      "✅ Adding place to itinerary:",
      itineraryIdnow,
      "Place ID:",
      placeId,
      "Place Name:",
      placeName
    );
    addPlaceToItinerary(itineraryIdnow, placeId, placeName);
  };

  const handlePlaceClick = (placeId, placeName) => {
    console.log("Clicked Place ID and name:", placeId, placeName);
    setSelectedPlaceId(placeId);
  };

  const fetchPlaces = async (city, filter = "") => {
    try {
      console.log("Fetching places for city:", city, "with filter:", filter);
      const response = await axios.get(
        `http://localhost:5001/api/places/getplaces?city=${city}&filter=${filter}`
      );
      console.log("Fetched Places:", response.data);
      response.data.forEach((place, index) => {
        if (!place.fsq_id) {
          console.error(
            `❌ Error: Missing _id for place at index ${index}`,
            place
          );
        }
      });
      setAllPlaces(response.data);
      setPlaces(response.data);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setRatingError("User not authenticated");
        return;
      }
      let userId;
      try {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.user.id;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        setRatingError("Invalid or missing token");
        return;
      }
      if (userId) {
        try {
          const ratingsResponse = await axios.get(
            `http://localhost:5001/api/places/ratings/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Ratings response:", ratingsResponse.data);
          if (Array.isArray(ratingsResponse.data)) {
            const userRatings = ratingsResponse.data.reduce((acc, rating) => {
              acc[rating.place_id] = rating.rating;
              return acc;
            }, {});
            setRatings(userRatings);
          } else {
            console.warn(
              "No ratings found or invalid response:",
              ratingsResponse.data.message || ratingsResponse.data
            );
            setRatings({});
          }
        } catch (error) {
          console.error(
            "Error fetching ratings:",
            error.response?.data?.message || error.message
          );
          setRatingError(
            error.response?.data?.message || "Failed to fetch ratings"
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch places or ratings:", error);
      setRatingError(
        error.response?.data?.message || "Failed to fetch places or ratings"
      );
    }
  };

  useEffect(() => {
    if (selectedItinerary && itineraryIdnow && selectedItinerary.city) {
      fetchRecommendations(itineraryIdnow);
    } else {
      setRecommendations([]);
    }
}, [selectedItinerary, itineraryIdnow]);

const fetchRecommendations = async (itineraryId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No token found. User not authenticated.");
      setRecommendations([]);
      toast.error("User not authenticated. Please log in.");
      return;
    }
    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.user.id;
    } catch (error) {
      console.error("Error decoding token:", error.message);
      setRecommendations([]);
      toast.error("Invalid token. Please log in again.");
      return;
    }
    if (!itineraryId || !selectedItinerary?.city) {
      console.error("No itinerary ID or city provided for fetching recommendations.");
      setRecommendations([]);
      toast.error("Please select an itinerary with a valid city.");
      return;
    }
    try {
      console.log(
        `Fetching recommendations for user ${userId} with itinerary ${itineraryId} in ${selectedItinerary.city}`
      );
      const response = await axios.get(
        `http://localhost:5001/api/recommendations/recommendations/${userId}`,
        {
          params: {
            itineraryId,
            city: selectedItinerary.city,
            maxPerCategory: 3,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Recommendations response:", response.data);
      setRecommendations(response.data);
      toast.success("Recommendations fetched successfully!");
    } catch (error) {
      console.error("Error fetching recommendations:", {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        url: error.config?.url,
      });
      setRecommendations([]);
      toast.error(
        error.response?.data?.message || "Failed to fetch recommendations."
      );
    }
};


  const addPlaceToItinerary = async (itineraryIdnow, placeId, placeName) => {
    if (!itineraryIdnow || !placeId || !placeName) {
      console.error("❌ Error: Missing itineraryId, placeId, or placeName.");
      alert("Error: Itinerary, Place ID, or Place Name is missing.");
      return;
    }
    console.log("📌 Sending request to add place:");
    console.log("➡️ Itinerary ID:", itineraryIdnow);
    console.log("➡️ Place ID:", placeId);
    console.log("➡️ Place Name:", placeName);
    const url = `http://localhost:5001/api/itineraries/${itineraryIdnow}/places/${placeId}`;
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placeName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.message}`);
      }
      const data = await response.json();
      console.log("✅ Successfully added place:", data);
      if (data.itinerary) {
        setSelectedItinerary({ ...data.itinerary });
        setCheckedPlaces((prev) => ({
          ...prev,
          [placeId]: false,
        }));
        fetchRecommendations(itineraryIdnow);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert(`Failed to add place: ${error.message}`);
    }
  };

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
    fetchPlaces(city);
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user.id;
      const userBudget = "Standard";
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
          setColabItineraries((prev) => [...prev, newItinerary]);
        } else {
          setSoloItineraries((prev) => [...prev, newItinerary]);
        }
      } else {
        alert("❌ Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Failed to save itinerary.");
    }
  };

  const handleFieldUpdate = async (field, value) => {
    const confirmed = window.confirm(
      `Are you sure you want to update ${field} to "${value}"?`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(
        `http://localhost:5001/api/itineraries/${selectedItinerary._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Update successful!");
      } else {
        alert(`Update failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedOption) {
      alert("Please select an option");
      return;
    } else if (step === 2 && !city) {
      alert("Please select a city before proceeding.");
      return;
    } else if (step === 3 && (!takeoffDate || !touchdownDate)) {
      alert("Please enter dates before proceeding.");
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
    handleFieldUpdate("budget", newBudget);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedItinerary((prev) => ({
      ...prev,
      status: newStatus,
    }));
    handleFieldUpdate("status", newStatus);
  };

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
        setUsersList(data);
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

  useEffect(() => {
    if (collabTab && selectedItinerary?.collaborative) {
      fetchColabUsers();
    } else {
      setUsers([]);
    }
  }, [collabTab, selectedItinerary]);

  const sendInvitation = async (itineraryIdnow, receiverId) => {
    let isCancelled = false;
    const toastId = toast(
      (t) => (
        <div>
          <p>Sending invite in 5 seconds...</p>
          <button
            onClick={() => {
              isCancelled = true;
              toast.dismiss(t.id);
              toast.error("Invite cancelled");
            }}
            style={{
              background: "red",
              color: "white",
              padding: "5px",
              borderRadius: "5px",
              marginTop: "5px",
            }}
          >
            Cancel Invite
          </button>
        </div>
      ),
      { duration: 5000 }
    );
    setTimeout(async () => {
      if (isCancelled) return;
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("User not authenticated");
          return;
        }
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user._id : null;
        const response = await fetch("http://localhost:5001/api/invite/", {
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
        });
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
    }, 5000);
  };

  const handleRating = async (placeId, rating) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setRatingError("User not authenticated");
      setRatingSuccess(null);
      return;
    }
    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.user.id;
    } catch (error) {
      setRatingError("Invalid or missing token");
      setRatingSuccess(null);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5001/api/places/rate",
        {
          user_id: userId,
          place_id: placeId,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRatings((prev) => ({ ...prev, [placeId]: rating }));
      setRatingSuccess(response.data.message);
      setRatingError(null);
      if (itineraryIdnow) {
        fetchRecommendations(itineraryIdnow); // Refresh recommendations after rating
      }
    } catch (error) {
      setRatingError(
        error.response?.data?.message || "Failed to submit rating"
      );
      setRatingSuccess(null);
    }
};

const handleDeleteItinerary = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return;
  }
  if (!selectedItinerary || !itineraryIdnow) {
    toast.error("No itinerary selected.");
    return;
  }
  console.log("Attempting to delete itinerary with ID:", itineraryIdnow);
  const confirmDelete = window.confirm(
    `Are you sure you want to delete the itinerary "${selectedItinerary.title || "Untitled Itinerary"}"?`
  );
  if (!confirmDelete) return;
  try {
    const response = await fetch(
      `http://localhost:5001/api/itineraries/${itineraryIdnow}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Check Content-Type before parsing
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Received non-JSON response:", await response.text());
      toast.error("Server returned an unexpected response. Please try again.");
      return;
    }
    const data = await response.json();
    if (response.ok) {
      // Remove itinerary from state
      if (selectedItinerary.collaborative) {
        setColabItineraries((prev) =>
          prev.filter((itinerary) => itinerary.id !== itineraryIdnow)
        );
      } else {
        setSoloItineraries((prev) =>
          prev.filter((itinerary) => itinerary.id !== itineraryIdnow)
        );
      }
      // Clear selected itinerary
      setSelectedItinerary(null);
      setitineraryIdnow("");
      toast.success("Itinerary deleted successfully!");
      navigate("/dashboard");
    } else {
      if (response.status === 404) {
        toast.error("Itinerary not found. It may have been deleted already.");
      } else if (response.status === 403) {
        toast.error("Access denied: Only the admin can delete this itinerary.");
      } else {
        toast.error(data.message || "Failed to delete itinerary.");
      }
    }
  } catch (error) {
    console.error("Failed to delete itinerary:", error);
    toast.error("Something went wrong while deleting the itinerary.");
  }
};

  return (
    <div style={{ paddingBottom: "0", overflowX: "hidden" }}>
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
          zIndex: "1100",
          animation: "slideIn 0.6s ease-out",
        }}
      >
        <Logo />
        <Sidebar currentPath={window.location.pathname} />
      </nav>
      <Header title="My Itineraries" text="PLAN YOUR ITINERARIES HERE" />
      <button
        className="create-button"
        onMouseEnter={(e) =>
          (e.target.style.boxShadow = "0px 0px 15px rgb(162, 203, 221)")
        }
        onMouseLeave={(e) =>
          (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
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
                  color: "rgb(159, 192, 204)",
                  textShadow: "1px 1px 1px rgb(23, 71, 88)",
                }}
              >
                <div>
                  <input
                    type="radio"
                    name="myRadio"
                    value="solo"
                    required
                    style={{ accentColor: "lightblue", marginRight: "6px" }}
                    checked={selectedOption === "solo"}
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
                    style={{ accentColor: "lightblue", marginRight: "6px" }}
                    checked={selectedOption === "collaborative"}
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
                  style={{
                    backgroundColor: "rgb(104, 163, 189)",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0px 0px 18px rgb(204, 231, 243)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
                  }
                >
                  CANCEL
                </button>
                <button
                  onClick={handleNext}
                  className="create-box-buttons"
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0px 0px 15px rgb(162, 203, 221)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
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
                <div className="dropdown">
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
                        color: "rgb(162, 182, 189)",
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
                      "0px 0px 15px rgb(162, 203, 221)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
                  }
                >
                  BACK
                </button>
                <button
                  onClick={handleNext}
                  className="create-box-buttons"
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0px 0px 15px rgb(162, 203, 221)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
                  }
                >
                  NEXT
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="stepNum">Step 3 of 4:</h2>
              <h2 className="heading">Select Dates</h2>
              <p
                style={{
                  fontSize: "92%",
                  color: "rgb(140, 163, 172)",
                  textShadow: "1px 1px 1px rgb(23, 71, 88)",
                }}
              >
                <i>Enter estimated dates for your trip</i>
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  border: "1px solid rgb(126, 182, 204)",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "5%",
                }}
              >
                <div className="takeoff-container">
                  <span className="date-title">TAKEOFF</span>
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
                <div className="touchdown-container">
                  <span className="date-title">TOUCHDOWN</span>
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
                      "0px 0px 15px rgb(162, 203, 221)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
                  }
                >
                  BACK
                </button>
                <button
                  onClick={handleNext}
                  className="create-box-buttons"
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0px 0px 15px rgb(162, 203, 221)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
                  }
                >
                  NEXT
                </button>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2 className="stepNum">Step 4 of 4:</h2>
              <h2 className="heading">Set Name</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  placeItems: "center",
                  marginBottom: "5%",
                  color: "rgb(159, 192, 204)",
                  textShadow: "1px 1px 1px rgb(23, 71, 88)",
                }}
              >
                <div>
                  <input
                    type="radio"
                    name="myRadio"
                    value="nameIt"
                    required
                    style={{ accentColor: "lightblue", marginLeft: "8px" }}
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
                    style={{ accentColor: "lightblue", marginLeft: "8px" }}
                    checked={nameOption === "default"}
                    onChange={() => {
                      setNameOption("default");
                      setItineraryName(city);
                    }}
                  />
                  Default (City)
                </div>
              </div>
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
                      "0px 0px 15px rgb(162, 203, 221)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
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
                  style={{
                    backgroundColor: "rgb(104, 163, 189)",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.boxShadow =
                      "0px 0px 18px rgb(198, 236, 252)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.boxShadow = "1px 1px 3px rgb(36, 57, 66)")
                  }
                >
                  FINISH
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <section>
        <div className="itinerary-box">
          <div className="left-column">
            <div className="solo-itineraries">
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
                          console.log("Clicked Itinerary ID:", itinerary.id);
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
            <div className="collab-itineraries">
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
                          console.log("Clicked Itinerary ID:", itinerary.id);
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
                      gridTemplateRows: "10% 15% 1fr",
                      rowGap: "2px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 8% 7%",
                        margin: "15px 0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(10px, 3vw, 30px)",
                          color: "rgb(164, 208, 233)",
                          textShadow: "0px 0px 6px rgba(102, 187, 212, 0.8)",
                        }}
                      >
                        {selectedItinerary.title || "Untitled Itinerary"}
                      </div>
                      <div>
                        {selectedItinerary.collaborative && (
                          <img
                            src={usersss}
                            style={{
                              width: "clamp(50%, 4vw, 70%)",
                              padding: 0,
                              cursor: "pointer",
                            }}
                            onClick={() => setCollabTab(true)}
                          />
                        )}
                      </div>
                      {collabTab && <div className="overlay" />}
                      {collabTab && (
                        <div
                          className="users-box"
                          style={{
                            height: !addUser ? "26%" : "50%",
                            top: addUser ? "36%" : "26%",
                            padding: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateRows: "15% 1fr",
                              rowGap: "5px",
                              padding: "0.5rem",
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
                                  color: "rgb(204, 230, 236)",
                                  textShadow:
                                    "2px 2px 1px rgba(113, 147, 160, 0.71)",
                                  fontSize: "clamp(10px, 2.55vw, 25px)",
                                  padding: "1rem",
                                }}
                              >
                                COLLABORATORS
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  columnGap: "20px",
                                  placeContent: "center",
                                  alignContent: "center",
                                  marginTop: "10px",
                                }}
                              >
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
                                <div>
                                  <img
                                    src={back}
                                    style={{
                                      width: "105%",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setCollabTab(false), setAddUser(false);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div style={{ marginTop: "1px" }}>
                              <ul
                                style={{
                                  height: "85%",
                                  padding: "1rem 0",
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
                                          onClick={() =>
                                            handleDeleteUser(
                                              user._id,
                                              user.role === "admin"
                                            )
                                          }
                                        >
                                          <img
                                            src={userBye}
                                            style={{ width: "15px" }}
                                            alt="Remove user"
                                          />
                                        </button>
                                      </div>
                                      <div>{user.displayName}</div>
                                    </li>
                                  ))
                                ) : (
                                  <li
                                    style={{
                                      fontSize: "1.2vw",
                                      paddingTop: "10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    No users found
                                  </li>
                                )}
                              </ul>
                            </div>
                            {addUser && (
                              <>
                                <div
                                  style={{
                                    margin: "-10px 0 5px 0",
                                    fontSize: "130%",
                                    color: "rgb(194, 198, 199)",
                                    fontFamily: "P2P",
                                    fontWeight: "lighter",
                                    textShadow:
                                      "1px 1px 1px rgb(255, 255, 255, 0.5)",
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
                                      );
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
                                  {showDropdown && (
                                    <div
                                      className="dropdown"
                                      style={{
                                        width: "100%",
                                        maxHeight: "126px",
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        zIndex: 10,
                                        marginTop: "5px",
                                        boxShadow:
                                          "0px 4px 8px rgba(0,0,0,0.2)",
                                      }}
                                    >
                                      {usersList
                                        .filter((user) =>
                                          user.username
                                            .toLowerCase()
                                            .includes(searchText.toLowerCase())
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
                          onClick={handleDeleteItinerary}
                        >
                          <img
                            src={trash}
                            alt="Collaborative Trip"
                            style={{ width: "clamp(50%, 3vw, 70%)" }}
                          />
                        </button>
                      </div>
                    </div>
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
                    <div className="deets">
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
                            onBlur={(e) => {
                              setEditingDate(null);
                              if (selectedItinerary.startDate)
                                handleFieldUpdate(
                                  "startDate",
                                  selectedItinerary.startDate
                                );
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="dates">
                            {selectedItinerary.startDate
                              ? selectedItinerary.startDate
                              : "--/--/--"}
                          </div>
                        )}
                      </div>
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
                            onBlur={(e) => {
                              setEditingDate(null);
                              if (selectedItinerary.endDate)
                                handleFieldUpdate(
                                  "endDate",
                                  selectedItinerary.endDate
                                );
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="dates">
                            {selectedItinerary.endDate
                              ? selectedItinerary.endDate
                              : "--/--/--"}
                          </div>
                        )}
                      </div>
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
                            value="planning"
                            style={{ backgroundColor: "black", color: "white" }}
                          >
                            Planning
                          </option>
                          <option
                            value="in-progress"
                            style={{ backgroundColor: "black", color: "white" }}
                          >
                            Experiencing
                          </option>
                          <option
                            value="complete"
                            style={{ backgroundColor: "black", color: "white" }}
                          >
                            Completed
                          </option>
                        </select>
                      </div>
                      <div>
                        <div
                          style={{
                            textShadow: "1px 1px 5px rgb(0,0,0)",
                          }}
                        >
                          BUDGET
                        </div>
                        <button onClick={handleBudgetToggle} className="budget">
                          {selectedItinerary.budget}
                        </button>
                      </div>
                    </div>
                    <div
                      className={`itinerary-container ${
                        selectedItinerary.title !== selectedItinerary.city
                          ? "large"
                          : "extra-large"
                      }`}
                    >
                      <div style={{ display: "flex", alignItems: "start" }}>
                        <button
                          className="places-button"
                          onClick={() => setPlacesTab(true)}
                        >
                          <img
                            src={addPlaces}
                            style={{
                              width: "4%",
                              height: "auto",
                              boxShadow: "none",
                              marginRight: "1%",
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
                          className="places-container"
                          style={{
                            position: "absolute",
                            padding: "15px",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 10%",
                              columnGap: "10px",
                            }}
                          >
                            <div
                              className="stepNum"
                              style={{
                                fontSize: "clamp(20px, 2vw, 40px)",
                                marginBottom: "10px",
                                color: "rgb(136, 174, 196)",
                                textShadow:
                                  "2px 2px 1px rgba(15, 71, 88, 0.8)",
                              }}
                            >
                              ADD PLACES TO ITINERARY
                            </div>
                            <div>
                              <img
                                src={back}
                                style={{
                                  width: "60%",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setPlacesTab(false), setSelectedFilter(null);
                                }}
                              />
                            </div>
                          </div>
                          <div
                            className="filters"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "5px",
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              padding: "5px 0",
                              width: "100%",
                            }}
                          >
                            {selectedFilter && (
                              <button
                                onClick={() => clearFilter()}
                                className="filter-box"
                              >
                                <img src={clear} style={{ width: "10px" }} />
                                CLEAR
                              </button>
                            )}
                            {filters.map((filter) => (
                              <button
                                key={filter.id}
                                className="filter-option"
                                onClick={() => handleFilterClick(filter.id)}
                                style={{
                                  backgroundColor:
                                    selectedFilter === filter.id
                                      ? "rgb(75, 119, 148)"
                                      : "rgba(188, 220, 247, 0.8)",
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
                          {ratingError && (
                            <p style={{ color: "red", fontSize: "14px" }}>
                              {ratingError}
                            </p>
                          )}
                          {ratingSuccess && (
                            <p style={{ color: "green", fontSize: "14px" }}>
                              {ratingSuccess}
                            </p>
                          )}
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
                                    className="places-list-item"
                                  >
                                    <div
                                      style={{
                                        overflowX: "hidden",
                                        display: "flex",
                                        flexDirection: "row",
                                        alignContent: "center",
                                        flexWrap: "space-between",
                                      }}
                                    >
                                      <img
                                        src={addPlaces}
                                        style={{
                                          width: "5%",
                                          marginRight: "4px",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddPlace(
                                            place.fsq_id,
                                            place.name
                                          );
                                          handlePlaceClick(
                                            place.fsq_id,
                                            place.name
                                          );
                                        }}
                                      />
                                      {place.name}
                                    </div>
                                    <div
                                      style={{
                                        fontWeight: "lighter",
                                        textDecorationLine: "underline",
                                        color: "rgb(111, 147, 170)",
                                      }}
                                      onClick={() => {
                                        setPlacesDeets(true);
                                        setPlaceDeetsId(place.fsq_id);
                                      }}
                                    >
                                      view details
                                    </div>
                                    <div className="star-rating">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`star ${
                                            ratings[place.fsq_id] >= star
                                              ? "filled"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleRating(place.fsq_id, star)
                                          }
                                          style={{ cursor: "pointer" }}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
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
                      {placesDeets && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            zIndex: 1999,
                          }}
                          onClick={() => {
                            setPlacesDeets(false);
                            setPlaceDeetsId(null);
                          }}
                        />
                      )}
                      {placesDeets && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            right: placesDeets ? "-5px" : "-280px",
                            height: "100vh",
                            width: "400px",
                            transition: "right 1s ease-in-out",
                            backgroundColor: "rgb(0, 0, 0)",
                            borderRadius: "10px",
                            padding: "10px",
                            color: "white",
                            borderLeft: "dashed 3px rgb(77, 102, 112)",
                            zIndex: 2000,
                            display: "grid",
                            gridTemplateRows: "10% 40% 50%",
                            overflowY: "auto",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "clamp(16px, 2vw, 24px)",
                              fontWeight: "bold",
                              color: "rgb(164, 208, 233)",
                              textShadow:
                                "0px 0px 6px rgba(102, 187, 212, 0.8)",
                              textAlign: "center",
                              marginBottom: "10px",
                            }}
                          >
                            {placeDetails?.name || "Loading..."}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              padding: "10px",
                              borderBottom: "1px solid rgb(77, 102, 112)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "clamp(14px, 1.5vw, 18px)",
                                color: "rgb(136, 174, 196)",
                                textShadow:
                                  "1px 1px 2px rgba(15, 71, 88, 0.8)",
                              }}
                            >
                              PICTURES
                            </div>
                            {placeDetails?.photos?.length > 0 ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  overflowX: "auto",
                                  padding: "5px 0",
                                }}
                              >
                                {placeDetails.photos.map((photoUrl, index) => (
                                  <img
                                    key={index}
                                    src={photoUrl}
                                    alt={`Photo ${index + 1}`}
                                    style={{
                                      width: "150px",
                                      height: "100px",
                                      objectFit: "cover",
                                      borderRadius: "5px",
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: "gray", fontSize: "14px" }}>
                                No photos available.
                              </p>
                            )}
                          </div>
                          <div
                            style={{
                              padding: "10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "15px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "clamp(14px, 1.5vw, 18px)",
                                color: "rgb(136, 174, 196)",
                                textShadow:
                                  "1px 1px 2px rgba(15, 71, 88, 0.8)",
                              }}
                            >
                              DETAILS
                            </div>
                            <div>
                              <strong style={{ color: "rgb(191, 224, 243)" }}>
                                Address:
                              </strong>{" "}
                              {placeDetails?.address || "Not available"}
                            </div>
                            <div>
                              <strong style={{ color: "rgb(191, 224, 243)" }}>
                                Categories:
                              </strong>{" "}
                              {placeDetails?.categories?.length > 0
                                ? placeDetails.categories.join(", ")
                                : "Not available"}
                            </div>
                            <div>
                              <strong style={{ color: "rgb(191, 224, 243)" }}>
                                Coordinates:
                              </strong>{" "}
                              {placeDetails?.latitude && placeDetails?.longitude
                                ? `${placeDetails.latitude}, ${placeDetails.longitude}`
                                : "Not available"}
                            </div>
                            <div>
                              <strong style={{ color: "rgb(191, 224, 243)" }}>
                                Reviews:
                              </strong>
                              {placeDetails?.reviews?.length > 0 ? (
                                <ul
                                  style={{ margin: "5px 0", paddingLeft: "20px" }}
                                >
                                  {placeDetails.reviews.map((review, index) => (
                                    <li
                                      key={index}
                                      style={{
                                        fontSize: "14px",
                                        marginBottom: "5px",
                                        color: "rgb(200, 200, 200)",
                                      }}
                                    >
                                      {review}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p style={{ color: "gray", fontSize: "14px" }}>
                                  No reviews available.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: "2px",
                          color: "rgb(191, 224, 243)",
                          fontSize: "clamp(15px, 1.6vw, 18px)",
                          textShadow: "1px 1px 10px rgb(10, 56, 83)",
                        }}
                      >
                        PLACES TO VISIT
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
                              key={place.placeId}
                              style={{
                                display: "block",
                                margin: "5px 0",
                                textDecoration: checkedPlaces[place.placeId]
                                  ? "line-through"
                                  : "none",
                                color: checkedPlaces[place.placeId]
                                  ? "grey"
                                  : "white",
                                padding: "6px 0",
                                borderTop: "1px solid grey",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkedPlaces[place.placeId]}
                                onChange={() => handleCheckboxChange(place.placeId)}
                                style={{ marginRight: "5px" }}
                              />
                              {place.placeName || "Unnamed Place"}
                            </label>
                          ))
                        ) : (
                          <p>No places added yet.</p>
                        )}
                      </div>
                      <div
                        style={{
                          marginTop: "20px",
                          color: "rgb(191, 224, 243)",
                          fontSize: "clamp(15px, 1.6vw, 18px)",
                          textShadow: "1px 1px 10px rgb(10, 56, 83)",
                        }}
                      >
                        RECOMMENDED PLACES
                      </div>
                      <div
                        style={{
                          fontFamily: "Inter",
                          fontSize: "clamp(12px, 1.2vw, 20px)",
                          fontWeight: "bolder",
                        }}
                      >
                        {recommendations.length > 0 ? (
                          recommendations.map((place) => (
                            <div
                              key={place.fsq_id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                margin: "5px 0",
                                padding: "6px 0",
                                borderTop: "1px solid grey",
                              }}
                            >
                              <div>
                                <span>{place.name}</span>
                                <span
                                  style={{
                                    fontSize: "clamp(10px, 1vw, 14px)",
                                    color: "rgb(111, 147, 170)",
                                    marginLeft: "10px",
                                  }}
                                >
                                  - Categories:{" "}
                                  {place.categories?.join(", ") || "N/A"}
                                </span>
                              </div>
                              <img
                                src={addPlaces}
                                style={{
                                  width: "20px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleAddPlace(place.fsq_id, place.name)
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <p>Rate some places to get recommendations!</p>
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