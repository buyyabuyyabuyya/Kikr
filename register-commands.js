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
