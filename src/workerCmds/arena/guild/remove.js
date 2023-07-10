'use strict'
const { mongo, ButtonPick, GetGuildName, GetOptValue, ReplyButton, ReplyMsg } = require('helpers')
const { GetChannel } = require('discordapiclient')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let guildId, gObj, guilds = [], msg2send = {content: 'You do not have any guilds configured'}
    if(obj?.confirm?.guildId) guildId = obj.confirm.guildId
    if(patreon.guilds?.length > 0){
      await ReplyButton(obj, 'Getting guild names..')
      msg2send.content = 'Error getting guild Information'
      for(let i in patreon.guilds){
        if(!patreon.guilds[i].name){
          let guild = await GetGuildName(patreon.guilds[i].id)
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
      await ButtonPick(obj, embedMsg)
      return
    }
    if(guildId && guilds.length > 0){
      msg2send.content = 'Error getting selected guild Information'
      gObj = guilds.find(x=>x.id == guildId)
    }
    if(gObj?.id){
      await mongo.pull('patreon', {_id: patreon._id}, {guilds: {id: gObj.id}})
      msg2send.content = 'Guild '+(gObj.name ? '**'+gObj.name+'** ':'')+' was removed from your list.'
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
