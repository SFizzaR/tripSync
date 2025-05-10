import React, { useState, useEffect } from "react";
import "../font.css";
import "./itinerary.css";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Logo from "../components/logo";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

function Notifs() {
  const [notifications, setNotifications] = useState([]); // State to store notifications

  const handleAccept = async (notification) => {
    const toastId = toast.loading("Accepting...");
    try {
      if (!notification?.invite_id) throw new Error("Invalid invite ID");

      // Debugging: Log invite_id before making the request
      console.log("Invite ID:", notification.invite_id);

      const response = await fetch(
        `http://localhost:5001/api/invite/accept/${notification.invite_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({}) // Try adding an empty body if needed
        }
      );

      // Debugging: Log the response details
      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) throw new Error(responseData.message || "Failed to accept invite");

      toast.success("Invite accepted!", { id: toastId });

      // Delete the notification after accepting the invite
      handleDelete(notification._id);


    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error(error.message, { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      if (!response.ok) throw new Error("Failed to delete notification");

      // ✅ Remove the notification from the state
      setNotifications((prevNotifs) =>
        prevNotifs.filter((notif) => notif._id !== id)
      );



    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDecline = async (notification) => {
    const toastId = toast.loading("Declining...");
    try {
      if (!notification?.invite_id) throw new Error("Invalid invite ID");

      const response = await fetch(
        `http://localhost:5001/api/invite/reject/${notification.invite_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to decline invite");
      handleDelete(notification._id);

      toast.success("Invite declined!", { id: toastId });
    } catch (error) {
      console.error("Error declining invite:", error);
      toast.error("Failed to decline invite", { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }
      const response = await fetch(
        "http://localhost:5001/api/notifications/recived",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data); // Update state with fetched notifications
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div
      style={{
        paddingBottom: "500px",
        marginTop: "0",
      }}
    >
      <Toaster />
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
          animation: "slideIn 0.6s ease-out",
        }}
      >
        <Logo />
        <Sidebar currentPath={window.location.pathname} />
      </nav>

      <Header title="Invites" text="ACCEPT INVITATIONS TO JOIN" />

      <div style={{
        border: "dashed 5px grey",
        position: "relative",
        width: "95%",
        maxWidth: "1200px",
        height: "110vw",
        maxHeight: "700px",
        borderColor: "rgba(217, 228, 231, 0.6)",
        margin: "20px auto",
        color: "white",
        borderRadius: "5px",
        backgroundColor: "rgb(0, 0, 0)",
        boxShadow: "0px 0px 10px rgba(6, 73, 106, 0.5)",
        fontFamily: '"Montserrat", sans-serif'
      }}>
      {notifications.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "18px",
              color: "gray",
            }}
          >
            No invites yet.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              padding: "0 1rem",
            }}
          >
            {notifications.map((notif) => (
              <li
                key={notif._id} // Use unique ID instead of index
                style={{
                  backgroundColor: "transparent",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "grid",
                  fontSize: "clamp(12px, 1.8vw, 20px)",
                  gridTemplateColumns: "1fr 30vw",
                  alignItems: "center",
                  columnGap: "10px",
                  borderBottom: "0.5px solid grey",
                  padding: "10px 0"
                }}
              >
                <span>{notif.message}</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "2vw", // Space between buttons
                    position: "center",
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#0bbe92",
                      border: "none",
                      color: "white",
                      fontFamily: "'Press Start 2P'",
                      cursor: "pointer",
                      borderRadius: "4px",
                      padding: "1.2vw",
                      fontSize: "clamp(5px, 1.6vw, 20px)",
                      width: "12vw",
                      textShadow: "0px 0px 10px black"
                    }}
                    onClick={() => handleAccept(notif)} // Pass notif object
                  >
                    ACCEPT
                  </button>
                  <button
                    style={{
                      backgroundColor: "#8b0404",
                      border: "none",
                      cursor: "pointer",
                      color: "white",
                      borderRadius: "4px",
                      fontFamily: "'Press Start 2P'",
                      cursor: "pointer",
                      borderRadius: "4px",
                      padding: "1.2vw",
                      fontSize: "clamp(5px, 1.6vw, 20px)",
                      width: "13vw",
                      textShadow: "0px 0px 10px black"
                    }}
                    onClick={() => handleDecline(notif)} // Pass notif object
                  >
                    DECLINE
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notifs;
