import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Logo from "../components/logo";
import toast, { Toaster } from "react-hot-toast";
import LoginBg from "../assets/Login.jpg";
import plane from "../assets/plane.PNG";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../font.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("username");
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch userId from token and user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in to view your profile.");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const id = decoded.user.id;
        if (!id) {
          toast.error("Invalid token. Please log in again.");
          return;
        }
        setUserId(id);

        const response = await axios.get(
          `http://localhost:5001/api/users/getUser/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("data from backend: ",response.data)
        setUsername(response.data.username || "");
        setCity(response.data.city || "");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, );

  // Handle username update
  const handleUsernameUpdate = async () => {
    if (!newUsername) {
      toast.error("Please enter a new username.");
      return;
    }
    if (newUsername === username) {
      toast.error("New username must be different.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(
        `http://localhost:5001/api/users/updateUsername/${userId}`,
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsername(newUsername);
      setNewUsername("");
      localStorage.setItem("username", newUsername);
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      toast.success("Username updated successfully!");
    } catch (error) {
      console.error("Failed to update username:", error);
      toast.error(error.response?.data?.error || "Failed to update username.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(
        `http://localhost:5001/api/users/updatePassword/${userId}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error(error.response?.data?.error || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle city update
  const handleCityUpdate = async () => {
    if (!city) {
      toast.error("Please enter a city.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(
        `http://localhost:5001/api/users/updateCity/${userId}`,
        { city },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("City updated successfully!");
    } catch (error) {
      console.error("Failed to update city:", error);
      toast.error(error.response?.data?.error || "Failed to update city.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${LoginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        margin: "0",
        padding: "0",
        fontFamily: "Inter",
      }}
    >
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
      
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "100px",
          paddingBottom: "20px",
        }}
      >
        <div
          style={{
            width: "40%",
            maxWidth: "400px",
            minWidth: "400px",
            backgroundColor: "rgba(85, 175, 202, 0.2)",
            backdropFilter: "blur(5px)",
            borderRadius: "10px",
            boxShadow: "1px 2px 10px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1
            style={{
              fontFamily: "Inter",
              fontSize: "40px",
              color: "#fff",
              margin: "0 0 10px 0",
              textShadow: "1px 2px 4px rgba(0, 0, 0, 0.6)",
            }}
          >
            PROFILE
          </h1>
          <div
            style={{
              display: "flex",
              width: "80%",
              marginBottom: "20px",
              justifyContent: "space-between",
            }}
          >
            <button
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor:
                  activeTab === "username"
                    ? "rgb(152, 226, 255)"
                    : "rgba(0, 0, 0, 0.2)",
                color: activeTab === "username" ? "black" : "white",
                border: "none",
                borderRadius: "5px",
                marginRight: "5px",
                fontFamily: "Inter",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.5)",
              }}
              onClick={() => setActiveTab("username")}
              onMouseEnter={(e) =>
                (e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)")
              }
              onMouseLeave={(e) =>
                (e.target.style.boxShadow = "1px 2px 2px rgba(0, 0, 0, 0.5)")
              }
            >
              Username
            </button>
            <button
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor:
                  activeTab === "password"
                    ? "rgb(152, 226, 255)"
                    : "rgba(0, 0, 0, 0.2)",
                color: activeTab === "password" ? "black" : "white",
                border: "none",
                borderRadius: "5px",
                marginRight: "5px",
                fontFamily: "Inter",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.5)",
              }}
              onClick={() => setActiveTab("password")}
              onMouseEnter={(e) =>
                (e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)")
              }
              onMouseLeave={(e) =>
                (e.target.style.boxShadow = "1px 2px 2px rgba(0, 0, 0, 0.5)")
              }
            >
              Password
            </button>
            <button
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor:
                  activeTab === "city" ? "rgb(152, 226, 255)" : "rgba(0, 0, 0, 0.2)",
                color: activeTab === "city" ? "black" : "white",
                border: "none",
                borderRadius: "5px",
                fontFamily: "Inter",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.5)",
              }}
              onClick={() => setActiveTab("city")}
              onMouseEnter={(e) =>
                (e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)")
              }
              onMouseLeave={(e) =>
                (e.target.style.boxShadow = "1px 2px 2px rgba(0, 0, 0, 0.5)")
              }
            >
              City
            </button>
          </div>
          <div
            style={{
              width: "80%",
              maxWidth: "350px",
              fontFamily: "Inter",
            }}
          >
            {activeTab === "username" && (
              <div>
                <p
                  style={{
                    color: "white",
                    marginBottom: "10px",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Current Username: <strong>{username}</strong>
                </p>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: newUsername ? "0px" : "65%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.7)",
                      transition: "0.2s ease all",
                      pointerEvents: "none",
                    }}
                  >
                    New Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                    onBlur={(e) => {
                      if (!e.target.value)
                        e.target.previousSibling.style.top = "65%";
                    }}
                    style={{
                      width: "100%",
                      padding: "15px 10px 5px 10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: "2px solid white",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "20px",
                    }}
                    disabled={loading}
                  />
                </div>
                <button
                  style={{
                    backgroundColor: "rgb(152, 226, 255)",
                    fontFamily: "Inter",
                    fontWeight: "bold",
                    padding: "10px 15px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.5)",
                    marginTop: "20px",
                    transition: "all 0.3s ease-in-out",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow =
                      "0px 0px 15px rgb(152, 226, 225, 1)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "1px 2px 2px rgba(0, 0, 0, 0.5)";
                    e.target.style.color = "black";
                  }}
                  onClick={handleUsernameUpdate}
                  disabled={loading || !userId}
                >
                  {loading ? "Updating..." : "Update Username"}
                </button>
              </div>
            )}
            {activeTab === "password" && (
              <div>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: currentPassword ? "0px" : "65%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.7)",
                      transition: "0.2s ease all",
                      pointerEvents: "none",
                    }}
                  >
                    Current Password
                  </label>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                    onBlur={(e) => {
                      if (!e.target.value)
                        e.target.previousSibling.style.top = "65%";
                    }}
                    style={{
                      width: "100%",
                      padding: "15px 10px 5px 10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: "2px solid white",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "20px",
                    }}
                    disabled={loading}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      right: "0",
                      marginTop: "10px",
                    }}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: newPassword ? "0px" : "65%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.7)",
                      transition: "0.2s ease all",
                      pointerEvents: "none",
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                    onBlur={(e) => {
                      if (!e.target.value)
                        e.target.previousSibling.style.top = "65%";
                    }}
                    style={{
                      width: "100%",
                      padding: "15px 10px 5px 10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: "2px solid white",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "20px",
                    }}
                    disabled={loading}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      right: "0",
                      marginTop: "10px",
                    }}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: confirmPassword ? "0px" : "65%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.7)",
                      transition: "0.2s ease all",
                      pointerEvents: "none",
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                    onBlur={(e) => {
                      if (!e.target.value)
                        e.target.previousSibling.style.top = "65%";
                    }}
                    style={{
                      width: "100%",
                      padding: "15px 10px 5px 10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: "2px solid white",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "20px",
                    }}
                    disabled={loading}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      right: "0",
                      marginTop: "10px",
                    }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                <button
                  style={{
                    backgroundColor: "rgb(152, 226, 255)",
                    fontFamily: "Inter",
                    fontWeight: "bold",
                    padding: "10px 15px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.5)",
                    marginTop: "20px",
                    transition: "all 0.3s ease-in-out",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow =
                      "0px 0px 15px rgb(152, 226, 225, 1)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "1px 2px 2px rgba(0, 0, 0, 0.5)";
                    e.target.style.color = "black";
                  }}
                  onClick={handlePasswordUpdate}
                  disabled={loading || !userId}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}
            {activeTab === "city" && (
              <div>
                <p
                  style={{
                    color: "white",
                    marginBottom: "10px",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Current City: <strong>{city || "Not set"}</strong>
                </p>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <label
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: city ? "0px" : "65%",
                      transform: "translateY(-50%)",
                      color: "rgba(255, 255, 255, 0.7)",
                      transition: "0.2s ease all",
                      pointerEvents: "none",
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                    onBlur={(e) => {
                      if (!e.target.value)
                        e.target.previousSibling.style.top = "65%";
                    }}
                    style={{
                      width: "100%",
                      padding: "15px 10px 5px 10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: "2px solid white",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "20px",
                    }}
                    disabled={loading}
                  />
                </div>
                <button
                  style={{
                    backgroundColor: "rgb(152, 226, 255)",
                    fontFamily: "Inter",
                    fontWeight: "bold",
                    padding: "10px 15px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.5)",
                    marginTop: "20px",
                    transition: "all 0.3s ease-in-out",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow =
                      "0px 0px 15px rgb(152, 226, 225, 1)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "1px 2px 2px rgba(0, 0, 0, 0.5)";
                    e.target.style.color = "black";
                  }}
                  onClick={handleCityUpdate}
                  disabled={loading || !userId}
                >
                  {loading ? "Updating..." : "Update City"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}