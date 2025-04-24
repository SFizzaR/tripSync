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

      <Header title="Notifications" text="ACCEPT INVITATIONS TO JOIN" />

      <div className="itinerary-box">
      {notifications.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "18px",
              color: "gray",
            }}
          >
            No notifications available.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
            }}
          >
            {notifications.map((notif) => (
              <li
                key={notif._id} // Use unique ID instead of index
                style={{
                  backgroundColor: "rgb(230, 240, 250)",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "row", // Keep text and buttons in the same row
                  justifyContent: "space-between", // Text on left, buttons on right
                  alignItems: "center", // Align items vertically
                }}
              >
                <span>{notif.message}</span>

                {/* Buttons Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px", // Space between buttons
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#008000",
                      border: "none",
                      padding: "5px 10px",
                      color: "white",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                    onClick={() => handleAccept(notif)} // Pass notif object
                  >
                    Accept
                  </button>
                  <button
                    style={{
                      backgroundColor: "#ff0000",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      color: "white",
                      borderRadius: "4px",
                    }}
                    onClick={() => handleDecline(notif)} // Pass notif object
                  >
                    Decline
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
