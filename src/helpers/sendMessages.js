'use strict'
const mongo = require('mongoclient')
const { SendDM, GetUser } = require('./discordmsg')
const getLowTickets = require('./getLowTickets')
const momWatchMsg = (member, momId)=>{
  let momMsg = "Oh Dear!\nI am sorry to bother you, my maker suggested that I send you a message about the following slackers who have not gotten thier daily 600 done : \n```\n"
  for(let i in member){
    momMsg += member[i].name+' only has '+member[i].tickets+'\n'
  }
  momMsg += '```'
  SendDM(momId, {content: momMsg})
}
const getPlayerDiscordId = async(playerId)=>{
  let obj = (await mongo.find('discordId', {'allyCodes.playerId': playerId}))[0]
  if(obj) return obj._id
}
module.exports = async(obj, gObj)=>{
  let momWatch = [], momId, ticketCount = 600
  let guild = (await mongo.find('guilds', {_id: gObj.profile.id}))[0]
  if(guild && guild.auto){
    mongo.set('guilds', {_id: gObj.profile.id}, {'auto.sent': Date.now()})
    if(guild.auto.momWatch && guild.auto.momWatch.length > 0) momWatch = guild.auto.momWatch;
    if(guild.auto.momId) momId = guild.auto.momId
    if(guild.auto.ticketCount >= 0) ticketCount = + guild.auto.ticketCount
  }
  let member = gObj.member.filter(x => x.memberContribution.some(m => m.type == 2 && +m.currentValue < ticketCount)).map(p => {
    return Object.assign({}, { playerId: p.playerId, name: p.playerName, tickets: +(p.memberContribution.find(t => t.type == 2).currentValue) })
  })
  if(member.length > 0){
    let guildMsg = ''
    let lowTicketMsg = "Hi! If you are online, Please get your "+ticketCount+" done!\nCurrent Ticket Count : "
    let momWatchMember = []
    for (let i in member) {
      if (momWatch && momWatch.filter(x => x.playerId === member[i].playerId).length > 0) momWatchMember.push(member[i]);
      let discordId = await getPlayerDiscordId(member[i].playerId)
      if (discordId) {
        let status = await SendDM(discordId, {content: lowTicketMsg + member[i].tickets})
        if(status?.id){
          guildMsg += 'message sent to ' + member[i].name+'\n'
        }else{
          guildMsg += 'unable to send a DM to ' + member[i].name+'\n'
        }
      } else {
        guildMsg += member[i].name + ' does not have allyCode linked to discordId\n'
      }
    }
    if(momId && momWatchMember.length > 0){
      momWatchMsg(momWatchMember, momId)
      let momName = 'Mom';
      let usr = await GetUser(momId);
      if(usr) momName = usr.username
      guildMsg += 'Message sent to '+momName+' about their posse\n'
    }
    await SendMsg(obj, {content: guildMsg})
  }
  let embedMsg = await getLowTickets(gObj, ticketCount);
  if (embedMsg) await SendMsg(obj, { embeds: [embedMsg] });
}
