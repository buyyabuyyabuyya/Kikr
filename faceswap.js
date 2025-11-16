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
        // Debug: log key network traffic to and from aifaceswap
        page.on('request', (request) => {
            const url = request.url();
            const method = request.method();

            if (url.includes('aifaceswap.io')) {
                if (url.includes('/api/upload_file') || url.includes('/api/generate_face') || url.includes('/api/check_status')) {
                    console.log('[FaceSwap][request]', method, url);
                    try {
                        const body = request.postData();
                        if (body && body.length < 500) {
                            console.log('[FaceSwap][request body]', body);
                        } else if (body) {
                            console.log('[FaceSwap][request body]', body.substring(0, 500) + '...');
                        }
                    } catch (err) {
                        console.warn('[FaceSwap][request] Error reading body:', err.message);
                    }
                }
            } else if (url.includes('face-swap/')) {
                // Logs any direct GET to the final face-swap asset host
                console.log('[FaceSwap][request asset]', method, url);
            }
        });

        page.on('response', async (response) => {
            const url = response.url();
            const status = response.status();

            if (url.includes('aifaceswap.io')) {
                if (url.includes('/api/upload_file') || url.includes('/api/generate_face') || url.includes('/api/check_status')) {
                    const headers = response.headers();
                    const contentType = headers['content-type'] || headers['Content-Type'] || '';
                    console.log('[FaceSwap][response]', status, url, 'ct=', contentType);
                    // Important: do NOT read response.json() here, so the dedicated
                    // check_status listener can consume the JSON body.
                }
            } else if (url.includes('face-swap/')) {
                console.log('[FaceSwap][response asset]', status, url);
            }
        });

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

        // Set up listener for /api/check_status BEFORE starting the job
        console.log('[FaceSwap] Setting up result listener...');
        const resultUrlPromise = new Promise((resolve, reject) => {
            let settled = false;

            const timeoutId = setTimeout(() => {
                if (settled) return;
                settled = true;
                page.removeListener('response', onResponse);
                reject(new Error('Timed out waiting for face swap result'));
            }, 180000); // 3 minutes

            const onResponse = async (response) => {
                try {
                    const url = response.url();
                    if (!url.includes('/api/check_status')) return;

                    const json = await response.json().catch(() => null);
                    if (!json || !json.data) return;

                    const { status, result_image, error } = json.data;
                    console.log('[FaceSwap] /api/check_status =>', status, result_image || null, error || '');

                    if (status === 2 && result_image) {
                        let fullUrl = result_image;
                        if (!fullUrl.startsWith('http')) {
                            // Based on your logs: final image is served from art-global.faceai.art
                            fullUrl = `https://art-global.faceai.art/${fullUrl}`;
                        }

                        if (settled) return;
                        settled = true;
                        clearTimeout(timeoutId);
                        page.removeListener('response', onResponse);
                        resolve(fullUrl);
                    }
                } catch (err) {
                    console.warn('[FaceSwap] Error while parsing check_status response:', err.message);
                }
            };

            page.on('response', onResponse);
        });

        console.log('[FaceSwap] Starting face swap...');
        // Click the "Start face swapping" button
        const swapButton = await page.locator('button:has-text("Start face swapping")').first();
        await swapButton.waitFor({ state: 'visible', timeout: 5000 });
        await swapButton.click();

        console.log('[FaceSwap] Waiting for result...');
        const resultUrl = await resultUrlPromise;

        if (!resultUrl) {
            throw new Error('Could not capture result image URL');
        }

        console.log('[FaceSwap] Result URL:', resultUrl);

        // Download the result image using Node fetch (avoids browser CORS issues)
        const downloadResponse = await fetch(resultUrl);
        if (!downloadResponse.ok) {
            throw new Error(`Failed to download result image: ${downloadResponse.status} ${downloadResponse.statusText}`);
        }
        const arrayBuffer = await downloadResponse.arrayBuffer();

        // Save the result
        const resultPath = path.join('temp', `result_${uuidv4()}.webp`);
        fs.writeFileSync(resultPath, Buffer.from(arrayBuffer));

        console.log('[FaceSwap] Result saved to:', resultPath);
        return resultPath;

    } catch (error) {
        console.error('[FaceSwap] Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}
