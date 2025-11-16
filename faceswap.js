import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Performs face swap using aifaceswap.io
 * @param {string} userImagePath - Path to the user's image
 * @param {string} kirkImagePath - Path to Charlie Kirk's image
 * @returns {Promise<string>} - Path to the result image
 */
export async function performFaceSwap(userImagePath, kirkImagePath) {
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('[FaceSwap] Navigating to aifaceswap.io...');
        await page.goto('https://aifaceswap.io/#face-swap-playground', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for the page to load
        await page.waitForTimeout(2000);

        console.log('[FaceSwap] Uploading original image...');
        // Upload the user's image (Original/Source Image)
        const sourceUploadInput = await page.locator('#sourceImage input[type="file"]').first();
        await sourceUploadInput.setInputFiles(userImagePath);
        await page.waitForTimeout(2000);

        console.log('[FaceSwap] Uploading Charlie Kirk face...');
        // Upload Charlie Kirk's face (Face Image)
        const faceUploadInput = await page.locator('#faceImage input[type="file"]').first();
        await faceUploadInput.setInputFiles(kirkImagePath);
        await page.waitForTimeout(2000);

        console.log('[FaceSwap] Starting face swap...');
        // Click the "Start face swapping" button
        const swapButton = await page.locator('button:has-text("Start face swapping")').first();
        await swapButton.waitFor({ state: 'visible', timeout: 5000 });
        await swapButton.click();

        console.log('[FaceSwap] Waiting for result...');
        // Wait for the actual face swap result request instead of any placeholder image
        const resultResponse = await page.waitForResponse((response) => {
            const url = response.url();
            const isFaceSwapAsset = url.includes('face-swap/') && !url.includes('upload_res');
            return response.request().method() === 'GET' && isFaceSwapAsset;
        }, { timeout: 180000 });

        const resultUrl = resultResponse.url();
        if (!resultUrl) {
            throw new Error('Could not capture result image URL');
        }

        console.log('[FaceSwap] Result URL:', resultUrl);

        // Download the result image
        const resultImageData = await page.evaluate(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }, resultUrl);

        // Save the result
        const resultPath = path.join('temp', `result_${uuidv4()}.webp`);
        const base64Data = resultImageData.split(',')[1];
        fs.writeFileSync(resultPath, Buffer.from(base64Data, 'base64'));

        console.log('[FaceSwap] Result saved to:', resultPath);
        return resultPath;

    } catch (error) {
        console.error('[FaceSwap] Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}
