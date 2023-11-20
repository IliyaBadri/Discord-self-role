const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete-category')
		.setDescription('Deletes an existing category and its roles from this server.')
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
        db.get(selectQuery, [interaction.guild.id, category], async (err, row) => {
            if (err) {
                console.error(err);
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Failed to check if the category already exists.');

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            if (!row) {
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription(`Category **${category}** does not exist.`);

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            const deleteCategoryQuery = 'DELETE from categories WHERE guildId = ? AND category = ?';
            db.run(deleteCategoryQuery, [interaction.guild.id, category], async function (err) {
                if (err) {
                    console.error(err);
                    db.close();
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Error')
                        .setDescription('Failed to delete the category.');

                    return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                }

                const deleteRolesQuery = 'DELETE from roles WHERE guildId = ? AND category = ?';
                db.run(deleteRolesQuery, [interaction.guild.id, category], async function (err) {
                    if (err) {
                        console.error(err);
                        db.close();
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Error')
                            .setDescription('Failed to delete the category roles.');
    
                        return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                    }

                    const successEmbed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Success')
                        .setDescription(`Category **${category}** deleted successfully.`);

                    await interaction.reply({embeds: [successEmbed]});
                    db.close();
                });
            });
        });
	},
};