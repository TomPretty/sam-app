import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

const API_BASE_URL =
  "https://1uelxo5nwl.execute-api.eu-west-1.amazonaws.com/Prod/";

const GET_USERS_URL = API_BASE_URL + "users";
const UPDATE_CURRENT_LOCATION_URL = API_BASE_URL + "current-location";

function App() {
  useEffect(() => {
    fetch(GET_USERS_URL)
      .then((response) => response.json())
      .then((data) => console.log(data));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const updateLocation: PositionCallback = (pos) => {
        const body = {
          userId: "tom",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

        fetch(UPDATE_CURRENT_LOCATION_URL, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      };
      navigator.geolocation.getCurrentPosition(updateLocation);
    }, 5000);

    return () => clearInterval(interval);
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
