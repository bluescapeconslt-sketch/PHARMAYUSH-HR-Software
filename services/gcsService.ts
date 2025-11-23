
// Use import.meta.env for Vite, with a fallback to /api if undefined.
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

/**
 * Uploads a file to the backend server.
 * 
 * @param file The file to upload.
 * @returns A promise that resolves to the relative file URL.
 */
export const uploadFile = async (file: File): Promise<string> => {
  console.log(`Processing upload for file: ${file.name}`);

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
      });

      if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      // Return the URL provided by the backend (e.g., /uploads/filename.jpg)
      return data.url; 
  } catch (error: any) {
      console.error("Upload Error:", error);
      throw new Error("File upload failed: " + error.message);
  }
};
