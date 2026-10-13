import axios from "axios";

async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    return (await promise).data;
  }
  catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error("Unable to reach the Pokédex right now.", { cause: error });
    }
    throw error;
  }
}

export const http = {
  get: <T>(url: string) => request(axios.get<T>(url)),
  post: <T, D>(url: string, data: D) => request(axios.post<T>(url, data)),
  put: <T, D>(url: string, data: D) => request(axios.put<T>(url, data)),
  delete: <T>(url: string) => request(axios.delete<T>(url)),
};
