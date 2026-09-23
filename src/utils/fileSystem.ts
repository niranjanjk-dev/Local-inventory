import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Saves a base64 image string to the local device data directory
 * @param base64Data The full base64 data url (e.g. data:image/jpeg;base64,/9j/4AAQSk...)
 * @returns The local file URI (e.g. file:///data/user/0/.../app_data/photos/...)
 */
export async function savePhotoToFileSystem(base64Data: string): Promise<string> {
  // If it's already a file URI, return it
  if (base64Data.startsWith('file://') || base64Data.startsWith('http://localhost') || base64Data.startsWith('ionic://')) {
    return base64Data;
  }
  
  // If it's the default demo image (starts with / or ./ or http), just return it
  if (base64Data.startsWith('/') || base64Data.startsWith('./') || base64Data.startsWith('http') && !base64Data.startsWith('http://localhost')) {
     return base64Data;
  }

  try {
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
    
    // We only need the base64 string without the prefix for Filesystem.writeFile
    // e.g. "data:image/jpeg;base64,/9j/4..." -> "/9j/4..."
    let dataToWrite = base64Data;
    if (base64Data.includes(',')) {
      dataToWrite = base64Data.split(',')[1];
    }

    const savedFile = await Filesystem.writeFile({
      path: `photos/${fileName}`,
      data: dataToWrite,
      directory: Directory.Data,
      recursive: true // Ensures the 'photos' directory is created
    });

    return savedFile.uri;
  } catch (err) {
    console.error('Error saving photo to filesystem:', err);
    throw err;
  }
}

/**
 * Converts a stored file URI to a web-routable URL to display in <img> src
 * @param uri The stored URI (either file:// or web url)
 * @returns A web routable URL
 */
export function getPhotoUrl(uri: string): string {
  if (!uri) return '';
  
  // Convert device file paths to capacitor web routable URLs
  if (uri.startsWith('file://')) {
    return Capacitor.convertFileSrc(uri);
  }
  
  return uri;
}
