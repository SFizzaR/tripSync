import React from "react";
import { useState } from "react";
import Header from "../assets/headerBg.jpg";
import text from "../assets/Phonto.PNG";
import logo from "../assets/plane.PNG";
import plane from "../assets/divider1.PNG";
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
import collab from "../assets/art/collab.jpg";
import solo from "../assets/art/solo.jpg";
import { motion, AnimatePresence } from "framer-motion";
import cases from "../assets/art/cases.PNG";
import map from "../assets/art/map.PNG";
import planeart from "../assets/art/planeart.JPG";
import zaibo from "../assets/creators/zahab.jpg";
import fizzy from "../assets/creators/fizza.jpg";
import zehra from "../assets/creators/zehra.jpg";


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

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + cards.length) % cards.length
    );
  };

  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ paddingBottom: "50px" }}>
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
              width: "40%",
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
              fontSize: "300%",
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
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
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

      {/*DIVIDER*/}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src={map}
          style={{
            width: "60vw",
            margin: "0",
            marginTop: "3%",
            opacity: "0.7",
            position: "abssolute",
          }}
        />

        <img
          src={plane}
          style={{
            width: "65vw",
            margin: "0",
            marginTop: "3%",
            transform: "rotate(30deg)",
            position: "absolute",
            zIndex: "1",
            marginTop: "0",
          }}
        />
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
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center", // Fixes alignment issue
              columnGap: "2px",
            }}
          >
            <p
              style={{
                fontFamily: "P2P",
                fontWeight: "bold",
                color: "rgba(247, 253, 255, 0.86)",
                fontSize: "5.5vw",
                textAlign: "left",
                textShadow: "0 0 10px rgb(114, 153, 179)",
                margin: "3% -2px 2% 8px",
                padding: "7px 10px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "inline-block",
                animation: "flashing 1s infinite alternate",
              }}
            >
              ABOUT TRIPSYNC
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 30%" }}>
            <div
              className="AboutDeets"
              style={{
                fontFamily: "Montserrat",
                marginTop: "-10px",
                textShadow: "1px 1px 3px rgba(28, 111, 117, 0.5)",
                color: "rgb(167, 208, 233)",
                padding: "0px 5%",
                fontSize: "2vw",
                marginBottom: "0",
              }}
            >
              <p>
                <strong>TripSync</strong> is a cutting-edge itinerary creation
                and management platform designed to simplify travel planning
                with the power of AI. Whether you're embarking on{" "}
                <em>a solo adventure, a family getaway, or a business trip,</em>{" "}
                TripSync customizes itineraries tailored to your preferences,
                budget, and schedule.
              </p>
              <p>
                Say goodbye to tedious planning and hello to effortless journeys
                with TripSync—<strong>your ultimate travel companion!</strong>
              </p>
            </div>

            <div>
              <img
                src={cases}
                style={{ width: "100%", margin: "-30px", opacity: "0.75" }}
              />
            </div>
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
              width: "50vw",
              margin: "0 0 5% 0",
              transform: "rotate(15deg)",
            }}
          />
        </div>
      </section>

      <section style={{ padding: "20px 2px" }}>
        <div
          style={{
            fontFamily: "P2P",
            fontWeight: "bold",
            color: "rgba(247, 253, 255, 0.86)",
            fontSize: "3.6vw",
            textAlign: "left",
            textShadow: "0 0 12px rgb(155, 193, 218)",
            marginBottom: "2%",
            marginLeft: "3%",
            padding: "7px 12px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
            animation:
              "typing 3s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
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
            margin: "-30px 0 25px 0",
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
              height: "150%",
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

      <section>
        <div>
          <div
            style={{
              fontFamily: "P2P",
              fontWeight: "bold",
              color: "rgba(247, 253, 255, 0.86)",
              fontSize: "3.8vw",
              textAlign: "left",
              textShadow: "0 0 15px rgb(164, 199, 223)",
              marginTop: "5%",
              marginBottom: "2%",
              marginLeft: "3%",
              padding: "15px 15px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "inline-block",
              animation:
                "typing 3s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
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
            <p
              style={{
                fontFamily: "Montserrat",
                fontWeight: "bolder",
                color: "white",
                fontSize: "2.9vw",
                textShadow: "1px 1px 6px rgba(247, 253, 255, 0.5)",
              }}
            >
              Collaboratively with Friends!
            </p>

            <p
              style={{
                fontFamily: "Montserrat",
                fontWeight: "bolder",
                color: "white",
                fontSize: "3vw",
                textShadow: "1px 1px 6px rgba(247, 253, 255, 0.5)",
              }}
            >
              Or, for Solo Trips!
            </p>

            {/*Images with continuous animation */}
            <motion.div
              style={{ display: "flex", justifyContent: "center" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
              whileHover={{ scale: 1.1, rotate: -1 }}
            >
              <img
                src={collab}
                style={{
                  width: "80%",
                  borderStyle: "dotted",
                  borderWidth: "5px",
                  borderColor: "rgb(247,253, 255)",
                  borderRadius: "15px",
                  boxShadow: "0px 0px 20px rgba(0, 238, 255, 0.62)",
                }}
              />
            </motion.div>

            <motion.div
              style={{ display: "flex", justifyContent: "center" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
              whileHover={{ scale: 1.1, rotate: 1 }}
            >
              <img
                src={solo}
                style={{
                  width: "80%",
                  maxWidth: "450px",
                  borderStyle: "dotted",
                  borderWidth: "5px",
                  borderColor: "rgb(247,253, 255)",
                  borderRadius: "15px",
                  boxShadow: "0px 0px 20px rgba(0, 238, 255, 0.62)",
                }}
              />
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
              width: "50vw",
              margin: "5% 0 5% 0",
              transform: "scaleX(-1) rotate(20deg)",
            }}
          />
        </div>
      </section>

      {/*Mission Statement*/}
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
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center", // Fixes alignment issue
              columnGap: "2px",
            }}
          >
            <p
              style={{
                fontFamily: "P2P",
                fontWeight: "bold",
                color: "rgba(247, 253, 255, 0.86)",
                fontSize: "5vw",
                textAlign: "left",
                textShadow: "0 0 10px rgb(114, 153, 179)",
                margin: "3% -2px 2% 8px",
                padding: "7px 10px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "inline-block",
                animation: "flashing 1s infinite alternate",
              }}
            >
              MISSION STATEMENT
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "15% 1fr" }}>
            <div>
              <img
                src={planeart}
                style={{ width: "100%", margin: "0px 25px", opacity: "0.75" }}
              />
            </div>

            <div
              className="AboutDeets"
              style={{
                fontFamily: "Montserrat",
                marginTop: "-2.5%",
                textShadow: "1px 1px 3px rgba(28, 111, 117, 0.5)",
                color: "rgb(167, 208, 233)",
                padding: "0px 5%",
                fontSize: "2.1vw",
                marginBottom: "10%",
                marginLeft: "10px",
                textAlign: "left",
              }}
            >
              <p>
                <i>
                  "Our mission is to revolutionize travel planning by providing
                  an
                  <strong> intelligent, adaptive, and user-centric</strong>{" "}
                  itinerary management platform.
                </i>
              </p>
              <p>
                <i>
                  Leveraging AI-driven personalization, real-time weather-based
                  activity adjustments, and deep learning-powered perception
                  features, we aim to enhance the travel experience by ensuring
                  seamless, optimized, and enjoyable journeys.
                </i>
              </p>
              <p>
                <i>
                  Our platform empowers users with dynamic itinerary generation,
                  smart recommendations, and collaborative planning, making
                  every trip stress-free, efficient, and memorable."
                </i>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        {/* Button Transforms into Header */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: "50%",
              marginLeft: "26%",
              textAlign: "center",
              padding: "15px 10px",
              fontFamily: "P2P",
              fontWeight: "lighter",
              color: "white",
              textShadow: "0 0 10px rgb(170, 202, 224)",
              fontSize: "2.5vw",
              backgroundColor: "rgb(16, 50, 82)",
              borderStyle: "none",
              borderRadius: "10px",
              boxShadow: "0 0 15px rgba(166, 200, 228, 0.86)",
              transition: "all 0.2s ease-in-out",
              cursor: "pointer",
              zIndex: "1",
              whiteSpace: "nowrap"
            }}
            whileTap={{ scale: 0.98 }}
          >
            {expanded ? "MEET THE CREATORS" : "MEET THE CREATORS"}
          </motion.button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }} // Starts slightly above and hidden
                animate={{ opacity: 1, y: 0 }} // Smoothly slides down into view
                exit={{ opacity: 0, y: -20 }} // Slides back up when hidden
                transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth animation
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  placeItems: "center",
                  padding: "20px 15px 15px 20px",
                  fontFamily: "P2P",
                  fontWeight: "lighter",
                  color: "white",
                  columnGap: "2%",
                  borderStyle: "dotted",
                  borderRadius: "10px",
                  margin: "20px 5% 0 7%",
                  backgroundColor: "rgba(169, 184, 199, 0.65)",
                  fontSize: "2.5vw",
                  textAlign: "center",
                  marginBottom: "5%",
                  zIndex: "0"
                }}
              >
                {/* Creator 1 */}
                <div>
                  <img
                    src={zaibo}
                    style={{
                      width: "80%",
                      borderRadius: "30px",
                      borderStyle: "ridge",
                      boxShadow: "1px 1px 5px rgb(0, 0, 0, 0.5)",
                      marginLeft: "6%",
                      marginBottom: "5%",
                    }}
                  />
                </div>

                {/* Creator 2 */}
                <div>
                  <img
                    src={fizzy}
                    style={{
                      width: "80%",
                      borderRadius: "30px",
                      borderStyle: "ridge",
                      boxShadow: "1px 1px 5px rgb(0, 0, 0, 0.5)",
                      marginLeft: "6%",
                      marginBottom: "5%",
                    }}
                  />
                </div>

                {/* Creator 3 */}
                <div>
                  <img
                    src={zehra}
                    style={{
                      width: "80%",
                      borderRadius: "30px",
                      borderStyle: "ridge",
                      boxShadow: "1px 1px 5px rgb(0, 0, 0, 0.5)",
                      marginLeft: "6%",
                      marginBottom: "5%",
                    }}
                  />
                </div>

                <div>
                  <p
                    style={{
                      margin: "2%",
                      textShadow: "1px 1px 10px rgba(226, 71, 205, 0.5)",
                      color: "rgb(78, 8, 112)",
                    }}
                  >
                    Zahab Jahangir
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: "2%",
                      textShadow: "1px 1px 10px rgba(226, 71, 205, 0.5)",
                      color: "rgb(78, 8, 112)",
                    }}
                  >
                    Syeda Fizza
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: "2%",
                      textShadow: "1px 1px 10px rgba(226, 71, 205, 0.5)",
                      color: "rgb(78, 8, 112)",
                    }}
                  >
                    Zehra Waqar
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      marginTop: "5%",
                      textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
                      fontFamily: "P2P",
                      fontSize: "70%",
                      fontWeight: "lighter",
                    }}
                  >
                    Backend Developer
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      marginTop: "5%",
                      textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
                      fontFamily: "P2P",
                      fontSize: "70%",
                      fontWeight: "lighter",
                    }}
                  >
                    Lead Developer
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      marginTop: "5%",
                      textShadow: "1px 1px 3px rgb(0,0,0,0.6)",
                      fontFamily: "P2P",
                      fontSize: "70%",
                      fontWeight: "lighter",
                    }}
                  >
                    Frontend Developer
                  </p>
                </div>

                <div>
                  <a
                    href="https://www.linkedin.com/in/zahab-jahangir-11971623b/"
                    style={{
                      marginTop: "5%",
                      fontFamily: "Inter",
                      fontSize: "70%",
                      fontWeight: "bold",
                      color: "rgb(10, 37, 63)",
                      textDecoration: "none",
                    }}
                  >
                    Visit LinkedIn Profile ➡
                  </a>
                </div>

                <div>
                  <a
                    href="https://www.linkedin.com/in/syeda-fizza-2b66001b5/"
                    style={{
                      marginTop: "5%",
                      fontFamily: "Inter",
                      fontSize: "70%",
                      fontWeight: "bold",
                      color: "rgb(10, 37, 63)",
                      textDecoration: "none",
                    }}
                  >
                    Visit LinkedIn Profile ➡
                  </a>
                </div>

                <div>
                  <a
                    href="https://www.linkedin.com/in/zehra-waqar-4a553124b/"
                    style={{
                      marginTop: "5%",
                      fontFamily: "Inter",
                      fontSize: "70%",
                      fontWeight: "bold",
                      color: "rgb(10, 37, 63)",
                      textDecoration: "none",
                    }}
                  >
                    Visit LinkedIn Profile ➡
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>;

          
      </section>
    </div>
  );
}
