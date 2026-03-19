import { firebaseDb } from "../config/firebase";

export type GoalType = "fat_loss" | "muscle_gain" | "maintain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: GoalType;
  activityLevel?: ActivityLevel;
  targetCalories?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<IUser, "id" | "createdAt" | "updatedAt">;

const COLLECTION_NAME = "users";

export const User = {
  async create(data: CreateUserInput): Promise<IUser> {
    const now = new Date();
    const docRef = await firebaseDb.collection(COLLECTION_NAME).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
  },

  async findById(id: string): Promise<IUser | null> {
    const doc = await firebaseDb.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as IUser;
  },

  async findByEmail(email: string): Promise<IUser | null> {
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IUser;
  },

  async update(id: string, data: Partial<CreateUserInput>): Promise<IUser | null> {
    await firebaseDb
      .collection(COLLECTION_NAME)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await firebaseDb.collection(COLLECTION_NAME).doc(id).delete();
  },
};
