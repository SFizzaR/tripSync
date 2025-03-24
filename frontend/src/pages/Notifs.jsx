import React from "react";
import { useState, useEffect } from "react";
import "../font.css";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Logo from "../components/logo";

function Notifs() {
  return (
    <div style={{ paddingBottom: "500px", marginTop: 0 }}>
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
        <Logo />

        {/* Navbar Buttons */}
        <Sidebar currentPath={window.location.pathname} />
      </nav>

      <Header
        title="Notifications"
        text="ACCEPT INVITATIONS TO JOIN"
      />

    </div>
  )
}

export default Notifs