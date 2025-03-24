import React from 'react'
import logo from "../assets/plane.PNG";

const Logo = () => {
  return (
    <div>
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
    </div>
  )
}

export default Logo