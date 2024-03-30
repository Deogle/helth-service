import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";

let initialized = false;

const getServiceAccount = () => {
  let serviceAccountKey;
  try {
    serviceAccountKey = JSON.parse(
      readFileSync("helth-service-key.json", "utf-8")
    );
    return serviceAccountKey;
  } catch (error) {
    console.error(
      "Service account key file not found. Falling back to environment variables."
    );
    const { GCLOUD_PROJECT_ID, GCLOUD_CLIENT_EMAIL, GCLOUD_PRIVATE_KEY } =
      serviceAccountKey ?? process.env;

    return {
      projectId: GCLOUD_PROJECT_ID,
      clientEmail: GCLOUD_CLIENT_EMAIL,
      privateKey: GCLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

  const db = getFirestore();

  const getUserByEmail = async (email: string) => {
    try {
      const doc = await db.collection("users").doc(email).get();
      return doc.data();
    } catch (error) {
      console.error(error);
    }
  };

  const getUserByWhoopId = async (id: Number) => {
    try {
      const doc = await db.collection("users").where("user_id", "==", id).get();
      return doc.docs[0].data();
    } catch (error) {
      console.error(error);
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
      console.error(error);
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

    console.log(`Registered webhook ${url}`);

    return true;
  };

  const getAllWebhookUrls = async () => {
    const urlDocumentList = (await db.collection("webhooks").get()).docs;
    return urlDocumentList.map((doc) => doc.data().url as string);
  };

  const logSuccessfulWebhook = async (url: string) => {
    const doc = await db.collection("webhooks").where("url", "==", url).get();
    return await doc.docs?.[0]?.ref.update({
      lastSuccess: FieldValue.serverTimestamp(),
    });
  };

  const logFailedWebhook = async (url: string) => {
    const doc = await db.collection("webhooks").where("url", "==", url).get();
    await doc.docs?.[0]?.ref.update({
      lastFailure: FieldValue.serverTimestamp(),
      failureCount: FieldValue.increment(1),
    });
    if (doc.docs?.[0]?.data().failureCount >= 5) {
      console.log(`Deleting webhook ${doc.docs?.[0]?.data().url}`);
      await doc.docs?.[0]?.ref.delete();
    }
    return;
  };

  return {
    getUserByEmail,
    getUserByRefreshToken,
    getUserByWhoopId,
    createUser,
    deleteUser,
    getAllUsers,
    updateUser,
    registerWebhook,
    getAllWebhookUrls,
    logFailedWebhook,
    logSuccessfulWebhook,
  };
})();

export default FirestoreDB;
