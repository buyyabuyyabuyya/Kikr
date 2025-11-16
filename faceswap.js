import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Performs face swap using VModel Photo Face Swap API
 * @param {string} userImageUrl - HTTPS URL of the user's image
 * @param {string} kirkImageUrl - HTTPS URL of Charlie Kirk's image
 * @returns {Promise<string>} - Path to the result image
 */
const VMODEL_API_TOKEN = process.env.VMODEL_API_TOKEN;
const VMODEL_FACE_SWAP_VERSION =
    process.env.VMODEL_FACE_SWAP_VERSION ||
    'a3c8d261fd14126eececf9812b52b40811e9ed557ccc5706452888cdeeebc0b6';

export async function performFaceSwap(userImageUrl, kirkImageUrl) {
    if (!VMODEL_API_TOKEN) {
        throw new Error('VMODEL_API_TOKEN is not set');
    }

    if (!kirkImageUrl) {
        throw new Error('KIRK_FACE_URL is not set');
    }

    if (!userImageUrl) {
        throw new Error('userImageUrl is required');
    }

    try {
        console.log('[FaceSwap] Creating VModel task...');

        const createResponse = await fetch('https://api.vmodel.ai/api/tasks/v1/create', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${VMODEL_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: VMODEL_FACE_SWAP_VERSION,
                input: {
                    // swap_image: the face you want to apply
                    swap_image: kirkImageUrl,
                    // target_image: the original user image
                    target_image: userImageUrl,
                    disable_safety_checker: false,
                },
            }),
        });

        if (!createResponse.ok) {
            const text = await createResponse.text().catch(() => '');
            throw new Error(
                `Failed to create VModel task: ${createResponse.status} ${createResponse.statusText} ${text}`,
            );
        }

        const createJson = await createResponse.json();
        const taskId = createJson?.result?.task_id;
        const taskCost = createJson?.result?.task_cost;
        console.log('[FaceSwap] Task created:', taskId, 'cost:', taskCost);

        if (!taskId) {
            throw new Error('VModel create task did not return task_id');
        }

        const getTaskUrl = `https://api.vmodel.ai/api/tasks/v1/get/${taskId}`;
        const startTime = Date.now();
        let outputUrl = null;

        while (true) {
            const getResponse = await fetch(getTaskUrl, {
                headers: {
                    Authorization: `Bearer ${VMODEL_API_TOKEN}`,
                },
            });

            if (!getResponse.ok) {
                const text = await getResponse.text().catch(() => '');
                throw new Error(
                    `Failed to get VModel task status: ${getResponse.status} ${getResponse.statusText} ${text}`,
                );
            }

            const statusJson = await getResponse.json();
            const result = statusJson?.result;
            const status = result?.status;
            const error = result?.error;
            const output = result?.output;

            console.log('[FaceSwap] Task status:', status, 'error:', error || '');

            if (status === 'succeeded') {
                if (Array.isArray(output) && output.length > 0) {
                    outputUrl = output[0];
                    break;
                }
                throw new Error('VModel task succeeded but no output URL was returned');
            }

            if (status === 'failed' || status === 'canceled') {
                throw new Error(error || `VModel task ${status}`);
            }

            if (Date.now() - startTime > 180000) {
                throw new Error('Timed out waiting for VModel task to complete');
            }

            // starting / processing -> wait and poll again
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        if (!outputUrl) {
            throw new Error('VModel did not return an output image URL');
        }

        console.log('[FaceSwap] Downloading result from:', outputUrl);

        const downloadResponse = await fetch(outputUrl, {
            headers: {
                // VModel requires auth header to download result files
                Authorization: `Bearer ${VMODEL_API_TOKEN}`,
            },
        });

        if (!downloadResponse.ok) {
            throw new Error(
                `Failed to download result image: ${downloadResponse.status} ${downloadResponse.statusText}`,
            );
        }

        const arrayBuffer = await downloadResponse.arrayBuffer();

        // Save the result
        const resultPath = path.join('temp', `result_${uuidv4()}.png`);
        fs.writeFileSync(resultPath, Buffer.from(arrayBuffer));

        console.log('[FaceSwap] Result saved to:', resultPath);
        return resultPath;
    } catch (error) {
        console.error('[FaceSwap] Error:', error.message);
        throw error;
    }
}
