import { firebaseDb } from "../config/firebase";

export interface IExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
  caloriesBurned: number;
  duration?: number;
}

export interface IWorkoutLog {
  id: string;
  userId: string;
  date: Date;
  exercises: IExercise[];
  totalCaloriesBurned: number;
  totalDuration?: number;
}

const COLLECTION_NAME = "workoutLogs";

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const WorkoutLog = {
  async create(data: Omit<IWorkoutLog, "id">): Promise<IWorkoutLog> {
    const docRef = await firebaseDb.collection(COLLECTION_NAME).add({
      ...data,
      dateString: getDateString(data.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...data };
  },

  async findById(id: string): Promise<IWorkoutLog | null> {
    const doc = await firebaseDb.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as IWorkoutLog;
  },

  async findByUserAndDate(userId: string, date: Date): Promise<IWorkoutLog | null> {
    const dateStr = getDateString(date);
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .where("dateString", "==", dateStr)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IWorkoutLog;
  },

  async findByUser(userId: string): Promise<IWorkoutLog[]> {
    const snapshot = await firebaseDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .get();
    
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IWorkoutLog));
    // Sort by date descending in memory
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async update(id: string, data: Partial<IWorkoutLog>): Promise<IWorkoutLog | null> {
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
