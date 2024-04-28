import { createPrivAxiosInstance } from "../axios/factory";

const UsersApi = {
  instance: createPrivAxiosInstance(),
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
