'use strict'
module.exports = async(obj, patreon, opt)=>{
  try{
    let msg2send = {content: 'You don\'t have any users or guilds registered'}, sendMethod = 'PATCH'
    if(patreon.guilds.length > 0 || patreon.users.length > 0){
      sendMethod = 'POST'
      msg2send.flags = 64
      msg2send.embeds = []
      if(patreon.guilds.length > 0){
        const guildMsg = {
          color: 15844367,
          title: 'Arena Synced Guilds ('+patreon.guilds.length+')',
          description: '```\n'
        }
        for(let i in patreon.guilds){
          if(!patreon.guilds[i].name){
            const guild = await HP.GetGuildName(patreon.guilds[i].id)
            if(guild && guild.guildName) patreon.guilds[i].name = guild.guildName
          }
          guildMsg.description += (patreon.guilds[i].name ? patreon.guilds[i].name:'Unknown Guild')+(patreon.guilds[i].chId ? ' : <#'+patreon.guilds[i].chId+'>':'')+'\n'
        }
        guildMsg.description += '```'
        msg2send.embeds.push(guildMsg)
        //MSG.SendDM(patreon._id, {embed: guildMsg})
      }
      if(patreon.users.length > 0){
        for(let i=0, j = patreon.users.length; i < j; i +=25){
          const tempArray = patreon.users.slice(i, i + 25);
          if(tempArray.length > 0){
            const usrMsg = {
              color: 15844367,
              description: ''
            }
            if(i == 0) usrMsg.title = 'Arena Synced players ('+patreon.users.length+')'
            if(i == 0 && patreon.logChannel) usrMsg.description += 'Log Channel : <#'+patreon.logChannel+'>\n'
            usrMsg.description += 'allyCode  : Game : Discord\n```\n'
            for(let p in tempArray){
              let usr
              const dObj = (await mongo.find('discordId', {'allyCodes.allyCode': tempArray[p].allyCode}))[0]
              if(dObj) usr = await BotSocket.call('botInfo', {shard: 0, dId: dObj._id}, 'user')
              usrMsg.description += tempArray[p].allyCode+' : '+tempArray[p].name+' : @'+(usr ? usr.tag:'unknown')+'\n'
            }
            usrMsg.description += '```'
            msg2send.embeds.push(usrMsg)
          }
        }
      }
      msg2send.content = null
    }
    if(msg2send.flags) await HP.ReplyButton(obj, 'Sending Private message')
    HP.ReplyMsg(obj, msg2send, sendMethod)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
