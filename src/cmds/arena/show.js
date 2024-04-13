'use strict'
const { getGuildName, replyMsg, replyButton } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let msg2send = {content: 'You don\'t have any users or guilds registered'}, sendMethod = 'PATCH'
  if(patreon.guilds?.length > 0 || patreon.users?.length > 0){
    sendMethod = 'POST'
    msg2send.flags = 64
    msg2send.embeds = []
    msg2send.content = null
  }
  if(patreon.guilds?.length > 0){
    let guildMsg = {
      color: 15844367,
      title: 'Arena Synced Guilds ('+patreon.guilds.length+')',
      description: '```\n'
    }
    for(let i in patreon.guilds){
      if(!patreon.guilds[i].name){
        let guild = await getGuildName(patreon.guilds[i].id)
        if(guild && guild.guildName) patreon.guilds[i].name = guild.guildName
      }
      guildMsg.description += (patreon.guilds[i].name ? patreon.guilds[i].name:'Unknown Guild')+(patreon.guilds[i].chId ? ' : <#'+patreon.guilds[i].chId+'>':'')+'\n'
    }
    guildMsg.description += '```'
    msg2send.embeds.push(guildMsg)
  }
  if(patreon.users?.length > 0){
    for(let i=0, j = patreon.users.length; i < j; i +=25){
      let tempArray = patreon.users.slice(i, i + 25);
      if(tempArray.length > 0){
        let usrMsg = {
          color: 15844367,
          description: ''
        }
        if(i == 0) usrMsg.title = 'Arena Synced players ('+patreon.users.length+')'
        if(i == 0 && patreon.logChannel) usrMsg.description += 'Log Channel : <#'+patreon.logChannel+'>\n'
        usrMsg.description += 'allyCode  : Game : Discord\n```\n'
        for(let p in tempArray){
          let usr
          let dObj = (await mongo.find('discordId', {'allyCodes.allyCode': tempArray[p].allyCode}))[0]
          if(dObj) usr = await HP.BotRequest('getMember', {podName: 'bot-0', dId: dObj._id})
          usrMsg.description += tempArray[p].allyCode+' : '+tempArray[p].name+' : @'+(usr ? usr.tag:'unknown')+'\n'
        }
        usrMsg.description += '```'
        msg2send.embeds.push(usrMsg)
      }
    }
  }
  if(msg2send.flags) await replyButton(obj, 'Sending Private message')
  await replyMsg(obj, msg2send, sendMethod)
}
