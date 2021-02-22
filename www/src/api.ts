import { User, UsersSchema } from "./models";

const API_BASE_URL =
  "https://1uelxo5nwl.execute-api.eu-west-1.amazonaws.com/Prod/";

const GET_USERS_URL = API_BASE_URL + "users";
const UPDATE_CURRENT_LOCATION_URL = API_BASE_URL + "current-location";

export async function getUsers(): Promise<User[]> {
  const response = await fetch(GET_USERS_URL);
  const data: unknown = await response.json();

  return UsersSchema.parse(data);
}

interface UpdateLocationBody {
  userId: string;
  lat: number;
  lon: number;
}

export function updateLocation(body: UpdateLocationBody) {
  return fetch(UPDATE_CURRENT_LOCATION_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
