import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import logger from "../../util/logger";

let initialized = false;

const getDb = () => {
  return process.env.NODE_ENV === "prod" ? "prod" : "test";
};

const formatPrivateKey = (privateKey: string) => {
  if (!privateKey) return;
  if (process.env.NODE_ENV === "dev") {
    return Buffer.from(privateKey, "base64").toString("utf-8");
  } else {
    return privateKey.replace(/\\n/g, "\n");
  }
};

const getServiceAccount = () => {
  let serviceAccountKey;
  try {
    serviceAccountKey = JSON.parse(
      readFileSync("helth-service-key.json", "utf-8")
    );
    logger.info(
      "Service account key file found. Using service account key for authentication."
    );
    return serviceAccountKey;
  } catch (error) {
    const { GCLOUD_PROJECT_ID, GCLOUD_CLIENT_EMAIL, GCLOUD_PRIVATE_KEY } =
      serviceAccountKey ?? process.env;

    return {
      projectId: GCLOUD_PROJECT_ID,
      clientEmail: GCLOUD_CLIENT_EMAIL,
      privateKey: formatPrivateKey(GCLOUD_PRIVATE_KEY),
    };
  }
};

const initializeFirestoreAppCredentials = () => {
  const serviceAccount = getServiceAccount();

  initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
};

const FirestoreDB = (() => {
  if (!initialized) {
    initializeFirestoreAppCredentials();
  }

  const db = getFirestore(getDb());

  const getUserByEmail = async (email: string) => {
    try {
      const doc = await db.collection("users").doc(email).get();
      return doc.data();
    } catch (error) {
      logger.error(error);
    }
  };

  const getUserByEncodedId = async (id: string) => {
    try {
      const doc = await db
        .collection("users")
        .where("encodedId", "==", id)
        .get();
      return doc.docs[0].data();
    } catch (error) {
      logger.error(error);
    }
  };

  const getUserByWhoopId = async (id: Number) => {
    try {
      const doc = await db.collection("users").where("user_id", "==", id).get();
      return doc.docs[0].data();
    } catch (error) {
      logger.error(error);
    }
  };

  const getUserByRefreshToken = async (refreshToken: string) => {
    try {
      const snapshot = await db
        .collection("users")
        .where("refresh_token", "==", refreshToken)
        .get();
      return snapshot.docs[0]?.data() as { [key: string]: any };
    } catch (error) {
      logger.error(error);
    }
  };

  const createUser = async (email: string, data: object) => {
    await db
      .collection("users")
      .doc(email)
      .set({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return data;
  };

  const deleteUser = async (email: string) => {
    await db.collection("users").doc(email).delete();
    return { email };
  };

  const getAllUsers = async () => {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map((doc) => doc.data());
  };

  const updateUser = async (email: string, data: object) => {
    await db
      .collection("users")
      .doc(email)
      .update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      });
  };

  const getSeenMessages = async () => {
    const snapshot = await db.collection("messages").get();
    return snapshot.docs.map((doc) => doc.data());
  };

  const createMessage = async (messageHash: string) => {
    await db.collection("messages").add({
      hash: messageHash,
      createdAt: Timestamp.now(),
    });
  };

  const registerWebhook = async (url: string) => {
    const urlDocumentList = (await db.collection("webhooks").get()).docs;
    const urlList = urlDocumentList.map((doc) => doc.data().url as String);

    if (urlList.includes(url)) return false;

    await db.collection("webhooks").add({
      url,
      createdAt: Timestamp.now(),
      lastSuccess: null,
      lastFailure: null,
      failureCount: 0,
    });

    logger.info(`Registered webhook`, { url });

    return true;
  };

  const logSuccessfulWebhook = async (url: string) => {
    const doc = await db.collection("webhooks").where("url", "==", url).get();
    return await doc.docs?.[0]?.ref.update({
      lastSuccess: FieldValue.serverTimestamp(),
    });
  };

  const logFailedWebhook = async (url: string) => {
    logger.error(`Failed to push webhook`, { url });
    const doc = await db.collection("webhooks").where("url", "==", url).get();
    await doc.docs?.[0]?.ref.update({
      lastFailure: FieldValue.serverTimestamp(),
      failureCount: FieldValue.increment(1),
    });
    if (doc.docs?.[0]?.data().failureCount >= 5) {
      logger.info(`Deleting webhook`, {
        webhookurl: doc.docs?.[0]?.data().url,
      });
      await doc.docs?.[0]?.ref.delete();
    }
    return;
  };

  return {
    getUserByEmail,
    getUserByRefreshToken,
    getUserByWhoopId,
    getUserByEncodedId,
    createUser,
    deleteUser,
    getAllUsers,
    updateUser,
    getSeenMessages,
    createMessage,
    registerWebhook,
    logFailedWebhook,
    logSuccessfulWebhook,
  };
})();

export default FirestoreDB;
