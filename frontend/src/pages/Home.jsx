import React from "react";
import { useState, useEffect } from "react";
import plane from "../assets/divider1.PNG";
import { Link } from "react-router-dom";
import Header from "../assets/headerBg.jpg";
import text from "../assets/Phonto.PNG";
import "../font.css";
import "./Home.css";
import Santorini from "../assets/santorini.jpeg";
import Reynisfjara from "../assets/Reynisfjara.jpg";
import Paris from "../assets/paris.jpg";
import Vancouver from "../assets/vancouver.jpg";
import Edinburgh from "../assets/edinburgh.jpg";
import singapore from "../assets/singapore.jpg";
import London from "../assets/london.jpg";
import KL from "../assets/KualaLumpur.jpg";
import sydney from "../assets/Sydney.jpg";
import collab from "../assets/art/collab.jpg";
import solo from "../assets/art/solo.jpg";
import { motion } from "framer-motion";
import cases from "../assets/art/cases.PNG";
import planeart from "../assets/art/planeart.JPG";
import Logo from "../components/logo";
import Creators from "../components/creator";

export default function Home() {
  const cards = [
    { id: 1, city: "Reynisfjara", country: "ICELAND", image: Reynisfjara },
    { id: 2, city: "Santorini", country: "GREECE", image: Santorini },
    { id: 3, city: "Paris", country: "FRANCE", image: Paris },
    { id: 4, city: "Vancouver", country: "CANADA", image: Vancouver },
    { id: 5, city: "Edinburgh", country: "SCOTLAND", image: Edinburgh },
    { id: 6, city: "Singapore", country: "SINGAPORE", image: singapore },
    { id: 7, city: "London", country: "UNITED KINGDOM", image: London },
    { id: 8, city: "Kuala Lumpur", country: "MALAYSIA", image: KL },
    { id: 9, city: "Sydney", country: "AUSTRALIA", image: sydney },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(window.innerWidth >= 1024);

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + cards.length) % cards.length
    );
  };

  useEffect(() => {
    const handleResize = () => {
      setIsFullScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="homepagescroll" style={{ paddingBottom: "50px" }}>
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
          height: "7%",
          boxShadow: "0 2px 3px rgba(0, 0, 0, 0.2)",
          zIndex: "1000",
          animation: "slideIn 0.6s ease-out",
        }}
      >
        {/* Logo Section */}
        <Logo />

        {/* Navbar Buttons */}
        <div
          style={{
            width: "30%",
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
              className="signup-button"
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
              SIGN UP
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
          paddingLeft: "7%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "P2P",
            fontWeight: "lighter",
            color: "rgb(255, 255, 255, 0.8)",
            padding: "2% 0 1% 0",
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
            borderRight: "2px solid white", // Cursor effect
            fontSize: "3.2vw", // Adjust font size
            textShadow: "0 0 4px rgba(13, 99, 99, 0.96)",
            boxShadow: "0px 1px 2px rgb(114, 153, 179)",
            animation:
              "typing 3s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
          }}
        >
          PERSONAL ITINERARY MANAGER
        </div>
      </section>

      {/* About Section */}
      <section className={isFullScreen ? "about-grid" : ""}>
        <div className="about-section">
          <div>
            <div
              style={{
                display: !isFullScreen ? "flex" : "block",
                justifyContent: "center",
                alignItems: "center", // Fixes alignment issue
                columnGap: !isFullScreen ? "2px" : 0,
              }}
            >
              <p className="flashing-text">ABOUT TRIPSYNC</p>
            </div>

            <div
              style={{
                display: !isFullScreen ? "grid" : "",
                gridTemplateColumns: !isFullScreen ? "1fr 30%" : "",
              }}
            >
              <div>
                <p className="aboutDeets">
                  <strong>TripSync</strong> is a cutting-edge itinerary creation
                  and management platform designed to simplify travel planning
                  with the power of AI. Whether you're embarking on{" "}
                  <em>
                    a solo adventure, a family getaway, or a business trip,
                  </em>{" "}
                  TripSync customizes itineraries tailored to your preferences,
                  budget, and schedule.
                </p>
                <p className="aboutDeets">
                  Say goodbye to tedious planning and hello to effortless
                  journeys with TripSync—
                  <strong>your ultimate travel companion!</strong>
                </p>
              </div>

              {!isFullScreen && (
                <div>
                  <img src={cases} className="cases-image" />
                </div>
              )}
            </div>
          </div>
        </div>

        {isFullScreen && (
          <>
            <div className="mission-section">
              <div>
                <div className="mission-header">
                  <p className="mission-title">MISSION STATEMENT</p>
                </div>

                <div
                  className="mission-content"
                  style={{
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  <div className="mission-details">
                    <p>
                      <i>
                        "Our mission is to revolutionize travel planning by
                        providing an
                        <strong>
                          {" "}
                          intelligent, adaptive, and user-centric
                        </strong>{" "}
                        itinerary management platform.
                      </i>
                    </p>
                    <p>
                      <i>
                        Leveraging AI-driven personalization, real-time
                        weather-based activity adjustments, and deep
                        learning-powered perception features, we aim to enhance
                        the travel experience by ensuring seamless, optimized,
                        and enjoyable journeys.
                      </i>
                    </p>
                    <p>
                      <i>
                        Our platform empowers users with dynamic itinerary
                        generation, smart recommendations, and collaborative
                        planning, making every trip stress-free, efficient, and
                        memorable."
                      </i>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <img src={cases} className="cases-image" />
            </div>
          </>
        )}
      </section>

      {/*DIVIDER*/}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div>
          <img
            src={plane}
            style={{
              width: "35vw",
              margin: "0 0 5% 0",
              transform: "rotate(15deg)",
            }}
          />
        </div>
      </section>

      <section
        style={{
          padding: "20px 2px",
        }}
      >
        <div className="typing-text">PLAN YOUR NEXT TRIP TO...</div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            position: "relative",
            top: "20px",
            margin: "-30px 0 25px 0",
            padding: "0",
            height: "60vh",
            maxheight: "200px",
          }}
        >
          {/* Card Display */}
          <Link
            to="/signup"
            className="card"
            style={{ backgroundImage: `url(${cards[currentIndex].image})` }}
          >
            <p className="cityname">{cards[currentIndex].city}</p>

            <p className="country">{cards[currentIndex].country}</p>
          </Link>

          {/* Navigation Arrows */}
          <button onClick={prevCard} className="arrow" style={{ left: "10px" }}>
            ❮
          </button>

          <button
            onClick={nextCard}
            className="arrow"
            style={{ right: "10px" }}
          >
            ❯
          </button>
        </div>
      </section>

      <section>
        <div>
          <div
            className="typing-text"
            style={{
              marginTop: "5%",
              padding: "15px 15px",
            }}
          >
            CREATE ITINERARIES...
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "auto auto",
              width: "100%",
              maxWidth: "1200px",
              margin: "auto",
              marginTop: "-5%",
              textAlign: "center",
              rowGap: "0px",
            }}
          >
            {/*Texts with continuous animation */}
            <p className="types">Collaboratively with Friends!</p>

            <p className="types">Or, for Solo Trips!</p>

            {/* Collab Image */}
            <motion.div
              className="motion-wrapper"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
              whileHover={{ scale: 1.1, rotate: -1 }}
            >
              <img src={collab} className="animated-image" alt="Collab" />
            </motion.div>

            {/* Solo Image */}
            <motion.div
              className="motion-wrapper"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
              whileHover={{ scale: 1.1, rotate: 1 }}
            >
              <img src={solo} className="animated-image" alt="Solo" />
            </motion.div>
          </div>
        </div>
      </section>

      {/*DIVIDER*/}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div>
          <img
            src={plane}
            style={{
              width: "35vw",
              margin: "5% 0 5% 0",
              transform: "scaleX(-1) rotate(20deg)",
            }}
          />
        </div>
      </section>

      {/*Mission Statement*/}
      {!isFullScreen && (
        <section className="mission-section">
          <div>
            <div className="mission-header">
              <p className="mission-title">MISSION STATEMENT</p>
            </div>

            <div className="mission-content">
              <div>
                <img src={planeart} className="mission-image" alt="Plane Art" />
              </div>

              <div className="mission-details">
                <p>
                  <i>
                    "Our mission is to revolutionize travel planning by
                    providing an
                    <strong>
                      {" "}
                      intelligent, adaptive, and user-centric
                    </strong>{" "}
                    itinerary management platform.
                  </i>
                </p>
                <p>
                  <i>
                    Leveraging AI-driven personalization, real-time
                    weather-based activity adjustments, and deep
                    learning-powered perception features, we aim to enhance the
                    travel experience by ensuring seamless, optimized, and
                    enjoyable journeys.
                  </i>
                </p>
                <p>
                  <i>
                    Our platform empowers users with dynamic itinerary
                    generation, smart recommendations, and collaborative
                    planning, making every trip stress-free, efficient, and
                    memorable."
                  </i>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Creators />
    </div>
  );
}
