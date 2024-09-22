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

export { ErrorResponse, SuccessResponse };
