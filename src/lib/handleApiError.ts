/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export function getErrorMessage(error: any): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.statusText ||
      "Something went wrong"
    );
  }
  return "Unexpected error occurred";
}
