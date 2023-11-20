const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete-role')
		.setDescription('Deletes a role from a specified category from this server.')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('The category name')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role name')
                .setRequired(true)
        ),
	async execute(interaction) {
        const member = interaction.member;

		if(!member.permissions.has(PermissionsBitField.Flags.Administrator)){
            const errorEmbed = new EmbedBuilder()
                .setColor(0x000000)
                .setTitle('Error')
                .setDescription('You need administrator privilages to use this command.')

            interaction.reply({embeds:[errorEmbed], ephemeral: true});
        }

        const category = interaction.options.getString('category');
        const role = interaction.options.getRole('role');

        const db = new sqlite3.Database('database.db');

        const selectCategoryQuery = 'SELECT * FROM categories WHERE guildId = ? AND category = ?';
        db.get(selectCategoryQuery, [interaction.guild.id, category], (err, row) => {

            if (err) {
                console.error(err);
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Failed to check if the category exists.');

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

            const selectRoleQuery = 'SELECT * FROM roles WHERE guildId = ? AND category = ? AND roleId = ?';
            db.get(selectRoleQuery, [interaction.guild.id, category, role.id], (err, row) => {
                if (err) {
                    console.error(err);
                    db.close();
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Error')
                        .setDescription('Failed to check if the role exists.');

                    return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                }

                if (!row) {
                    db.close();
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Error')
                        .setDescription(`Role **${role.name}** does not exists.`);

                    return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                }

                const deleteQuery = 'DELETE FROM roles WHERE guildId = ? AND category = ? AND roleId = ?';
                db.run(deleteQuery, [interaction.guild.id, category , role.id], function (err) {
                    if (err) {
                        console.error(err);
                        db.close();
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Error')
                            .setDescription('Failed to delete the role.');

                        return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                    }

                    const successEmbed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Success')
                        .setDescription(`Role **${role.name}** was deleted successfully from the **${category}** category.`);

                    interaction.reply({embeds: [successEmbed]});
                    db.close();
                });
            });
        });
	},
};