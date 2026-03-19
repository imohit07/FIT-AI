import { firebaseDb } from "./firebase";

export async function connectDb() {
  try {
    // Test the connection by doing a simple query
    await firebaseDb.collection("__info").limit(1).get();
    console.log("Firebase Firestore connected");
  } catch (err) {
    console.error("Firebase connection error:", err);
    throw err;
  }
}
