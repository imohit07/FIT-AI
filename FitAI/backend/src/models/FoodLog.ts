import { firebaseDb } from "../config/firebase";

export interface IFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface IFoodLog {
  id: string;
  userId: string;
  date: Date;
  foodItems: IFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

const COLLECTION_NAME = "foodLogs";

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const FoodLog = {
  async create(data: Omit<IFoodLog, "id">): Promise<IFoodLog> {
    const docRef = await firebaseDb.collection(COLLECTION_NAME).add({
      ...data,
      dateString: getDateString(data.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id: string): Promise<IFoodLog | null> {
    const doc = await firebaseDb.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as IFoodLog;
  },

  async findByUserAndDate(userId: string, date: Date): Promise<IFoodLog | null> {
    const dateStr = getDateString(date);
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .where("dateString", "==", dateStr)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IFoodLog;
  },

  async findByUser(userId: string): Promise<IFoodLog[]> {
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .get();
    
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IFoodLog));
    // Sort by date descending in memory
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async update(id: string, data: Partial<IFoodLog>): Promise<IFoodLog | null> {
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
