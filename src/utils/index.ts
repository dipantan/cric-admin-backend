import axios from "axios";

export const callApiServer = async () => {
  try {
    const { data } = await axios.get("https://cric-admin-backend.onrender.com");
    return data;
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

const ErrorResponse = (message: string, status: number) => {
  return {
    success: false,
    message,
    status,
  };
};

const SuccessResponse = (data: any, status: number) => {
  return {
    success: true,
    data,
    status,
  };
};

export function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export { ErrorResponse, SuccessResponse };
