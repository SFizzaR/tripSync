import React, { useState } from "react";
import SignUpBg from "../assets/Login.jpg";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [ageWarning, setAgeWarning] = useState("");

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setAge(e.target.value);
    if (value === "" || (!isNaN(value) && parseInt(value) >= 18)) {
      setAge(value);
      setAgeWarning("");
    } else {
      setAgeWarning("You must be 18 or older.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${SignUpBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        margin: "0",
        padding: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Blurred Box */}
      <div
        style={{
          width: "40%",
          maxWidth: "400px",
          minWidth: "400px",
          height: "95%",
          backgroundColor: "rgba(85, 175, 202, 0.2)",
          backdropFilter: "blur(5px)",
          borderRadius: "10px",
          boxShadow: "1px 2px 10px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Title */}
        <h1
          className="typewriter"
          style={{
            fontFamily: "Inter",
            fontSize: "40px",
            color: "#fff",
            margin: "0 0 5px 0",
            textShadow: "1px 2px 4px rgba(0, 0, 0, 0.6)",
          }}
        >
          REGISTER
        </h1>

        {/* Close Button */}
        <Link to="/">
          <button
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              backgroundColor: "rgba(8, 49, 82, 0.5)",
              color: "white",
              fontFamily: "Inter",
              fontWeight: "bold",
              fontSize: "20px",
              borderRadius: "10px",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = "0px 0px 15px rgb(0, 0, 0, 0.6)")
            }
            onMouseLeave={(e) =>
              (e.target.style.boxShadow = "1px 2px 2px rgb(0, 0, 0, 0.5)")
            }
          >
            X
          </button>
        </Link>

        {/* Input Fields */}
        <div style={{ width: "80%", maxWidth: "350px", fontFamily: "Inter", marginLeft: "-25px"}}>
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <label
              style={{
                position: "absolute",
                left: "10px",
                top: email ? "0px" : "65%", // Use `email` instead of `firstName`
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.7)",
                transition: "0.2s ease all",
                pointerEvents: "none",
              }}
            >
              Email Address
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
              onBlur={(e) => {
                if (!e.target.value) e.target.previousSibling.style.top = "65%";
              }}
              style={{
                width: "100%",
                padding: "15px 10px 5px 10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "2px solid white",
                backgroundColor: "rgba(0,0,0,0.2)",
                color: "white",
                outline: "none",
                marginTop: "20px",
              }}
            />
          </div>

          <div style={{ position: "relative", marginBottom: "20px" }}>
            <label
              style={{
                position: "absolute",
                left: "10px",
                top: username ? "0px" : "65%", // Replace firstName with username
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.7)",
                transition: "0.2s ease all",
                pointerEvents: "none",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
              onBlur={(e) => {
                if (!e.target.value) e.target.previousSibling.style.top = "65%";
              }}
              style={{
                width: "100%",
                padding: "15px 10px 5px 10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "2px solid white",
                backgroundColor: "rgba(0,0,0,0.2)",
                color: "white",
                outline: "none",
                marginTop: "20px",
              }}
            />
          </div>

          {/*GRID PATTERN: AGE AND CITY*/}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 20%",
              columnGap: "40px",
              margin: "0",
            }}
          >

            {/* City Field */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                position: "absolute",
                left: "10px",
                top: age ? "0px" : "56%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.7)",
                transition: "0.2s ease all",
                pointerEvents: "none",
                }}
              >
                City/Origin
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                onBlur={(e) => {
                if (!e.target.value)
                    if (!ageWarning) e.target.previousSibling.style.top = "56%";
                    else e.target.previousSibling.style.top = "44%";
                }}
                style={{
                  width: "100%",
                  padding: "15px 10px 5px 10px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: "2px solid white",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  color: "white",
                  outline: "none",
                  marginTop: "20px",
                }}
              />
            </div>

            {/* Age Field */}
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <label
                style={{
                  position: "absolute",
                  left: "10px",
                  top: age ? "0px" : "65%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "0.2s ease all",
                  pointerEvents: "none",
                }}
              >
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => handleAgeChange(e)} // Handles valid input
                onFocus={(e) => (e.target.previousSibling.style.top = "0px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    if (!ageWarning) e.target.previousSibling.style.top = "65%";
                    else e.target.previousSibling.style.top = "49%";
                }}
                style={{
                  width: "100%",
                  padding: "15px 10px 5px 10px",
                  fontSize: "16px",
                  fontFamily: "Arial",
                  borderRadius: "5px",
                  border: "2px solid white",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  color: "white",
                  outline: "none",
                  marginTop: "20px",
                }}
              />
              <p
                style={{
                  color: "white",
                  margin: "0",
                  fontSize: "10px",
                  visibility: ageWarning ? "visible" : "hidden", // Make sure space is reserved
                  height: ageWarning ? "20px" : "0px", // Prevent layout shift
                  transition: "height 0.2s ease, visibility 0.2s ease", // Smooth transition
                }}
                className="warning-text"
              >
                {ageWarning}
              </p>
            </div>

          </div>
        </div>

        {/* Next Button */}
        <Link to="/setpassword">
          <button
            className="buttons"
            style={{
              backgroundColor: "rgb(152, 226, 255)",
              fontFamily: "Inter",
              fontWeight: "bold",
              padding: "10px 15px",
              borderRadius: "10px",
              border: "none",
              fontSize: "18px",
              boxShadow: "1px 2px 2px rgb(0, 0, 0, 0.5)",
              marginTop: "22]px",
              transition: "all 0.3s ease-in-out",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (
              (e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)"),
              (e.target.style.color = "white")
            )}
            onMouseLeave={(e) => (
              (e.target.style.boxShadow = "1px 2px 2px rgb(0, 0, 0, 0.5)"),
              (e.target.style.color = "black")
            )}
          >
            REGISTER ACCOUNT
          </button>
        </Link>

        <img
          src={plane}
          style={{
            width: "30%",
            maxWidth: "200px",
            display: "block",
            position: "absolute",
            bottom: "-10px",
            right: "0px",
          }}
        />
      </div>
    </div>
  );
}
