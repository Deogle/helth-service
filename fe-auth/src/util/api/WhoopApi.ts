import { env } from "$env/dynamic/private";
import axios from "axios";

const WhoopApi = {
  instance: axios.create({
    baseURL: `${env.API_URL}/oauth/whoop`,
    headers: {
      "Content-Type": "application/json",
    },
  }),
  async fetchAuthUrl() {
    return (await this.instance.get("/")).data;
  },
  async createUserAfterAuth(code: string) {
    return (await this.instance.post("/auth", { code })).data;
  },
};

export default WhoopApi;
