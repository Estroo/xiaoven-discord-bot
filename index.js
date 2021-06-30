const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const enmap = require('enmap');
const {prefix} = require('./config.json');

const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});

client.on('prêt', () => {
    console.log('bot prêt !')
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "ticket-setup") {
        // ticket-setup #channel

        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("usage: `;ticket-setup #channel`");

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle("Créer un ticket !")
            .setDescription("Réagissez pour créer un ticket !")
            .setFooter("Créé par 𝐾𝑢𝑟𝑎𝑝𝑖𝑘𝑎 🌙#1009")
            
            .setColor("#000000")
        );

        sent.react('📝');
        settings.set(`${message.guild.id}-ticket`, sent.id);

        message.channel.send("Ticket système prêt !")
    }

    if(command == "close") {
        if(!message.channel.name.includes("ticket-")) return message.channel.send("Tu ne peux pas utiliser ça ici !")
        message.channel.delete();
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '📝') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed().setTitle("Ton ticket").setDescription("Décris ta demande ici !").setColor("#000000"))
        })
    }
});

client.login(process.env.TOKEN);
