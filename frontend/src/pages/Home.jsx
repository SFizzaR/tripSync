import React from "react";
import { useState } from "react";
import Header from "../assets/headerBg.jpg";
import text from "../assets/Phonto.PNG";
import logo from "../assets/plane.PNG";
import plane from "../assets/icon.PNG";
import { Link } from "react-router-dom";
import "../font.css";
import Santorini from "../assets/santorini.jpeg";
import Reynisfjara from "../assets/Reynisfjara.jpg";
import Paris from "../assets/paris.jpg";
import Vancouver from "../assets/vancouver.jpg";
import Edinburgh from "../assets/edinburgh.jpg";
import singapore from "../assets/singapore.jpg";
import London from "../assets/london.jpg";
import KL from "../assets/KualaLumpur.jpg";
import sydney from "../assets/Sydney.jpg";

export default function Home() {
  const cards = [
    { id: 1, city: "Santorini", country: "GREECE", image: Santorini },
    { id: 2, city: "Reynisfjara", country: "ICELAND", image: Reynisfjara },
    { id: 3, city: "Paris", country: "FRANCE", image: Paris },
    { id: 4, city: "Vancouver", country: "CANADA", image: Vancouver },
    { id: 5, city: "Edinburgh", country: "SCOTLAND", image: Edinburgh },
    { id: 6, city: "Singapore", country: "SINGAPORE", image: singapore },
    { id: 7, city: "London", country: "UNITED KINGDOM", image: London },
    { id: 8, city: "Kuala Lumpur", country: "MALAYSIA", image: KL },
    { id: 9, city: "Sydney", country: "AUSTRALIA", image: sydney },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + cards.length) % cards.length
    );
  };

  return (
    <div style={{ paddingBottom: "100px" }}>
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
              color: "rgb(133, 187, 248)",
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
          }}
        >
          <Link to="/signup">
            <button
              className="buttons"
              style={{
                backgroundColor: "rgb(126, 190, 202)",
                fontFamily: "Inter",
                fontWeight: "bold",
                padding: "10px 15px",
                borderRadius: "10px",
                border: "none",
                fontSize: "20px",
                boxShadow: "0 2px 2px rgba(0, 0, 0, 0.5)",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => (
                (e.target.style.boxShadow =
                  "0px 0px 15px rgba(151, 201, 224, 0.85)"),
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
          backgroundColor: "rgb(114, 153, 179)",
          margin: "0",
          paddingLeft: "11%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "P2P",
            fontWeight: "lighter",
            color: "rgb(255, 255, 255, 0.8)",
            padding: "2% 0 1% 0",
            overflow: "hidden", // Ensures the typing effect works
            whiteSpace: "nowrap", // Prevents wrapping
            display: "inline-block", // Keeps text inline
            borderRight: "2px solid white", // Cursor effect
            fontSize: "2.5vw", // Adjust font size
            textShadow: "0 0 4px rgba(13, 99, 99, 0.96)",
            boxShadow: "0px 1px 2px rgb(114, 153, 179)",
            animation:
              "typing 4s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
          }}
        >
          YOUR ONE-STOP ITINERARY MANAGER
        </div>
      </section>

      {/* About Section */}
      <section
        className="about-section"
        style={{
          margin: "0",
          textAlign: "center",
          color: "white",
          padding: "0",
          animation: "slideInLeft 0.8s ease-out", // Slide-in effect for About section
        }}
      >
        <div
          style={{
            padding: "10px 5% 10px 5%",
            marginBottom: "50px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center", // Fixes alignment issue
              columnGap: "2px",
            }}
          >
            <img
              src={plane}
              alt="Plane Icon"
              style={{
                width: "9vw",
                display: "block",
                objectFit: "contain", // Prevents stretching
                margin: "6% 0 0 0",
              }}
            />
            <p
              style={{
                fontFamily: "P2P",
                fontWeight: "bold",
                color: "rgba(247, 253, 255, 0.86)",
                fontSize: "6.5vw",
                textAlign: "left",
                textShadow: "0 0 10px rgb(114, 153, 179)",
                margin: "8% -2px 2% 8px",
                padding: "7px 10px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "inline-block",
                animation: "flashing 1s infinite alternate",
              }}
            >
              ABOUT
            </p>
            <img
              src={plane}
              alt="Plane Icon"
              style={{
                width: "8vw",
                display: "block",
                margin: "6% 0 0 0",
                objectFit: "contain", // Prevents stretching
                transform: "scaleX(-1)", // Flips vertically
              }}
            />
          </div>

          <div
            className="AboutDeets"
            style={{
              fontFamily: "Arial",
              marginTop: "-20px",
              textShadow: "1px 1px 3px rgba(28, 111, 117, 0.5)",
              color: "rgb(140, 179, 204)",
              padding: "0px",
              fontSize: "2vw",
            }}
          >
            <p>
              <strong>TripSync</strong> is a cutting-edge itinerary creation and
              management platform designed to simplify travel planning with the
              power of AI. Whether you're embarking on{" "}
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

      <section
        style={{padding: "40px 2px" }}
      >
        <div
          style={{
            fontFamily: "P2P",
            fontWeight: "bold",
            color: "rgba(247, 253, 255, 0.86)",
            fontSize: "3.8vw",
            textAlign: "left",
            textShadow: "0 0 6px rgb(114, 153, 179)",
            marginTop: "2%",
            marginBottom: "2%",
            marginLeft: "8px",
            padding: "7px 5px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
            animation:
              "typing 4s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
          }}
        >
          PLAN YOUR NEXT TRIP TO...
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            position: "relative",
            top: "20px",
            margin: "-50px 0 0 0",
            marginTop: "-30px",
            padding: "0",
            height: "60vh",
            maxheight: "200px",
          }}
        >
          {/* Card Display */}
          <Link
            to="/signup"
            style={{
              width: "85%",
              maxWidth: "800px",
              height: "100%",
              backgroundImage: `url(${cards[currentIndex].image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "rgb(240, 238, 238)",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "start",
              borderRadius: "10px",
              padding: "8px",
              boxShadow: "2px 5px 8px rgb(114, 153, 179, 0.4)",
              transition: "transform 0.5s ease-in-out",
              textAlign: "center",
              borderStyle: "solid",
              borderColor: "rgb(255, 255, 255, 0.3)",
              borderWidth: "5px",
              textDecoration: "none",
            }}
          >
            <p
              style={{
                fontSize: "50px",
                fontFamily: "Significent",
                fontWeight: "200",
                textShadow: "0 1px 4px rgb(0, 0, 0, 1)",
                margin: "-10px 0 0 10px",
              }}
            >
              {cards[currentIndex].city}
            </p>

            <p
              style={{
                fontSize: "20px",
                fontFamily: "Inter",
                fontWeight: "800",
                margin: "-8px 0 0 15px",
                textShadow: "0 2px 4px rgb(0, 0, 0, 0.8)",
                letterSpacing: "2px",
                padding: "0 10px",
              }}
            >
              {cards[currentIndex].country}
            </p>
          </Link>

          {/* Navigation Arrows */}
          <button
            onClick={prevCard}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.3)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ❮
          </button>

          <button
            onClick={nextCard}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.3)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ❯
          </button>
        </div>
      </section>
    </div>
  );
}
