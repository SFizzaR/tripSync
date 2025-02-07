import React, { useState } from "react";
import SignUpBg from "../assets/Login.jpg";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate for redirection


export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    city: "",
    age: "",
    password: "",
    confirmPassword: "",
  });

  const [ageWarning, setAgeWarning] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nextStep = () => setStep((prev) => (prev < 3 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, age: value }));
    if (value === "" || (!isNaN(value) && parseInt(value) >= 18)) {
      setAgeWarning("");
    } else {
      setAgeWarning("You must be 18 or older.");
    }
  };


const navigate = useNavigate();  // Initialize navigation

const handleSignUp = async () => { 
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
    } else {
        setError("");
    }

    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.age) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const response = await axios.post("http://localhost:5001/api/users/register", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: formData.age,
            city: formData.city || null,
        });

        if (response.status === 201) { 
            alert("Sign-up successful!");

            // ✅ Automatically log in the user after signup
            const loginResponse = await axios.post("http://localhost:5001/api/users/login", {
                email: formData.email,
                password: formData.password,
            });

            if (loginResponse.status === 200) {
                const { accessToken, user } = loginResponse.data;  // Ensure your backend returns the user object

                // ✅ Store token & user details in localStorage
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("user", JSON.stringify(user));

                // ✅ Redirect to dashboard
                navigate("/dashboard");
            } else {
                alert("Unexpected response during login.");
            }
        } else {
            alert("Unexpected response from the server during sign-up.");
        }
    } catch (error) {
        if (error.response) {
            alert(error.response.data.message || "An error occurred. Please try again.");
        } else if (error.request) {
            alert("Unable to connect to the server. Please check your internet connection.");
        } else {
            alert("An unexpected error occurred. Please try again.");
        }
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

        <img
          src={plane}
          style={{
            width: "40%",
            maxWidth: "250px",
            display: "block",
            position: "absolute",
            bottom: "-10px",
            right: "0px",
          }}
        />

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

        {step === 1 && (
          <div
            style={{
              width: "80%",
              maxWidth: "350px",
              fontFamily: "Inter",
              marginLeft: "-25px",
            }}
          >
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <label
                style={{
                  position: "absolute",
                  left: "10px",
                  top: formData.firstName ? "0px" : "65%",
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onFocus={(e) => (e.target.previousSibling.style.top = "4px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    e.target.previousSibling.style.top = "65%";
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

            <div style={{ position: "relative" }}>
              <label
                style={{
                  position: "absolute",
                  left: "10px",
                  top: formData.lastName ? "0px" : "65%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "0.2s ease all",
                  pointerEvents: "none",
                  marginTop: "0"
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onFocus={(e) => (e.target.previousSibling.style.top = "4px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    e.target.previousSibling.style.top = "65%";
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
            }}>LOGIN HERE</Link>
            </div>
                  
          </div>
        )}

        {step === 2 && (
          <div
            style={{
              width: "80%",
              maxWidth: "350px",
              fontFamily: "Inter",
              marginLeft: "-25px",
            }}
          >
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <label
                style={{
                  position: "absolute",
                  left: "10px",
                  top: formData.email ? "0px" : "65%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "0.2s ease all",
                  pointerEvents: "none",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={(e) => (e.target.previousSibling.style.top = "4px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    e.target.previousSibling.style.top = "65%";
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
                  top: formData.username ? "0px" : "65%",
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
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={(e) => (e.target.previousSibling.style.top = "4px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    e.target.previousSibling.style.top = "65%";
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 20%",
                columnGap: "40px",
                margin: "0",
              }}
            >
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: formData.city ? "0px" : "56%",
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
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onFocus={(e) => (e.target.previousSibling.style.top = "4px")}
                  onBlur={(e) => {
                    if (!e.target.value)
                      if (!ageWarning)
                        e.target.previousSibling.style.top = "56%";
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

              <div style={{ position: "relative", marginBottom: "10px" }}>
                <label
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: formData.age ? "0px" : "65%",
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
                  name="age"
                  value={formData.age}
                  onChange={handleAgeChange}
                  onFocus={(e) => (e.target.previousSibling.style.top = "4px")}
                  onBlur={(e) => {
                    if (!e.target.value)
                      if (!ageWarning)
                        e.target.previousSibling.style.top = "65%";
                      else e.target.previousSibling.style.top = "49%";
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

                <p
                  style={{
                    color: "white",
                    margin: "0",
                    fontSize: "10px",
                    visibility: ageWarning ? "visible" : "hidden",
                    height: ageWarning ? "20px" : "0px",
                    transition: "height 0.2s ease, visibility 0.2s ease",
                  }}
                  className="warning-text"
                >
                  {ageWarning}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div
            style={{
              width: "80%",
              maxWidth: "350px",
              fontFamily: "Inter",
              marginLeft: "-25px",
              marginTop: "20px",
            }}
          >
            <div style={{ position: "relative", marginBottom: "30px" }}>
              <label
                style={{
                  position: "absolute",
                  left: "10px",
                  top: formData.password ? "-12px" : "49%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "0.2s ease all",
                  pointerEvents: "none",
                }}
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={(e) => (e.target.previousSibling.style.top = "-12px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    e.target.previousSibling.style.top = "49%";
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
                }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "10px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: "20px" }}>
              <label
                style={{
                  position: "absolute",
                  left: "10px",
                  top: formData.confirmPassword ? "-12px" : "49%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "0.2s ease all",
                  pointerEvents: "none",
                }}
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={(e) => (e.target.previousSibling.style.top = "-12px")}
                onBlur={(e) => {
                  if (!e.target.value)
                    e.target.previousSibling.style.top = "49%";
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
                }}
              />
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "10px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {error && (
              <div
                style={{
                  color: "red",
                  fontSize: "14px",
                  marginBottom: "20px",
                  fontWeight: "bold",
                }}
              >
                {error}
              </div>
            )}
            <Link to="/dashboard">
                <button
                onClick={handleSignUp}
                style={{
                    width: "100%",
                    backgroundColor: "rgb(152, 226, 255)",
                    fontFamily: "Inter",
                    fontWeight: "bold",
                    padding: "10px 15px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    boxShadow: "1px 2px 2px rgb(0, 0, 0, 0.5)",
                    marginTop: "10px",
                    transition: "all 0.3s ease-in-out",
                    marginLeft: "10px",
                    cursor: "pointer",
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
                Submit
                </button>
            </Link>
          </div>
        )}

        <div style={{ marginTop: "10px", display: "flex", columnGap: "10px" }}>
          <button
            onClick={prevStep}
            disabled={step === 1}
            style={{
              backgroundColor:
                step === 1 ? "rgb(137, 149, 153)" : "rgb(152, 226, 255)",
              color: step === 1 ? "rgb(72, 74, 75)" : "black",
              fontFamily: "Inter",
              fontWeight: "bold",
              padding: "10px 15px",
              borderRadius: "10px",
              border: "none",
              fontSize: "18px",
              boxShadow: "1px 2px 2px rgb(0, 0, 0, 0.5)",
              marginTop: "22px",
              transition: "all 0.3s ease-in-out",
              cursor: step === 1 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (disabled) {
                // Do nothing when the button is disabled
                return;
              } else {
                e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (disabled) {
                // Do nothing when the button is disabled
                return;
              } else {
                (e.target.style.boxShadow = "1px 2px 2px rgb(0, 0, 0, 0.5)"),
                  (e.target.style.color = "black");
              }
            }}
          >
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={step === 3}
            style={{
              backgroundColor:
                step === 3 ? "rgb(137, 149, 153)" : "rgb(152, 226, 255)",
              color: step === 3 ? "rgb(72, 74, 75)" : "black",
              fontFamily: "Inter",
              fontWeight: "bold",
              padding: "10px 15px",
              borderRadius: "10px",
              border: "none",
              fontSize: "18px",
              boxShadow: "1px 2px 2px rgb(0, 0, 0, 0.5)",
              marginTop: "22px",
              transition: "all 0.3s ease-in-out",
              cursor: step === 3 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (disabled) {
                // Do nothing when the button is disabled
                return;
              } else {
                e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (disabled) {
                // Do nothing when the button is disabled
                return;
              } else {
                (e.target.style.boxShadow = "1px 2px 2px rgb(0, 0, 0, 0.5)"),
                  (e.target.style.color = "black");
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
