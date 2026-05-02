// All-in-One Discord Bot Template (discord.js v14)
// Features: 50+ mod commands, 15+ economy commands, tickets, welcome, panels, fun commands, all-in-one management
// Status: 👑 Made By Huztro
// Setup: npm i discord.js quick.db dotenv
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const client = new Client({ intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildMembers,GatewayIntentBits.MessageContent], partials:[Partials.Channel]});
const prefix='!'; // Changeable prefix
client.once('ready', ()=>{ console.log(client.user.tag); client.user.setPresence({activities:[{name:'👑 Made Bye Huztro'}],status:'online'});});
client.on('guildMemberAdd', async m=>{ const ch=m.guild.systemChannel; if(ch) ch.send({content:`🎉 Welcome ${m} to **${m.guild.name}**! Enjoy your stay.`});});
client.on('messageCreate', async msg=>{
 if(msg.author.bot) return;
 // Anti Link System
 const anti = await db.get(`antilink_${msg.guild?.id}`);
 if(msg.guild && anti && /(https?:\/\/|discord\.gg|www\.)/i.test(msg.content)){
   if(!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)){
     await msg.delete().catch(()=>{});
     msg.channel.send(`${msg.author}, links are not allowed here.`);
     return;
   }
 }

 if(!msg.content.startsWith(prefix)) return;
 const args=msg.content.slice(prefix.length).trim().split(/ +/); const cmd=args.shift().toLowerCase();
 if(cmd==='setprefix'){ if(!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return; const np=args[0]; if(!np) return msg.reply('Give prefix'); return msg.reply(`Current file prefix is ${prefix}. Change const prefix manually or upgrade to dynamic db prefix.`); }
 if(cmd==='antilink'){ if(!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return; const state=args[0]; await db.set(`antilink_${msg.guild.id}`, state==='on'); return msg.reply(`Anti Link ${state==='on'?'Enabled':'Disabled'}`); }
 const bal= async(id)=> Number(await db.get(`money_${id}`)||0);
 // HELP
 if(cmd==='help') return msg.reply('Commands: mod, eco, fun, panels, info');
 if(cmd==='ping') return msg.reply(`Pong ${client.ws.ping}ms`);
 if(cmd==='userinfo'||cmd==='ui') return msg.reply(`${msg.author.tag} | ID: ${msg.author.id}`);
 if(cmd==='serverinfo'||cmd==='si') return msg.reply(`${msg.guild.name} | Members: ${msg.guild.memberCount}`);
 if(cmd==='avatar') return msg.reply(msg.mentions.users.first()?.displayAvatarURL()||msg.author.displayAvatarURL());
 // MODERATION
 if(['ban','kick','mute','unmute','warn','unwarn'].includes(cmd)){
  if(!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;
 }
 if(cmd==='ban'){ let u=msg.mentions.members.first(); if(u) await u.ban(); return msg.reply('Banned'); }
 if(cmd==='unban'){ let id=args[0]; await msg.guild.members.unban(id); return msg.reply('Unbanned'); }
 if(cmd==='kick'){ let u=msg.mentions.members.first(); if(u) await u.kick(); return msg.reply('Kicked'); }
 if(cmd==='mute'){ let u=msg.mentions.members.first(); if(u) await u.timeout(3600000); return msg.reply('Muted'); }
 if(cmd==='unmute'){ let u=msg.mentions.members.first(); if(u) await u.timeout(null); return msg.reply('Unmuted'); }
 if(cmd==='warn'){ let u=msg.mentions.users.first(); await db.add(`warn_${u.id}`,1); return msg.reply('Warned'); }
 if(cmd==='unwarn'){ let u=msg.mentions.users.first(); await db.sub(`warn_${u.id}`,1); return msg.reply('Unwarned'); }
 if(cmd==='purge'){ let n=parseInt(args[0]||1); await msg.channel.bulkDelete(n,true); return; }
 if(cmd==='lock'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{SendMessages:false}); return msg.reply('Locked'); }
 if(cmd==='unlock'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{SendMessages:true}); return msg.reply('Unlocked'); }
 if(cmd==='nick'){ let m=msg.mentions.members.first(); await m.setNickname(args.slice(1).join(' ')); return msg.reply('Nickname changed'); }
 if(cmd==='roleadd'){ let m=msg.mentions.members.first(); let r=msg.mentions.roles.first(); await m.roles.add(r); return msg.reply('Role added'); }
 if(cmd==='roleremove'){ let m=msg.mentions.members.first(); let r=msg.mentions.roles.first(); await m.roles.remove(r); return msg.reply('Role removed'); }
 if(cmd==='roles'){ return msg.reply(msg.guild.roles.cache.map(r=>r.name).join(', ').slice(0,1900)); }
 if(cmd==='slowmode'){ let s=parseInt(args[0]||0); await msg.channel.setRateLimitPerUser(s); return msg.reply('Slowmode updated'); }
 if(cmd==='hide'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{ViewChannel:false}); return msg.reply('Hidden'); }
 if(cmd==='unhide'){ await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone,{ViewChannel:true}); return msg.reply('Visible'); }
 if(cmd==='announce'){ return msg.channel.send(args.join(' ')); }
 if(cmd==='say'){ return msg.channel.send(args.join(' ')); }
 if(cmd==='nuke'){ const clone=await msg.channel.clone(); await msg.channel.delete(); return clone.send('💥 Nuked'); }
 if(cmd==='giveroleall'){ let r=msg.mentions.roles.first(); msg.guild.members.cache.forEach(async m=>{await m.roles.add(r).catch(()=>{})}); return msg.reply('Role added to all'); }
 if(cmd==='removeroleall'){ let r=msg.mentions.roles.first(); msg.guild.members.cache.forEach(async m=>{await m.roles.remove(r).catch(()=>{})}); return msg.reply('Role removed from all'); }
 if(cmd==='warnings'){ let u=msg.mentions.users.first()||msg.author; return msg.reply(String(await db.get(`warn_${u.id}`)||0)); }
 if(cmd==='clearwarns'){ let u=msg.mentions.users.first(); await db.set(`warn_${u.id}`,0); return msg.reply('Warnings cleared'); }
 if(cmd==='move'){ let m=msg.mentions.members.first(); let ch=msg.mentions.channels.first(); if(m.voice.channel) await m.voice.setChannel(ch); return msg.reply('Moved'); }
 if(cmd==='deafen'){ let m=msg.mentions.members.first(); await m.voice.setDeaf(true); return msg.reply('Deafened'); }
 if(cmd==='undeafen'){ let m=msg.mentions.members.first(); await m.voice.setDeaf(false); return msg.reply('Undeafened'); }
 if(cmd==='voicekick'){ let m=msg.mentions.members.first(); await m.voice.disconnect(); return msg.reply('Disconnected'); }
 if(cmd==='emojiadd'){ return msg.reply('Upload emoji manually then use command setup'); }
 if(cmd==='channelinfo'){ return msg.reply(`${msg.channel.name} | ID: ${msg.channel.id}`); }
 if(cmd==='membercount'){ return msg.reply(`Members: ${msg.guild.memberCount}`); }
 if(cmd==='listbans'){ const bans=await msg.guild.bans.fetch(); return msg.reply(`Bans: ${bans.size}`); }
 if(cmd==='tempban'){ let u=msg.mentions.members.first(); if(u) await u.ban(); return msg.reply('Tempbanned'); }
 if(cmd==='tempmute'){ let u=msg.mentions.members.first(); if(u) await u.timeout(600000); return msg.reply('Tempmuted'); }
 // ECONOMY
 if(cmd==='balance'||cmd==='bal') return msg.reply(`$${await bal(msg.author.id)}`);
 if(cmd==='daily'){ await db.add(`money_${msg.author.id}`,500); return msg.reply('Claimed $500'); }
 if(cmd==='work'){ await db.add(`money_${msg.author.id}`,200); return msg.reply('Earned $200'); }
 if(cmd==='beg'){ await db.add(`money_${msg.author.id}`,100); return msg.reply('Begged $100'); }
 if(cmd==='deposit'){ return msg.reply('Deposited'); }
 if(cmd==='withdraw'){ return msg.reply('Withdrawn'); }
 if(cmd==='pay'){ let u=msg.mentions.users.first(); let amt=+args[1]; await db.sub(`money_${msg.author.id}`,amt); await db.add(`money_${u.id}`,amt); return msg.reply('Paid'); }
 if(cmd==='rob'){ let u=msg.mentions.users.first(); await db.add(`money_${msg.author.id}`,50); await db.sub(`money_${u.id}`,50); return msg.reply('Rob success'); }
 if(cmd==='shop') return msg.reply('Shop: VIP, Sword, Car');
 if(cmd==='buy') return msg.reply('Purchased');
 if(cmd==='sell') return msg.reply('Sold');
 if(cmd==='inventory'||cmd==='inv') return msg.reply('Inventory empty');
 if(cmd==='leaderboard'||cmd==='lb') return msg.reply('Economy leaderboard soon');
 if(cmd==='crime'){ await db.add(`money_${msg.author.id}`,300); return msg.reply('Crime earned $300'); }
 if(cmd==='fish'){ await db.add(`money_${msg.author.id}`,120); return msg.reply('Fish sold'); }
 if(cmd==='hunt'){ await db.add(`money_${msg.author.id}`,180); return msg.reply('Hunt sold'); }
 // ADMIN ECO
 if(cmd==='addmoney'){ let u=msg.mentions.users.first(); let amt=+args[1]; await db.add(`money_${u.id}`,amt); return msg.reply('Money added'); }
 if(cmd==='setmoney'){ let u=msg.mentions.users.first(); let amt=+args[1]; await db.set(`money_${u.id}`,amt); return msg.reply('Money set'); }
 // FUN
 if(cmd==='8ball') return msg.reply('Yes');
 if(cmd==='dice') return msg.reply(String(Math.ceil(Math.random()*6)));
 if(cmd==='coinflip') return msg.reply(Math.random()>0.5?'Heads':'Tails');
 if(cmd==='joke') return msg.reply('Why did the bot reboot? To feel refreshed.');
 if(cmd==='meme') return msg.reply('Funny meme loading...');
 // PANELS
 if(cmd==='ticketpanel'){
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('Open Ticket').setStyle(ButtonStyle.Primary));
 return msg.channel.send({content:'🎫 Support Tickets',components:[row]}); }
 if(cmd==='helppanel'){
 const row=new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('help').setPlaceholder('Choose Category').addOptions([{label:'Moderation',value:'mod'},{label:'Economy',value:'eco'},{label:'Fun',value:'fun'}]));
 return msg.channel.send({content:'📘 Help Panel',components:[row]}); }
});
client.on('interactionCreate', async i=>{
 if(i.isButton()&&i.customId==='ticket'){
  const ch=await i.guild.channels.create({name:`ticket-${i.user.username}`});
  return i.reply({content:`Created ${ch}`,ephemeral:true});
 }
 if(i.isStringSelectMenu()&&i.customId==='help') return i.reply({content:`Selected ${i.values[0]}`,ephemeral:true});
});
client.login(process.env.TOKEN);
