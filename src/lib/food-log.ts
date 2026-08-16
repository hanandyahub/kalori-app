import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FoodAnalysis, FoodLogEntry } from "@/lib/types";

const COLLECTION = "foodLogs";

export async function saveFoodLog(
  userId: string,
  imageDataUrl: string,
  analysis: FoodAnalysis
) {
  await addDoc(collection(db, COLLECTION), {
    userId,
    imageDataUrl,
    ...analysis,
    createdAt: Date.now(),
  });
}

export async function getFoodLogs(userId: string): Promise<FoodLogEntry[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FoodLogEntry, "id">),
  }));
}
