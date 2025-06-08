import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
dotenv.config();

// Function to log errors more effectively with context
const logError = (message: string, error: any) => {
  console.error(`[ERROR] ${message}`, error);
};

// Helper function to validate environment variables
const validateEnvVars = () => {
  if (!process.env.TOKEN_URL) {
    throw new Error("TOKEN_URL environment variable is missing");
  }
};

// Function to attempt fetching the access token with retries
const fetchAccessTokenWithRetry = async (retryCount = 3): Promise<string | null> => {
  try {
    const response = await axios.post<{ access_token: string }>(process.env.TOKEN_URL!, {
      grant_type: "client_credentials",
    });
    return response.data.access_token;
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying... (${retryCount} attempts left)`);
      return fetchAccessTokenWithRetry(retryCount - 1);
    }
    throw error;  // Re-throw if no retries are left
  }
};

export async function getAccessToken(): Promise<string | null> {
  try {
    // Validate the necessary environment variables
    validateEnvVars();

    // Attempt to fetch access token
    return await fetchAccessTokenWithRetry();
  } catch (error) {
    // Catch network errors or HTTP-specific errors
    if (axios.isAxiosError(error)) {
      logError("Axios error while getting access token", error.response?.data || error.message);
    } else {
      logError("Unexpected error while getting access token", error);
    }
    return null;
  }
}
