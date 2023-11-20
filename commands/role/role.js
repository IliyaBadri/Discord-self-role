const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Lets you add a selectable role to yourself.'),
	async execute(interaction) {

        const db = new sqlite3.Database('database.db');

        const selectCategoriesQuery = 'SELECT * FROM categories WHERE guildId = ?';
        db.all(selectCategoriesQuery, [interaction.guild.id], async (err, categoryRows) => {
            if (err) {
                console.error(err);
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Failed to list the categories.');

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            let categoryOptions = []

            for(const categoryRow of categoryRows){
                const categoryOption = new StringSelectMenuOptionBuilder()
                    .setLabel(categoryRow.category)
                    .setValue(Buffer.from(categoryRow.category).toString('base64'))
                    .setDescription(`Selects the ${categoryRow.category} category.`)

                categoryOptions.push(categoryOption)
            }

            if(categoryOptions.length < 1){
                db.close();
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('There are no categories in this server.');

                return interaction.reply({embeds: [errorEmbed], ephemeral: true});
            }

            const categorySelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-category')
                .addOptions(categoryOptions);

            const categoryActionRow = new ActionRowBuilder()
                .addComponents(categorySelectMenu);

            const chooseCategoryEmbed = new EmbedBuilder()
                .setColor(0x0000ff)
                .setTitle('Please choose a role category.')
            
            const response = await interaction.reply({
                embeds: [chooseCategoryEmbed],
                components: [categoryActionRow],
                ephemeral: true
            });

            const responseCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
            responseCollector.on('collect', async responseInteraction => {
                if(responseInteraction.customId == 'select-category'){

                    const categorySelection = responseInteraction.values[0];
                    const selectedCategory = Buffer.from(categorySelection, 'base64').toString('ascii');

                    

                    const categorySelectResponseInteractionEmbed = new EmbedBuilder()
                        .setColor(0xffffff)
                        .setTitle('Interaction recieved.')

                    responseInteraction.reply({
                        embeds: [categorySelectResponseInteractionEmbed],
                        ephemeral: true
                    });

                    function delayedResponseInteractionDelete() {
                        responseInteraction.deleteReply();
                    }
                      
                    setTimeout(delayedResponseInteractionDelete, 1000);

                    const selectRolesQuery = 'SELECT * FROM roles WHERE guildId = ? AND category = ?';
                    db.all(selectRolesQuery, [interaction.guild.id, selectedCategory], async (err, roleRows) => {
                        if (err) {
                            console.error(err);
                            db.close();
                            const errorEmbed = new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle('Error')
                                .setDescription('Failed to list the roles.');

                            return responseInteraction.reply({embeds: [errorEmbed], ephemeral: true});
                        }
                    
                        const roleOptions = []

                        for(const roleRow of roleRows){

                            const guildRole = await interaction.guild.roles.fetch(roleRow.roleId);

                            const roleName = guildRole.name;

                            if(!roleName){
                                const deleteRoleQuery = 'DELETE FROM roles WHERE id = ?';
                                db.run(deleteRoleQuery, [roleRow.id], (deleteErr) => {
                                    if (deleteErr) {
                                        console.error(deleteErr);
                                    }
                                });

                                continue;
                            }

                            const roleOption = new StringSelectMenuOptionBuilder()
                                .setLabel(roleName)
                                .setValue(Buffer.from(roleRow.roleId).toString('base64'))
                                .setDescription(`Adds the ${roleName} role to your profile.`)
                        
                            roleOptions.push(roleOption)
                        }

                        if(roleOptions.length < 1){
                            db.close();
                            const errorEmbed = new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle('Error')
                                .setDescription('There are no roles in this category.');
            
                            return responseInteraction.reply({embeds: [errorEmbed]});
                        }

                        const roleSelectMenu = new StringSelectMenuBuilder()
                            .setCustomId('select-role')
                            .addOptions(roleOptions);

                        const roleActionRow = new ActionRowBuilder()
                            .addComponents(roleSelectMenu);

                        const chooseRoleEmbed = new EmbedBuilder()
                            .setColor(0x0000ff)
                            .setTitle('Please choose a role.')
                        
                    
                        await interaction.editReply({
                            embeds: [chooseRoleEmbed],
                            components: [roleActionRow]
                        });
                    });
                } else if (responseInteraction.customId == 'select-role') {

                    const roleSelection = responseInteraction.values[0];
                    const selectedRoleBase64 = Buffer.from(roleSelection, 'base64').toString('ascii');

                    const selectedRole = await interaction.guild.roles.fetch(selectedRoleBase64);

                    const selectedRoleName = selectedRole.name;

                    try{

                        interaction.member.roles.add(selectedRole);

                        const successEmbed = new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('Successfuly added the role to your profile.')
                            .setDescription(`**Role:** ${selectedRoleName}`) 
                        
                        await interaction.editReply({embeds: [successEmbed], components:[]});

                    } catch {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Error')
                            .setDescription("I cannot add the role to your profile.") 
                        
                        await interaction.editReply({embeds: [errorEmbed], components:[]});
                    }

                    
                }
            });

            responseCollector.on('end', (collected, reason) => {
                db.close();
            });
        });
	},
};