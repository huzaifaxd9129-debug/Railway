require('dotenv').config();

const {
Client,
GatewayIntentBits,
Partials,
PermissionsBitField,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder
} = require('discord.js');

const { QuickDB } = require('quick.db');
const db = new QuickDB();

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
],
partials: [Partials.Channel]
});

const prefix = '!';

client.once('ready',()=>{
console.log(client.user.tag);
client.user.setPresence({activities:[{name:'👑 Made By Huztro'}],status:'online'});
});

client.on('guildMemberAdd',m=>{
const ch=m.guild.systemChannel;
if(ch) ch.send(`🎉 Welcome ${m} to **${m.guild.name}**`);
});

client.on('messageCreate',async msg=>{
if(!msg.guild || msg.author.bot) return;

if(!msg.content.startsWith(prefix)) return;

const args = msg.content.slice(prefix.length).trim().split(/ +/);
const cmd = (args.shift() || '').toLowerCase();

// ANTI LINK
const anti = await db.get(`antilink_${msg.guild.id}`);
if(anti && /(https?:\/\/|discord\.gg|www\.)/i.test(msg.content)){
if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)){
await msg.delete().catch(()=>{});
return msg.channel.send(`${msg.author} links not allowed`);
}
}

// ================= INFO =================
if(cmd==='ping') return msg.reply(`Pong ${client.ws.ping}ms`);
if(cmd==='userinfo') return msg.reply(`${msg.author.tag}`);
if(cmd==='serverinfo') return msg.reply(`${msg.guild.name} | ${msg.guild.memberCount}`);
if(cmd==='avatar') return msg.reply(msg.author.displayAvatarURL());
if(cmd==='roles') return msg.reply(msg.guild.roles.cache.map(r=>r.name).join(', ').slice(0,1900));
if(cmd==='channelinfo') return msg.reply(msg.channel.name);

// ================= MODERATION =================
if(cmd==='ban'){ let m=msg.mentions.members.first(); if(m) await m.ban().catch(()=>{}); return msg.reply('Banned'); }
if(cmd==='kick'){ let m=msg.mentions.members.first(); if(m) await m.kick().catch(()=>{}); return msg.reply('Kicked'); }
if(cmd==='unban'){ let id=args[0]; await msg.guild.members.unban(id).catch(()=>{}); return msg.reply('Unbanned'); }
if(cmd==='mute'){ let m=msg.mentions.members.first(); if(m) await m.timeout(3600000); return msg.reply('Muted'); }
if(cmd==='unmute'){ let m=msg.mentions.members.first(); if(m) await m.timeout(null); return msg.reply('Unmuted'); }
if(cmd==='warn'){ let u=msg.mentions.users.first(); if(u) await db.add(`warn_${u.id}`,1); return msg.reply('Warned'); }
if(cmd==='unwarn'){ let u=msg.mentions.users.first(); if(u) await db.sub(`warn_${u.id}`,1); return msg.reply('Unwarned'); }
if(cmd==='warnings'){ let u=msg.mentions.users.first()||msg.author; return msg.reply(String(await db.get(`warn_${u.id}`)||0)); }
if(cmd==='clearwarns'){ let u=msg.mentions.users.first(); if(u) await db.set(`warn_${u.id}`,0); return msg.reply('Cleared'); }
if(cmd==='purge'){ await msg.channel.bulkDelete(parseInt(args[0]||1),true); return; }
if(cmd==='lock'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{SendMessages:false}); return msg.reply('Locked'); }
if(cmd==='unlock'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{SendMessages:true}); return msg.reply('Unlocked'); }
if(cmd==='slowmode'){ await msg.channel.setRateLimitPerUser(parseInt(args[0]||0)); return msg.reply('Slowmode set'); }
if(cmd==='hide'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{ViewChannel:false}); return msg.reply('Hidden'); }
if(cmd==='unhide'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{ViewChannel:true}); return msg.reply('Visible'); }
if(cmd==='nick'){ let m=msg.mentions.members.first(); if(m) await m.setNickname(args.slice(1).join(' ')); return msg.reply('Nick changed'); }
if(cmd==='roleadd'){ let m=msg.mentions.members.first(); let r=msg.mentions.roles.first(); if(m && r) await m.roles.add(r); return msg.reply('Role added'); }
if(cmd==='roleremove'){ let m=msg.mentions.members.first(); let r=msg.mentions.roles.first(); if(m && r) await m.roles.remove(r); return msg.reply('Role removed'); }
if(cmd==='giveroleall'){ let r=msg.mentions.roles.first(); if(r) msg.guild.members.cache.forEach(m=>m.roles.add(r).catch(()=>{})); return msg.reply('Done'); }
if(cmd==='removeroleall'){ let r=msg.mentions.roles.first(); if(r) msg.guild.members.cache.forEach(m=>m.roles.remove(r).catch(()=>{})); return msg.reply('Done'); }
if(cmd==='move'){ let m=msg.mentions.members.first(); let ch=msg.mentions.channels.first(); if(m && m.voice && m.voice.channel) await m.voice.setChannel(ch); return msg.reply('Moved'); }
if(cmd==='deafen'){ let m=msg.mentions.members.first(); if(m) await m.voice.setDeaf(true); return msg.reply('Deafened'); }
if(cmd==='undeafen'){ let m=msg.mentions.members.first(); if(m) await m.voice.setDeaf(false); return msg.reply('Undeafened'); }
if(cmd==='voicekick'){ let m=msg.mentions.members.first(); if(m) await m.voice.disconnect(); return msg.reply('Kicked VC'); }
if(cmd==='listbans'){ let b=await msg.guild.bans.fetch(); return msg.reply(`Bans ${b.size}`); }

// ================= ECONOMY =================
if(cmd==='bal') return msg.reply(`$${await db.get(`money_${msg.author.id}`)||0}`);
if(cmd==='daily'){ await db.add(`money_${msg.author.id}`,500); return msg.reply('+500'); }
if(cmd==='work'){ await db.add(`money_${msg.author.id}`,200); return msg.reply('+200'); }
if(cmd==='beg'){ await db.add(`money_${msg.author.id}`,100); return msg.reply('+100'); }
if(cmd==='crime'){ await db.add(`money_${msg.author.id}`,300); return msg.reply('+300'); }
if(cmd==='fish'){ await db.add(`money_${msg.author.id}`,150); return msg.reply('+150'); }
if(cmd==='hunt'){ await db.add(`money_${msg.author.id}`,180); return msg.reply('+180'); }
if(cmd==='rob'){ await db.add(`money_${msg.author.id}`,50); return msg.reply('Robbed'); }
if(cmd==='pay'){ let u=msg.mentions.users.first(); let a=parseInt(args[1]); if(u && a) { await db.sub(`money_${msg.author.id}`,a); await db.add(`money_${u.id}`,a); } return msg.reply('Paid'); }
if(cmd==='addmoney'){ let u=msg.mentions.users.first(); let a=parseInt(args[1]); if(u && a) await db.add(`money_${u.id}`,a); return msg.reply('Added'); }
if(cmd==='setmoney'){ let u=msg.mentions.users.first(); let a=parseInt(args[1]); if(u && a) await db.set(`money_${u.id}`,a); return msg.reply('Set'); }

// ================= FUN =================
if(cmd==='8ball') return msg.reply('Yes');
if(cmd==='dice') return msg.reply(String(Math.ceil(Math.random()*6)));
if(cmd==='coinflip') return msg.reply(Math.random()>0.5?'Heads':'Tails');
if(cmd==='joke') return msg.reply('Funny bot joke');

// ================= PANELS =================
if(cmd==='ticketpanel'){
const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('Ticket').setStyle(ButtonStyle.Primary));
return msg.channel.send({content:'Ticket System',components:[row]});
}
});

client.on('interactionCreate',async i=>{
if(i.isButton() && i.customId==='ticket'){
const ch=await i.guild.channels.create({name:`ticket-${i.user.username}`});
return i.reply({content:`Created ${ch}`,ephemeral:true});
}
});

client.login(process.env.TOKEN);
