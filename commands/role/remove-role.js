const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-role')
		.setDescription('Lets you remove a selectable role from yourself.'),
	async execute(interaction) {

        const db = new sqlite3.Database('database.db');

        const selectRolesQuery = 'SELECT * FROM roles WHERE guildId = ?';
        db.all(selectRolesQuery, [interaction.guild.id], async (err, roleRows) => {
            if (err) {
                console.error(err);
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Failed to list the roles.');

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            const roleOptions = []

            for(const roleRow of roleRows){
                const guildRole = await interaction.guild.roles.fetch(roleRow.roleId);
                const roleName = guildRole.name;
                if(interaction.member.roles.cache.has(roleRow.roleId)){
                    const roleOption = new StringSelectMenuOptionBuilder()
                        .setLabel(roleName)
                        .setValue(Buffer.from(roleRow.roleId).toString('base64'))
                        .setDescription(`Remove the ${roleName} role.`)

                    roleOptions.push(roleOption)
                }
                
            }

            if(roleOptions.length < 1){
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription("You don't have any self assigned roles in this server.");

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            const roleSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-delete-role')
                .addOptions(roleOptions);

            const roleActionRow = new ActionRowBuilder()
                .addComponents(roleSelectMenu);

            const chooseRoleEmbed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setTitle('Please choose a role to delete.')
            
            const response = await interaction.reply({
                embeds: [chooseRoleEmbed],
                components: [roleActionRow],
                ephemeral: true
            });

            const responseCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
            responseCollector.on('collect', async responseInteraction => {
                if(responseInteraction.customId == 'select-delete-role'){

                    const roleSelection = responseInteraction.values[0];
                    const selectedRoleId = Buffer.from(roleSelection, 'base64').toString('ascii');

                    const guildRole = await interaction.guild.roles.fetch(selectedRoleId);
                    const roleName = guildRole.name;

                    try{

                        interaction.member.roles.remove(guildRole)

                        const successEmbed = new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Success')
                            .setDescription(`Successfuly deleted the **${roleName}** role from your profile.`)
                    
                        await interaction.editReply({
                            embeds: [successEmbed],
                            components: []
                        });

                    } catch {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Error')
                            .setDescription(`Couldn't delete the **${roleName}** role from your profile.`)
                    
                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        });
                    }
                }
            });
            responseCollector.on('end', (collected, reason) => {
                db.close();
            });
        });
	},
};