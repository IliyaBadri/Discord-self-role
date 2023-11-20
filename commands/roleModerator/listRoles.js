const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list-roles')
		.setDescription('Lists all added roles for this server.'),
	async execute(interaction) {
        const member = interaction.member;

		if(!member.permissions.has(PermissionsBitField.Flags.Administrator)){
            const errorEmbed = new EmbedBuilder()
                .setColor(0x000000)
                .setTitle('Error')
                .setDescription('You need administrator privilages to use this command.')

            interaction.reply({embeds:[errorEmbed], ephemeral: true});
        }

        const db = new sqlite3.Database('database.db');

        const selectRoleQuery = 'SELECT * FROM roles WHERE guildId = ?';
        db.all(selectRoleQuery, [interaction.guild.id], async (err, rows) => {
            if (err) {
                console.error(err);
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Failed to list the roles.');

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            rolesList = []

            for(const row of rows){
                const guild = interaction.guild;

                const _role = await guild.roles.fetch(row.roleId);

                const _roleName = _role.name

                if(!_roleName){
                    const deleteRoleQuery = 'DELETE FROM roles WHERE id = ?';
                    db.run(deleteRoleQuery, [row.id], (deleteErr) => {
                        if (deleteErr) {
                            console.error(deleteErr);
                        }
                    });

                    continue;
                }

                rolesList.push({
                    category: row.category,
                    roleName: _roleName
                });
            }

            const successEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Roles List')
                .setDescription(buildRolesListString(rolesList));

            db.close();
            return interaction.reply({ embeds: [successEmbed]});
        });
	},
};

function buildRolesListString(rolesList) {
    let result = '';
    rolesList.forEach(role => {
        result += `**Category:** ${role.category}, **Role:** ${role.roleName}\n`;
    });

    if(result == ''){
        result = '**Empty**';
    }
    return result;
}