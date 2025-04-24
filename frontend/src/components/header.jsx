import React from 'react'
import header from "../assets/headerBg.jpg";
import "../font.css";

const Header = ({ title, text }) => {
  return (
    <div>
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
                  src={header}
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
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: "fadeIn 1s ease-in-out", // Fade-in effect for overlay text
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "Significent",
                      color: "white",
                      fontSize: "clamp(60px, 12vw, 180px)",
                      fontWeight: "lighter",
                      padding: "20px",
                      overflow: "hidden",
                      textShadow: "1px 1px 5px rgb(0, 0, 0, 0.7)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </h1>
                </div>
              </section>
        
              {/*ONE LINER*/}
              <section
                className="oneLiner"
                style={{
                  backgroundColor: "rgb(114, 153, 179)",
                  margin: "0",
                  paddingLeft: "2%",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontFamily: "P2P",
                    fontWeight: "lighter",
                    color: "rgba(255, 255, 255, 0.8)",
                    padding: "2% 0 1% 0",
                    overflow: "hidden", // Ensures the typing effect works
                    whiteSpace: "nowrap", // Prevents wrapping
                    display: "inline-block", // Keeps text inline
                    borderRight: "2px solid white", // Cursor effect
                    fontSize: "3.5vw", // Adjust font size
                    textShadow: "0 0 4px rgba(13, 99, 99, 0.96)",
                    animation:
                      "typing 3s steps(30, end) infinite alternate, blink 0.5s step-end infinite",
                  }}
                >
                  {text}
                </div>
              </section>
    </div>
  )
}

export default Header