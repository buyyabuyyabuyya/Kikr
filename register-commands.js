import { REST, Routes, ApplicationCommandOptionType } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
    {
        name: 'kirk',
        description: 'Swap your face with Charlie Kirk\'s face!',
        options: [
            {
                name: 'image',
                description: 'The image to face-swap',
                type: ApplicationCommandOptionType.Attachment,
                required: true
            }
        ]
    },
    {
        name: 'meme',
        description: 'Create a meme with top and bottom text.',
        options: [
            {
                name: 'image',
                description: 'The image for the meme',
                type: ApplicationCommandOptionType.Attachment,
                required: true
            },
            {
                name: 'top_text',
                description: 'The text to display at the top of the image',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'bottom_text',
                description: 'The text to display at the bottom of the image',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
