import { firebaseDb } from "../config/firebase";

export interface IProgress {
  id: string;
  userId: string;
  date: Date;
  weight: number;
  bodyFat?: number;
}

const COLLECTION_NAME = "progress";

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to filter out undefined values for Firestore
function cleanData(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  }
  return cleaned;
}

export const Progress = {
  async create(data: Omit<IProgress, "id">): Promise<IProgress> {
    const cleanedData = cleanData(data);
    const docRef = await firebaseDb.collection(COLLECTION_NAME).add({
      ...cleanedData,
      dateString: getDateString(data.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id: string): Promise<IProgress | null> {
    const doc = await firebaseDb.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as IProgress;
  },

  async findByUserAndDate(userId: string, date: Date): Promise<IProgress | null> {
    // Use start/end of day to handle any time component
    const dateStr = getDateString(date);
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .where("dateString", "==", dateStr)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    // Ensure date is converted to proper Date object
    return { 
      id: doc.id, 
      userId: data.userId, 
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date), 
      weight: data.weight, 
      bodyFat: data.bodyFat 
    } as IProgress;
  },

  async findByUser(userId: string): Promise<IProgress[]> {
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .get();
    
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IProgress));
    // Sort by date descending in memory
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async update(id: string, data: Partial<IProgress>): Promise<IProgress | null> {
    const cleanedData = cleanData(data as Record<string, any>);
    if (Object.keys(cleanedData).length === 0) {
      return this.findById(id);
    }
    await firebaseDb
      .collection(COLLECTION_NAME)
      .doc(id)
      .update({
        ...cleanedData,
        updatedAt: new Date(),
      });
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await firebaseDb.collection(COLLECTION_NAME).doc(id).delete();
  },
};
