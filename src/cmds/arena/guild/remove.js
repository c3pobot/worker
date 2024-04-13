'use strict'
const mongo = require('mongoclient')
const { buttonPick, getGuildName } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let guildId, gObj, msg2send = {content: 'You do not have any guilds configured'}, guilds = []
  if(obj.confirm?.guildId) guildId = obj.confirm.guildId
  if(patreon.guilds?.length > 0){
    msg2send.content = 'Error getting guild Information'
    for(let i in patreon.guilds){
      if(!patreon.guilds[i].name){
        let guild = await getGuildName(patreon.guilds[i].id)
        if(guild && guild.guildName) patreon.guilds[i].name = guild.guildName
      }
      if(patreon.guilds[i].name) guilds.push(patreon.guilds[i])
    }
  }
  if(!guildId && guilds.length > 0){
    let embedMsg = {
      content: 'Which guild do you want to remove?',
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
  if(guildId && guilds.find(x=>x.id == guildId)) gObj = guilds.find(x=>x.id == guildId)
  if(gObj){
    await mongo.pull('patreon', {_id: patreon._id}, {guilds: {id: gObj.id}})
    msg2send.content = 'Guild '+(gObj.name ? '**'+gObj.name+'** ':'')+' was removed from your list.'
  }
  return msg2send
}
