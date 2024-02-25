import axios from "axios";
import { env } from "$env/dynamic/private";

const UsersApi = {
  instance: axios.create({
    baseURL: env.API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  }),
  async fetchUser(email: string) {
    return await (
      await this.instance.get(`/users/${encodeURIComponent(email)}`)
    ).data;
  },
  async deleteUser(email: string) {
    return (await this.instance.delete(`/users/${encodeURIComponent(email)}`))
      .data.user;
  },
};

export default UsersApi;
