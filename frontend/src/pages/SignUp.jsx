import React from "react";
import SignUpBg from "../assets/Login.jpg";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    setFirstName("");
    setLastName("");
    }, []);

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
        <img
          src={plane}
          style={{
            width: "30%",
            maxWidth: "200px",
            display: "block",
            marginTop: "-70px",
          }}
        />

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
        <div style={{ width: "80%", maxWidth: "300px", fontFamily: "Inter" }}>
          {/* First Name Field */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <label
              style={{
                position: "absolute",
                left: "10px",
                top: firstName ? "0px" : "65%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.7)",
                transition: "0.2s ease all",
                pointerEvents: "none",
              }}
            >
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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

          {/* Last Name Field */}
          <div style={{ position: "relative" }}>
            <label
              style={{
                position: "absolute",
                left: "10px",
                top: lastName ? "0px" : "65%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.7)",
                transition: "0.2s ease all",
                pointerEvents: "none",
              }}
            >
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
        </div>

        {/* Next Button */}
        <Link to="/register">
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
              marginTop: "22px",
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
            NEXT
          </button>
        </Link>

        <div style={{
          fontFamily: "Inter",
          fontSize: "15px",
          color: "white",
          margin: "30px 0 0 0",
        }}>Already have an account? <Link to="/login" style={{
          textDecoration: "none",
          fontFamily: "Inter",
          fontSize: "15px",
          color: "white",
          margin: "30px 0 0 0",
          fontWeight: "750"
        }}>LOGIN HERE</Link></div>
      </div>
    </div>
  );
}
