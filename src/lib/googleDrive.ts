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

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  let auth: any;

  if (clientId && clientSecret && refreshToken) {
    // Authenticate with Google OAuth 2.0 (Best for personal @gmail.com accounts, bypasses quota limit)
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    auth = oauth2Client;
  } else if (clientEmail && privateKey) {
    // Authenticate with Google Service Account (Best for Workspace / Shared Drives)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
  } else {
    throw new Error('Google Drive credentials (either OAuth2 Client ID/Secret/Refresh Token or Service Account Email/Private Key) are not configured in environment variables.');
  }

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
    supportsAllDrives: true,
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
      supportsAllDrives: true,
    });
  } catch (permError) {
    console.error('Warning: Failed to set Google Drive file permissions to public view. The file was uploaded, but may require manual access authorization.', permError);
  }

  // Retrieve the updated links to ensure we return the public sharing webViewLink
  const fileInfo = await drive.files.get({
    fileId: fileId,
    fields: 'webViewLink, webContentLink',
    supportsAllDrives: true,
  });

  return {
    fileId,
    webViewLink: fileInfo.data.webViewLink || response.data.webViewLink,
    webContentLink: fileInfo.data.webContentLink || response.data.webContentLink,
  };
}
