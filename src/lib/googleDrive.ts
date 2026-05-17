import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Uploads a file buffer to Google Drive using a Service Account.
 * Automatically makes the file readable by anyone with the link so teachers/faculty can view it.
 */
export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive service account credentials are not configured in environment variables.');
  }

  // Format the private key to handle newlines correctly
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  // Authenticate with Google API
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: formattedPrivateKey,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata: any = {
    name: fileName,
  };

  // If a specific folder ID is provided, save the file there
  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType: mimeType,
    body: Readable.from(fileBuffer),
  };

  // Upload file
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = response.data.id;

  if (!fileId) {
    throw new Error('Failed to retrieve file ID from Google Drive upload response.');
  }

  // Set file permissions to "anyone with link can read" so faculty can access it directly
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (permError) {
    console.error('Warning: Failed to set Google Drive file permissions to public view. The file was uploaded, but may require manual access authorization.', permError);
  }

  // Retrieve the updated links to ensure we return the public sharing webViewLink
  const fileInfo = await drive.files.get({
    fileId: fileId,
    fields: 'webViewLink, webContentLink',
  });

  return {
    fileId,
    webViewLink: fileInfo.data.webViewLink || response.data.webViewLink,
    webContentLink: fileInfo.data.webContentLink || response.data.webContentLink,
  };
}
