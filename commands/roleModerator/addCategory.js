const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-category')
		.setDescription('Adds a selectable role category for this server.')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('The category name')
                .setRequired(true)
        ),
	async execute(interaction) {
        const member = interaction.member;

		if(!member.permissions.has(PermissionsBitField.Flags.Administrator)){
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Error')
                .setDescription('You need administrator privilages to use this command.')

            interaction.reply({embeds:[errorEmbed], ephemeral: true});
        }

        const category = interaction.options.getString('category');

        const db = new sqlite3.Database('database.db');

        const selectQuery = 'SELECT * FROM categories WHERE guildId = ? AND category = ?';
        db.get(selectQuery, [interaction.guild.id, category], (err, row) => {
            if (err) {
                console.error(err);
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Failed to check if the category already exists.');

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            if (row) {
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription(`Category **${category}** already exists.`);

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            const insertQuery = 'INSERT INTO categories (guildId, category) VALUES (?, ?)';
            db.run(insertQuery, [interaction.guild.id, category], function (err) {
                if (err) {
                    console.error(err);
                    db.close();
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Error')
                        .setDescription('Failed to add the category.');

                    return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                }

                const successEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Success')
                    .setDescription(`Category **${category}** added successfully.`);

                interaction.reply({embeds: [successEmbed]});
                db.close();
            });
        });
	},
};