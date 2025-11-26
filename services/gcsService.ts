/**
 * @file This service simulates uploading files to Google Cloud Storage.
 *
 * In a production environment, this service would NOT contain any secret keys.
 * Instead, it would make a request to a secure backend endpoint. The backend
 * would then generate a signed URL, which is a temporary, secure URL that grants
 * the client permission to upload a file to a specific GCS bucket.
 *
 * This mock implementation uses `URL.createObjectURL` to create a temporary,
 * session-lived URL for the selected file, mimicking the behavior of receiving a
 * public URL after an upload. This allows the frontend to function without a
 * real backend while demonstrating the correct architectural pattern.
 */

/**
 * Simulates uploading a file and returns a URL for it.
 * @param file The file to "upload".
 * @returns A promise that resolves to a local blob URL representing the file.
 */
export const uploadFile = async (file: File): Promise<string> => {
  console.log(`Simulating upload for file: ${file.name}`);

  // Basic validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported for this mock upload.');
  }

  // In a real implementation, you would:
  // 1. const response = await fetch('/api/get-signed-url?fileName=' + file.name);
  // 2. const { signedUrl, publicUrl } = await response.json();
  // 3. await fetch(signedUrl, { method: 'PUT', body: file });
  // 4. return publicUrl;

  // For our simulation, we create a blob URL.
  // This URL is valid for the lifetime of the document.
  const blobUrl = URL.createObjectURL(file);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`File "uploaded". Blob URL created: ${blobUrl}`);
  return blobUrl;
};
