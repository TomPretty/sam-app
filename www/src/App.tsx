import React, { useEffect, useState } from "react";
import * as Api from "./api";
import { User } from "./models";

const FETCH_USERS_INTERVAL_MS = 10_000;
const UPDATE_LOCATION_INTERVAL_MS = 10_000;

const App: React.FC = () => {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    Api.getUsers().then((users) => setUsers(users));

    const interval = setInterval(() => {
      Api.getUsers().then((users) => setUsers(users));
    }, FETCH_USERS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updateLocation: PositionCallback = (pos) => {
        Api.updateLocation({
          userId: "tom",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      };
      navigator.geolocation.getCurrentPosition(updateLocation);
    }, UPDATE_LOCATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Pokemon Faux</h1>
      <h2>Users</h2>
      <ul>
        {users?.map((user) => {
          const lat = parseFloat(user.loc.lat).toFixed(2);
          const lon = parseFloat(user.loc.lat).toFixed(2);

          return (
            <li key={user.id}>
              {user.id} ({lat}, {lon})
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default App;
