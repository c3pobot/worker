'use strict'
const { mongo, ButtonPick, GetGuildName, GetOptValue, ReplyButton, ReplyMsg } = require('helpers')
const { GetChannel } = require('discordapiclient')
module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let guildId, gObj, chId, updatePatreon = false, channelPerm = false, guilds = [], msg2send = {content: 'You do not have any guilds configured'}
    if(obj?.confirm?.guildId){
      await ReplyButton(obj, 'Getting guild names..')
      guildId = obj.confirm.guildId
    }
    let chId = GetOptValue(opt, 'channel')
    if(chId){
      msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
      let checkPerm = await GetChannel(chId)
      if(checkPerm?.id) channelPerm = true
    }else{
      channelPerm = true
    }
    if(channelPerm){
      msg2send.content = 'Error getting guild Information'
      for(let i in patreon.guilds){
        if(!patreon.guilds[i].name){
          let guild = await GetGuildName(patreon.guilds[i].id)
          if(guild?.guildName){
            updatePatreon = true
            patreon.guilds[i].name = guild.guildName
          }
        }
        if(patreon.guilds[i].name) guilds.push(patreon.guilds[i])
      }
    }
    if(updatePatreon) await mongo.set('patreon', {_id: patreon._id}, patreon)
    if(guilds.length > 0 && !guildId){
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
      await ButtonPick(obj, embedMsg)
      return
    }
    if(guildId){
      msg2send.content = 'Error getting selected guild Information'
      gObj = guilds.find(x=>x.id === guildId)
    }
    if(gObj?.id){
      msg2send.content = 'Guild '+(gObj.name ? '**'+gObj.name+'** ':'')+' was updated.'
      if(chId){
        gObj.chId = chId
        gObj.sId = obj.guild_id
      }else{
        delete gObj.chId
        delete gObj.sId
      }
      await mongo.pull('patreon', {_id: patreon._id}, {guilds: {id: gObj.id}})
      await mongo.push('patreon', {_id: patreon._id}, {guilds: gObj})
    }

    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
