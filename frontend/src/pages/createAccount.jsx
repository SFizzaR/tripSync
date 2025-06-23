import React, { useState } from "react";
import SignUpBg from "../assets/Login.jpg";
import plane from "../assets/plane.PNG";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import toast, { Toaster } from "react-hot-toast";
import citiesData from "./citiesData";

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

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    username: false,
    city: false,
    age: false,
    password: false,
    confirmPassword: false,
  });

  const [ageWarning, setAgeWarning] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [filteredCities, setFilteredCities] = useState(citiesData);
  const [dropdownShow, setdropdownShow] = useState(false);
  const allCities = citiesData;

  const [mismatch, setMismatch] = useState(false);

  const nextStep = () => setStep((prev) => (prev < 3 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, city: value }));

    const filtered = allCities.filter((item) =>
      item.city.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCities(filtered);
    setdropdownShow(filtered.length > 0); // only show if matches found
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

  const navigate = useNavigate(); // Initialize navigation

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.age
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/users/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: formData.age,
          city: formData.city || null,
        }
      );

      toast.success("Sign-up successful!");

      const loginResponse = await axios.post(
        "http://localhost:5001/api/users/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (loginResponse.status === 200) {
        const { accessToken, ...user } = loginResponse.data;

        if (!accessToken || !user) {
          toast.error("Login failed. No user data received.");
          return;
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/dashboard");
      } else {
        toast.error("Unexpected response during login.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <>
      <Toaster />
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
            backgroundColor: "rgba(61, 61, 62, 0.2)",
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
                backgroundColor: "rgba(8, 49, 82, 0.34)",
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
                marginTop: "20px",
              }}
            >
              <div style={{ position: "relative", marginBottom: "20px" }}>
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
                  onFocus={(e) => {
                    e.target.previousSibling.style.top = "0px";
                    e.target.style.border = "3px solid rgb(4, 82, 113)";
                    setErrors((prev) => ({ ...prev, firstName: false }));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.previousSibling.style.top = "65%";
                      e.target.style.border = "2px solid white";
                    } else {
                      e.target.style.border = "3px solid rgb(175, 210, 224)";
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: errors.firstName
                      ? "3px solid rgb(194, 4, 4)"
                      : formData.firstName
                        ? "3px solid rgb(175, 210, 224)"
                        : "2px solid white",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    marginTop: "15px",
                    fontFamily: "Inter",
                  }}
                />

                {errors.firstName && (
                  <p
                    style={{
                      position: "absolute",
                      color: "rgb(193, 5, 5)",
                      fontFamily: "Inter",
                      textShadow: "1px 0px 1px rgb(167, 16, 16)",
                      fontWeight: "bold",
                      top: "50px",
                      fontSize: "1vw",
                    }}
                  >
                    <i>*required field</i>
                  </p>
                )}
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
                    marginTop: "0",
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={(e) => {
                    e.target.previousSibling.style.top = "0px";
                    e.target.style.border = "3px solid rgb(4, 82, 113)";
                    setErrors((prev) => ({ ...prev, lastName: false }));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.previousSibling.style.top = "65%";
                      e.target.style.border = "2px solid white";
                    } else {
                      e.target.style.border = "3px solid rgb(175, 210, 224)";
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: errors.lastName
                      ? "3px solid rgb(194, 4, 4)"
                      : formData.lastName
                        ? "3px solid rgb(175, 210, 224)"
                        : "2px solid white",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    marginTop: "15px",
                    fontFamily: "Inter",
                  }}
                />
                {errors.lastName && (
                  <p
                    style={{
                      position: "absolute",
                      color: "rgb(193, 5, 5)",
                      fontFamily: "Inter",
                      textShadow: "1px 0px 1px rgb(167, 16, 16)",
                      fontWeight: "bold",
                      top: "50px",
                      fontSize: "1vw",
                    }}
                  >
                    <i>*required field</i>
                  </p>
                )}
              </div>

              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: "17px",
                  color: "white",
                  margin: "30px 0 0 0",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    fontFamily: "Inter",
                    fontSize: "18px",
                    color: "white",
                    margin: "30px 0 0 0",
                    fontWeight: "750",
                    textShadow: "1px 1px 11px black",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.textShadow = "0px 0px 10px white")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.textShadow = "1px 1px 11px black")
                  }
                >
                  LOGIN HERE
                </Link>
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
                marginTop: "20px",
              }}
            >
              <div style={{ position: "relative", marginBottom: "25px" }}>
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
                  onFocus={(e) => {
                    e.target.previousSibling.style.top = "0px";
                    e.target.style.border = "3px solid rgb(4, 82, 113)";
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.previousSibling.style.top = "65%";
                      e.target.style.border = "2px solid white";
                    } else {
                      e.target.style.border = "3px solid rgb(175, 210, 224)";
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: formData.email
                      ? "3px solid rgb(175, 210, 224)"
                      : "2px solid white",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    marginTop: "15px",
                    fontFamily: "Inter",
                  }}
                />
              </div>

              <div style={{ position: "relative", marginBottom: "25px" }}>
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
                  onFocus={(e) => {
                    e.target.previousSibling.style.top = "0px";
                    e.target.style.border = "3px solid rgb(4, 82, 113)";
                    setErrors((prev) => ({ ...prev, username: false }));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.previousSibling.style.top = "65%";
                      e.target.style.border = "2px solid white";
                    } else {
                      e.target.style.border = "3px solid rgb(175, 210, 224)";
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: errors.username
                      ? "3px solid rgb(194, 4, 4)"
                      : formData.username
                        ? "3px solid rgb(175, 210, 224)"
                        : "2px solid white",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    marginTop: "15px",
                    fontFamily: "Inter",
                  }}
                />
                {errors.username && (
                  <p
                    style={{
                      position: "absolute",
                      color: "rgb(193, 5, 5)",
                      fontFamily: "Inter",
                      textShadow: "1px 0px 1px rgb(167, 16, 16)",
                      fontWeight: "bold",
                      top: "50px",
                      fontSize: "1vw",
                    }}
                  >
                    <i>*required field</i>
                  </p>
                )}
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
                    onChange={handleSearch}
                    onFocus={(e) => {
                      e.target.previousSibling.style.top = "0px";
                      e.target.style.border = "3px solid rgb(4, 82, 113)";
                      setErrors((prev) => ({ ...prev, city: false }));
                      if (formData.city) {
                        const filtered = allCities.filter((item) =>
                          item.city
                            .toLowerCase()
                            .includes(formData.city.toLowerCase())
                        );
                        setFilteredCities(filtered);
                        setdropdownShow(filtered.length > 0);
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.previousSibling.style.top = "56%";
                        e.target.style.border = "2px solid white";
                      } else {
                        e.target.style.border = "3px solid rgb(175, 210, 224)";
                      }
                      setdropdownShow(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: errors.city
                        ? "3px solid rgb(194, 4, 4)"
                        : formData.city
                          ? "3px solid rgb(175, 210, 224)"
                          : "2px solid white",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "15px",
                      fontFamily: "Inter",
                    }}
                  />
                  {errors.city && (
                    <p
                      style={{
                        position: "absolute",
                        color: "rgb(193, 5, 5)",
                        fontFamily: "Inter",
                        textShadow: "1px 0px 1px rgb(167, 16, 16)",
                        fontWeight: "bold",
                        top: "50px",
                        fontSize: "1vw",
                      }}
                    >
                      <i>*required field</i>
                    </p>
                  )}

                  {dropdownShow && filteredCities.length > 0 && (
                    <div
                      className="dropdown"
                      style={{ position: "absolute", width: "110%" }}
                    >
                      {filteredCities.map((item) => (
                        <div
                          key={item.city}
                          onClick={() => {
                            handleChange({
                              target: {
                                name: "city",
                                value: `${item.city}`,
                              },
                            });
                            setdropdownShow(false);
                          }}
                          style={{
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            borderBottom: "1px solid rgb(124, 126, 126)",
                            fontFamily: "Inter",
                            fontSize: "80%",
                            color: "rgb(162, 182, 189)",
                          }}
                        >
                          <span style={{ marginRight: "10px" }}>{item.flag}</span>
                          {item.city}, {item.country}
                        </div>
                      ))}
                    </div>
                  )}
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
                    onFocus={(e) => {
                      e.target.previousSibling.style.top = "0px";
                      e.target.style.border = "3px solid rgb(4, 82, 113)";
                      setErrors((prev) => ({ ...prev, age: false }));
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.previousSibling.style.top = "65%";
                        e.target.style.border = "2px solid white";
                      } else {
                        e.target.style.border = "3px solid rgb(175, 210, 224)";
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "16px",
                      borderRadius: "5px",
                      border: errors.age
                        ? "3px solid rgb(194, 4, 4)"
                        : formData.age
                          ? "3px solid rgb(175, 210, 224)"
                          : "2px solid white",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "white",
                      outline: "none",
                      marginTop: "15px",
                      fontFamily: "Inter",
                    }}
                  />
                  {errors.age && (
                    <p
                      style={{
                        position: "absolute",
                        color: "rgb(193, 5, 5)",
                        fontFamily: "Inter",
                        textShadow: "1px 0px 1px rgb(167, 16, 16)",
                        fontWeight: "bold",
                        top: "50px",
                        fontSize: "1vw",
                      }}
                    >
                      <i>*required field</i>
                    </p>
                  )}

                  <p
                    style={{
                      color: "white",
                      margin: "0",
                      fontSize: "10px",
                      position: "absolute",
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
                    top: formData.password ? "0px" : "65%",
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
                  onFocus={(e) => {
                    e.target.previousSibling.style.top = "0px";
                    e.target.style.border = "3px solid rgb(4, 82, 113)";
                    setErrors((prev) => ({ ...prev, password: false }));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.previousSibling.style.top = "65%";
                      e.target.style.border = "2px solid white";
                    } else {
                      e.target.style.border = "3px solid rgb(175, 210, 224)";
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: errors.confirmPassword
                      ? "3px solid rgb(194, 4, 4)"
                      : formData.confirmPassword
                        ? "3px solid rgb(175, 210, 224)"
                        : "2px solid white",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    marginTop: "15px",
                    fontFamily: "Inter",
                  }}
                />

                {errors.confirmPassword && (
                  <p
                    style={{
                      position: "absolute",
                      color: "rgb(193, 5, 5)",
                      fontFamily: "Inter",
                      textShadow: "1px 0px 1px rgb(167, 16, 16)",
                      fontWeight: "bold",
                      top: "50px",
                      fontSize: "1vw",
                    }}
                  >
                    <i>*required field</i>
                  </p>
                )}

                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "0%",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: "20px" }}>
                <label
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: formData.confirmPassword ? "-12px" : "65%",
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
                  onFocus={(e) => {
                    e.target.previousSibling.style.top = "0px";
                    e.target.style.border = "3px solid rgb(4, 82, 113)";
                    setErrors((prev) => ({ ...prev, confirmPassword: false }));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.previousSibling.style.top = "65%";
                      e.target.style.border = "2px solid white";
                    } else {
                      e.target.style.border = "3px solid rgb(175, 210, 224)";
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: errors.confirmPassword
                      ? "3px solid rgb(194, 4, 4)"
                      : formData.confirmPassword
                        ? "3px solid rgb(175, 210, 224)"
                        : "2px solid white",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    marginTop: "15px",
                    fontFamily: "Inter",
                  }}
                />

                {errors.confirmPassword && (
                  <p
                    style={{
                      position: "absolute",
                      color: "rgb(193, 5, 5)",
                      fontFamily: "Inter",
                      textShadow: "1px 0px 1px rgb(167, 16, 16)",
                      fontWeight: "bold",
                      top: "50px",
                      fontSize: "1vw",
                    }}
                  >
                    <i>*required field</i>
                  </p>
                )}

                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "0",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
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

              <button
                onClick={() => {
                  if (step === 3) {
                    const pwEmpty = !formData.password.trim();
                    const conpwEmpty = !formData.confirmPassword.trim();

                    if (pwEmpty || conpwEmpty) {
                      setErrors({
                        password: pwEmpty ? true : false,
                        confirmPassword: conpwEmpty ? true : false,
                      });

                      toast.error("Please fill all required fields!");
                      return;
                    } else {
                      if (formData.password !== formData.confirmPassword) {
                        toast.error("Passwords should match!");
                        setFormData((prev) => ({
                          ...prev,
                          password: "",
                          confirmPassword: "",
                        }));
                        return;
                      }
                    }

                    setErrors((prev) => ({
                      ...prev,
                      password: false,
                      confirmPassword: false,
                    }));

                    handleSignUp();

                  }
                }}
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
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0px 0px 15px rgb(152, 226, 225, 1)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "1px 2px 2px rgb(0, 0, 0, 0.5)";
                  e.target.style.color = "black";
                }}
              >
                Submit
              </button>
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
            >
              Back
            </button>

            <button
              onClick={() => {
                if (step === 1) {
                  const firstNameEmpty = !formData.firstName.trim();
                  const lastNameEmpty = !formData.lastName.trim();

                  if (firstNameEmpty || lastNameEmpty) {
                    setErrors({
                      firstName: !firstNameEmpty ? false : true,
                      lastName: !lastNameEmpty ? false : true,
                    });

                    toast.error("Please fill all required fields!");
                    return;
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      firstName: false,
                      lastName: false,
                    }));
                    nextStep();
                  }
                } else if (step === 2) {
                  const usernameEmpty = !formData.username.trim();
                  const cityEmpty = !formData.city.trim();
                  const ageEmpty = !formData.age.trim();

                  if (usernameEmpty || cityEmpty || ageEmpty) {
                    setErrors({
                      username: !usernameEmpty ? false : true,
                      city: !cityEmpty ? false : true,
                      age: !ageEmpty ? false : true,
                    });

                    toast.error("Please fill all required fields!");
                    return;
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      username: false,
                      city: false,
                      age: false,
                    }));
                    nextStep();
                  }
                } else {
                  nextStep();
                }
              }}
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
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
