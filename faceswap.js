import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Performs face swap using the self-hosted FaceFusion backend.
 * @param {string} userImageUrl - HTTPS URL of the user's image (the target).
 * @param {string} kirkImageUrl - HTTPS URL of Charlie Kirk's image (the face source).
 * @returns {Promise<string>} - Local path to the saved result image.
 */
export async function performFaceSwap(userImageUrl, kirkImageUrl) {
    const faceFusionUrl = process.env.FACEFUSION_URL;

    if (!faceFusionUrl) {
        throw new Error('FACEFUSION_URL environment variable is not set.');
    }

    console.log(`[FaceSwap] Sending request to FaceFusion backend at ${faceFusionUrl}`);

    try {
        // 1. Call the backend API to perform the swap
        const response = await fetch(`${faceFusionUrl}/swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target_url: userImageUrl,
                face_url: kirkImageUrl,
            }),
            timeout: 180000, // 3 minute timeout
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`FaceFusion backend failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const resultUrl = data.result_url;

        if (!resultUrl) {
            throw new Error('FaceFusion backend did not return a result_url.');
        }

        console.log(`[FaceSwap] Got result URL: ${resultUrl}`);

        // 2. Download the resulting image
        const downloadResponse = await fetch(resultUrl);
        if (!downloadResponse.ok) {
            throw new Error(`Failed to download result image: ${downloadResponse.statusText}`);
        }

        const arrayBuffer = await downloadResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Save the image to a temporary file
        const tempDir = 'temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        const resultPath = path.join(tempDir, `result-${uuidv4()}.png`);
        fs.writeFileSync(resultPath, buffer);

        console.log(`[FaceSwap] Result saved to: ${resultPath}`);
        return resultPath;

    } catch (error) {
        console.error('[FaceSwap] An error occurred:', error.message);
        throw error; // Re-throw the error to be caught by the bot
    }
}
