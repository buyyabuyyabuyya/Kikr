import Jimp from 'jimp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a meme by adding top and bottom text to an image.
 * @param {string} imageUrl - The URL of the image to use.
 * @param {string} topText - The text to add to the top.
 * @param {string} bottomText - The text to add to the bottom.
 * @returns {Promise<string>} - The local path to the generated meme image.
 */
export async function createMeme(imageUrl, topText, bottomText) {
    try {
        // Load the font. The 'impact' style font is common for memes.
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

        // Read the image from the URL
        const image = await Jimp.read(imageUrl);

        // Print the text onto the image
        image.print(
            font,
            0, // x
            10, // y
            {
                text: topText.toUpperCase(),
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            image.getWidth(),
            image.getHeight()
        );

        image.print(
            font,
            0, // x
            -10, // y
            {
                text: bottomText.toUpperCase(),
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
            },
            image.getWidth(),
            image.getHeight()
        );

        // Save the image to a temporary file
        const tempDir = 'temp';
        const resultPath = path.join(tempDir, `meme-${uuidv4()}.png`);
        await image.writeAsync(resultPath);

        console.log(`[Meme] Meme created and saved to: ${resultPath}`);
        return resultPath;

    } catch (error) {
        console.error('[Meme] Failed to create meme:', error);
        throw new Error('Failed to create the meme image.');
    }
}
