import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebase';

export async function uploadReceipt(
  uid: string,
  month: string,
  expenseId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `receipts/${uid}/${month}/${expenseId}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteReceipt(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch {
    // Ignore not-found errors
  }
}
