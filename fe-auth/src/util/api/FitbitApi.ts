import { env } from "$env/dynamic/private";
import axios from "axios";

const FitbitApi = {
  instance: axios.create({
    baseURL: `${env.API_URL}/oauth/fitbit`,
    headers: {
      "Content-Type": "application/json",
    },
  }),
  async fetchAuthUrl(email: string) {
    return (await this.instance.get(`/`, { params: { email } })).data.url;
  },
  async createUserAfterAuth(email: string, code: string) {
    return (await this.instance.post("/auth", { code, email })).data;
  },
};

export default FitbitApi;
