'use strict'
const mongo = require('mongoclient')
const { GetChannel } = require('src/helpers/discordmsg')
const { getOptValue, buttonPick, getGuildName } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let guildId, gObj, channelPerm = 1, msg2send = {content: 'You do not have any guilds configured'}
  let chId = getOptValue(opt, 'channel')
  if(patreon.guilds?.length > 0){
    if(obj.confirm?.guildId) guildId = obj.confirm.guildId
    if(chId){
      let checkPerm = await GetChannel(chId)
      if(!checkPerm || !checkPerm.id) channelPerm = 0
    }
  }
  if(!channelPerm) msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
  if(channelPerm){
    msg2send.content = 'Error getting guild Information'
    let guilds = []
    for(let i in patreon.guilds){
      if(!patreon.guilds[i].name){
        let guild = await getGuildName(patreon.guilds[i].id)
        if(guild?.guildName) patreon.guilds[i].name = guild.guildName
      }
      if(patreon.guilds[i].name) guilds.push(patreon.guilds[i])
    }
    if(!guildId && guilds.length > 0){
      let embedMsg = {
        content: 'Which guild do you want to change?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in guilds){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: guilds[i].name,
          style: 1,
          custom_id: JSON.stringify({id: obj.id, guildId: guilds[i].id})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      await buttonPick(obj, embedMsg)
      return
    }
    if(guildId && guilds.find(x=>x.id === guildId)) gObj = guilds.find(x=>x.id == guildId)
    if(gObj){
      if(chId){
        gObj.chId = chId
        gObj.sId = obj.guild_id
      }else{
        delete gObj.chId
        delete gObj.sId
      }
      await mongo.pull('patreon', {_id: patreon._id}, {guilds: {id: gObj.id}})
      await mongo.push('patreon', {_id: patreon._id}, {guilds: gObj})
      msg2send.content = 'Guild '+(gObj.name ? '**'+gObj.name+'** ':'')+' was updated.'
    }
  }
  return msg2send
}
