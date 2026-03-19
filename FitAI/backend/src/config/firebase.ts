import admin from "firebase-admin";
import { env } from "./env";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        privateKey: env.firebase.privateKey,
        clientEmail: env.firebase.clientEmail,
      }),
      databaseURL: env.firebase.databaseUrl,
    });
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export const firebaseDb = admin.firestore();
export const firebaseAuth = admin.auth();

export default admin;
