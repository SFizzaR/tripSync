import React from "react";
import { useState } from "react";
import Header from "../assets/headerBg.jpg";
import text from "../assets/Phonto.PNG";
import logo from "../assets/logo.PNG";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";
import "../font.css";
import Santorini from '../assets/santorini.jpeg';
import Hella from '../assets/hella.jpg';
import Paris from '../assets/paris.jpg';
import Vancouver from '../assets/vancouver.jpg';
import Edinburgh from '../assets/edinburgh.jpg';
import singapore from '../assets/singapore.jpg';
import London from '../assets/london.jpg';
import KL from '../assets/KualaLumpur.jpg';
import sydney from '../assets/Sydney.jpg'


export default function Home() {

  const cards = [
    { id: 1, city: "Santorini", country: "Greece", image: Santorini},
    { id: 2, city: "Hella", country: "Iceland", image: Hella},
    { id: 3, city: "Paris", country: "France", image: Paris},
    { id: 4, city: "Vancouver", country: "Canada", image: Vancouver},
    { id: 5, city: "Edinburgh", country: "Scotland", image: Edinburgh},
    { id: 6, city: "Singapore", country: "Singapore", image: singapore},
    { id: 7, city: "London", country: "United Kingdom", image: London},
    { id: 8, city: "Kuala Lumpur", country: "Malaysia", image: KL},
    { id: 9, city: "Sydney", country: "Australia", image: sydney}
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

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

        {/* Navbar Buttons */}
        <div
          style={{
            width: "200px",
            display: "flex",
            justifyContent: "end",
            alignContent: "center",
            marginRight: "30px",
            columnGap: "10px",
          }}
        >

          <Link to="/signup">
            <button
              className="buttons"
              style={{
                backgroundColor: "rgb(152, 226, 255)",
                fontFamily: "Inter",
                fontWeight: "bold",
                padding: "10px 15px",
                borderRadius: "10px",
                border: "none",
                fontSize: "20px",
                boxShadow: "1px 2px 2px rgb(0, 0, 0, 0.5)",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => (
                (e.target.style.boxShadow =
                  "0px 0px 15px rgb(152, 226, 225, 1)"),
                (e.target.style.color = "white")
              )}
              onMouseLeave={(e) => (
                (e.target.style.boxShadow = "1px 2px 2px rgb(0, 0, 0, 0.5)"),
                (e.target.style.color = "black")
              )}
            >
              SIGN IN
            </button>
          </Link>
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
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "fadeIn 1s ease-in-out", // Fade-in effect for overlay text
          }}
        >
          <img
            src={text}
            alt="Name"
            style={{
              width: "50vw",
              minWidth: "350px",
              height: "auto",
              marginLeft: "10px",
              opacity: "1",
            }}
          />
        </div>
      </section>

      {/*ONE LINER*/}
      <section
        className="oneLiner"
        style={{
          backgroundColor: "rgb(2, 53, 59)",
          margin: "0",
          paddingLeft: "10%",
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
        }}>YOUR ONE STOP ITINERARY MANAGER</div>
      </section>

      {/* About Section */}
      <section
        className="about-section"
        style={{
          backgroundColor: "rgb(23, 111, 122)",
          margin: "0",
          textAlign: "center",
          fontFamily: "sans-serif",
          color: "white",
          padding: "0",
          animation: "slideInLeft 0.8s ease-out", // Slide-in effect for About section
        }}
      >
        <div
          style={{
            padding: "10px 10px 10px 10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              columnGap: "10px",
            }}
          >
            <p
              style={{
                display: "block",
                fontFamily: "Significent",
                fontSize: "8vw",
                fontWeight: "lighter",
                textShadow: "2px 3px 2px rgb(3, 48, 51)",
                padding: "0",
                margin: "0 0 15px",
                letterSpacing: "1px",
                opacity: "0.9",
                paddingBottom: "10px",
                fontWeight: "200px"
              }}
            >
              About
            </p>
            <img
              src={plane}
              style={{
                width: "16vw",
                display: "block",
              }}
            />
          </div>

          <div
            className="AboutDeets"
            style={{
              fontFamily: "Inter",
              marginTop: "-25px",
              textShadow: "2px 3px 2px rgb(5, 72, 77)",
              padding: "0px",
              fontSize: "2vw",
            }}
          >
            <p>
              <strong>TripSync</strong> is a cutting-edge itinerary creation and
              management platform designed to simplify travel planning with the
              power of AI.
            </p>
            <p>
              Whether you're embarking on{" "}
              <em>a solo adventure, a family getaway, or a business trip,</em>{" "}
              TripSync customizes itineraries tailored to your preferences,
              budget, and schedule.
            </p>
            <p>
              Say goodbye to tedious planning and hello to effortless journeys
              with TripSync—<strong>your ultimate travel companion!</strong>
            </p>
          </div>
        </div>
      </section>

      <section>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          position: "relative",
          width: "100%",
          top: "20px"
        }}>
          {/* Card Display */}
          <div style={{
            width: "75%",
            maxWidth:"500px",
            height: "400px",
            backgroundImage: 'URL(${cards[currentIndex].image})',
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "start",
            borderRadius: "10px",
            padding: "6px",
            boxShadow: "2px 5px 8px rgba(0, 0, 0, 0.4)",
            transition: "transform 0.5s ease-in-out",
            textAlign: "center"
          }}>
            <p style={{ 
              fontSize: "50px",
              fontFamily: "Significent",
              fontWeight: "200",
              textShadow: "1px 2px 3px rgb(0, 0, 0, 0.1)",
              margin: "0 0 0 15px" 
            }}>{cards[currentIndex].city}</p>

            <p style={{ 
              fontSize: "20px",
              fontFamily: "Inter",
              fontWeight: "800",
              margin: "-10px 0 0 30px", 
              textShadow: "0 2px 2px rgb(0, 0, 0, 0.2)",
              padding: "0 10px" 
            }}>{cards[currentIndex].country}</p>
          </div>

          {/* Navigation Arrows */}
          <button onClick={prevCard} style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            fontSize: "18px"
          }}>❮</button>

          <button onClick={nextCard} style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            fontSize: "18px"
          }}>❯</button>
        </div>
      </section>
    </div>
  );
}
