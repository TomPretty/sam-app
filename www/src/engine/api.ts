import * as z from "zod";
import { isProd } from "./env";

export interface User {
  id: string;
  loc: {
    lat: string;
    lon: string;
  };
}

export interface UpdateLocationBody {
  userId: string;
  lat: number;
  lon: number;
}

const UsersSchema = z.array(
  z.object({
    id: z.string(),
    loc: z.object({
      lat: z.string(),
      lon: z.string(),
    }),
  })
);

const API_BASE_URL = isProd
  ? "https://1uelxo5nwl.execute-api.eu-west-1.amazonaws.com/Prod/"
  : "http://localhost:3000/";
const GET_USERS_URL = API_BASE_URL + "users";
const UPDATE_CURRENT_LOCATION_URL = API_BASE_URL + "current-location";

export async function getUsers(): Promise<User[]> {
  const response = await fetch(GET_USERS_URL);
  const data: unknown = await response.json();

  return UsersSchema.parse(data);
}

export function updateLocation(body: UpdateLocationBody): Promise<Response> {
  return fetch(UPDATE_CURRENT_LOCATION_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
