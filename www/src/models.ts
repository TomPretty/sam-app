import * as z from "zod";

export interface User {
  id: string;
  loc: {
    lat: string;
    lon: string;
  };
}

export const UsersSchema = z.array(
  z.object({
    id: z.string(),
    loc: z.object({
      lat: z.string(),
      lon: z.string(),
    }),
  })
);
