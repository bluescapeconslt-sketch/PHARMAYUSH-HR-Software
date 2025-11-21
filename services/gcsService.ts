import { storage } from './firebase.ts';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Cloud Storage (Firebase Storage) if connected, 
 * otherwise creates a local simulation URL.
 * 
 * @param file The file to upload.
 * @returns A promise that resolves to the file URL.
 */
export const uploadFile = async (file: File): Promise<string> => {
  console.log(`Processing upload for file: ${file.name}`);

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported.');
  }

  if (storage) {
      // --- Cloud Mode ---
      try {
          // Create a unique filename
          const uniqueName = `${Date.now()}-${file.name}`;
          const storageRef = ref(storage, `uploads/${uniqueName}`);
          
          console.log("Uploading to Firebase Storage...");
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          console.log("Upload successful:", downloadURL);
          return downloadURL;
      } catch (error: any) {
          console.error("Firebase Upload Error:", error);
          throw new Error("Cloud upload failed: " + error.message);
      }
  } else {
      // --- Local Simulation Mode ---
      console.log("Firebase not configured. Using local simulation.");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const blobUrl = URL.createObjectURL(file);
      console.log(`File "uploaded" locally. Blob URL: ${blobUrl}`);
      return blobUrl;
  }
};