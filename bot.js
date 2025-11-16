import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { performFaceSwap } from './faceswap.js';

dotenv.config();

// Health check endpoint for Render
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running!');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// Ensure temp directory exists
if (!fs.existsSync('temp')) {
    fs.mkdirSync('temp');
}

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    console.log('🤖 Bot is ready to swap faces with Charlie Kirk!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kirk') {
        await interaction.deferReply();

        try {
            // Get the uploaded image
            const attachment = interaction.options.getAttachment('image');
            
            if (!attachment) {
                await interaction.editReply('❌ Please provide an image!');
                return;
            }

            // Validate image type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(attachment.contentType)) {
                await interaction.editReply('❌ Please upload a valid image (JPEG, PNG, or WebP)!');
                return;
            }

            await interaction.editReply('🔄 Preparing your image for face swap...');

            const kirkImageUrl = process.env.KIRK_FACE_URL;
            if (!kirkImageUrl) {
                await interaction.editReply(
                    '❌ Bot is misconfigured: KIRK_FACE_URL is not set in the environment.',
                );
                return;
            }

            const userImageUrl = attachment.url;
            await interaction.editReply('🔄 Swapping faces with Charlie Kirk... This may take up to 1 minute!');

            // Perform face swap via VModel API
            const resultPath = await performFaceSwap(userImageUrl, kirkImageUrl);

            // Send result
            const resultAttachment = new AttachmentBuilder(resultPath, { name: 'kirked.png' });
            await interaction.editReply({
                content: '✅ Face swap complete! Here\'s your Charlie Kirk transformation:',
                files: [resultAttachment]
            });

            // Cleanup temporary files
            setTimeout(() => {
                try {
                    if (fs.existsSync(resultPath)) fs.unlinkSync(resultPath);
                } catch (err) {
                    console.error('[Cleanup] Error:', err);
                }
            }, 5000);

        } catch (error) {
            console.error('[Bot] Error:', error);
            await interaction.editReply('❌ An error occurred while processing your image. Please try again later.');
        }
    }
});
//push tests
client.login(process.env.DISCORD_TOKEN);
