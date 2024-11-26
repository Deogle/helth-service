import FirestoreDB from "./firestore";
import PostgresDB from "./postgres";

export interface HelthDbService {
  getUserByEmail: (
    email: string
  ) => Promise<{ [key: string]: any } | undefined>;
  getUserByEncodedId: (
    id: string
  ) => Promise<{ [key: string]: any } | undefined>;
  getUserByWhoopId: (id: Number) => Promise<{ [key: string]: any } | undefined>;
  getUserByRefreshToken: (
    refreshToken: string
  ) => Promise<{ [key: string]: any } | undefined>;
  createUser: (email: string, data: { [key: string]: any }) => Promise<any>;
  deleteUser: (email: string) => Promise<any>;
  getAllUsers: () => Promise<{ [key: string]: any }[]>;
  updateUser: (email: string, data: object) => Promise<any>;
  getSeenMessages?: (email: string) => Promise<any>;
  createMessage?: (email: string, data: object) => Promise<any>;
}

export default PostgresDB;
