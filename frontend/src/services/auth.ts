import { fetchAPI } from "./api"

export const authService = {
  login: async (email: string, password: string) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (name: string, email: string, password: string) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  },

  getMe: async () => {
    return fetchAPI("/users/me", {
      method: "GET",
    })
  },
}
