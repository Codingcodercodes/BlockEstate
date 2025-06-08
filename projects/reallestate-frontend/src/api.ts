import axios from "axios";
import { Document } from "./types";

export async function fetchUserDocuments(token: string): Promise<Document[] | null> {
  try {
    const response = await axios.get(process.env.API_URL!, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return null;
  }
}
