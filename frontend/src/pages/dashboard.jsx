import React from "react";
import Header from "../assets/headerBg.jpg";
import text from "../assets/Phonto.PNG";
import logo from "../assets/logo.PNG";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";
import "../font.css";

export default function Dashboard() {
  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: "0",
          width: "100%",
          backgroundColor: "rgb(37, 99, 104)",
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
              color: "rgb(133, 231, 248)",
              fontSize: "41px",
              letterSpacing: "1px",
              marginTop: "15%",
              display: "block",
              textShadow: "2px 2px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            tripsync
          </p>
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
            top: "52%",
            display: "inline",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "fadeIn 1s ease-in-out", // Fade-in effect for overlay text
          }}
        >
            <h1
            style={{
                fontFamily: "Significent",
                color: "white",
                fontSize: "0px",
                width: "100%",
                fontWeight: "100",
                textShadow: "1px 1px 5px rgb(0, 0, 0, 0.7)",
                whiteSpace: "nowrap"
            }}>Welcome, Stranger</h1>
        </div>
      </section>

      {/*ONE LINER*/}
      <section
        className="oneLiner"
        style={{
          backgroundColor: "rgb(2, 53, 59)",
          margin: "0",
          paddingLeft: "30%",
        }}
      >
        <div style={{
          textAlign: "center",
          fontFamily: "Inter",
          fontWeight: "bold",
          color: "white",
          padding: "10px 0",
          overflow: "hidden", // Ensures the typing effect works
          whiteSpace: "nowrap", // Prevents wrapping
          display: "inline-block", // Keeps text inline
          borderRight: "2px solid white", // Cursor effect
          fontSize: "4vw", // Adjust font size
          textShadow: "rgba(0, 0, 0, 0.5)",
          animation: "typing 2.5s steps(30, end), blink 0.5s step-end infinite",
        }}>WHERE TO NEXT?</div>
      </section>

      
    </div>
  );
}
