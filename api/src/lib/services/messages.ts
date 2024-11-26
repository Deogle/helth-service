import DB from "../db";

const MessageService = {
  async getMessages() {
    return DB.getSeenMessages?.();
  },
  async createSeenMessage(messageHash: string) {
    return DB.createMessage?.(messageHash);
  },
};

export { MessageService };
