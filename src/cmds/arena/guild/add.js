'use strict'
const mongo = require('mongoclient')
const { buttonPick, getOptValue } = require('src/helpers')
const { GetChannel } = require('src/helpers/discordmsg')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let channelPerm = 1, msg2send = {content: 'You did not provide the correct information'}, count = 0, pObj
  if(patreon.users) count += +patreon.users.length
  if(patreon.guilds) count += +patreon.guilds.length * 50
  let usr = getOptValue(opt, 'user')
  let chId = getOptValue(opt, 'channel')
  let allyCode = +obj.confirm?.allyCode
  if(!usr && !allyCode) allyCode = getOptValue(opt, 'allycode')
  if(!allyCode && !usr) return msg2send

  if(!allyCode && usr){
    let dObj = (await mongo.find('discordId', {_id: usr}))[0]
    if(dObj?.allyCodes?.length === 0) msg2send.content = 'That user does not have allyCode linked to discordId'
    if(dObj?.allyCodes?.length === 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj?.allyCodes?.length > 1){
      let usrname = obj?.data?.resolved?.users[usr]?.username
      if(obj?.data?.resolved?.members[usr]?.nick) usrname = obj.data.resolved.members[usr].nick
      let embedMsg = {
        content: 'There are multiple allyCodes for '+(usrname ? '**@'+usrname+'**':'that user')+'. Which one do you want to add?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in dObj.allyCodes){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
          style: 1,
          custom_id: JSON.stringify({id: obj.id, allyCode: dObj.allyCodes[i].allyCode})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      await buttonPick(obj, embedMsg)
      return
    }
  }

  if(chId){
    let checkPerm = await GetChannel(chId)
    if(!checkPerm || !checkPerm.id) channelPerm = 0
  }
  if(!channelPerm) msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
  if(channelPerm && allyCode){
    msg2send.content = 'Error getting player info for **'+allyCode+'**'
    pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  }
  if(pObj?.guildId){
    msg2send.content = 'Guild **'+pObj.guildName+'** was added to your list'
    if(chId) msg2send.content += ' and will use <#'+chId+'> as log channel'
    if(patreon.guilds?.filter(x=>x.id == pObj.guildId).length > 0){
      let tempGuild = {id: pObj.guildId, name: pObj.guildName}
      if(chId){
        tempGuild.chId = chId
        tempGuild.sId = obj.guild_id
      }
      await mongo.pull('patreon', {_id: patreon._id}, {guilds: {id: pObj.guildId}})
      await mongo.push('patreon', {_id: patreon._id}, {guilds: tempGuild})
    }else{
      if(patreon.maxAllyCodes >= (count + 50)){
        let tempGuild = {id: pObj.guildId, name: pObj.guildName}
        if(chId){
          tempGuild.chId = chId
          tempGuild.sId = obj.guild_id
        }
        await mongo.push('patreon', {_id: patreon._id}, {guilds: tempGuild})
      }else{
        msg2send.content = 'You are only allowed to register **'+patreon.maxAllyCodes+'** and you already have **'+count+'**.\nNote a guild counts as 50'
      }
    }
  }
  return msg2send
}
