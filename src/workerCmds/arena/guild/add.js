'use strict'
const { mongo, ButtonPick, GetOptValue, ReplyMsg } = require('helpers')
const { GetChannel } = require('discordapiclient')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let allyCode, chId, dObj, usrname, channelPerm = false, pObj, msg2send = {content: 'You did not provide the correct information'}, count = 0
    if(patreon.users) count += +patreon.users.length
    if(patreon.guilds) count += +patreon.guilds.length * 50
    if(obj?.confirm?.allyCode) allyCode = +obj.confirm.allyCode
    let user = GetOptValue(opt, 'user'), chId = GetOptValue(opt, 'channel')
    if(user) usrname = obj.data.resolved.members[user].nick || obj.data.resolved.users[user].username
    if(!allyCode) allyCode = GetOptValue(opt, 'allyCode')
    if(allyCode) allyCode = +allyCode.toString().trim().replace(/-/g, '')
    if(!allyCode && user){
      msg2send.content = '@'+username+' does not have allyCode linked to discordId'
      dObj = (await mongo.find('discordId', {_id: user}))[0]
    }
    if(dObj?.allyCodes?.length === 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj?.allyCodes?.length > 1){
      let embedMsg = {
        content: 'There are multiple allyCodes for '+(usrname ? '**@'+usrname+'**':'that user')+'. Which one do you want to add?',
        components: [],
        flags: 64
      }
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
      await ButtonPick(obj, embedMsg)
      return
    }
    if(chId){
      msg2send.content = 'Sorry i do not have permissions to view <#'+chId+'>. You need to fix this before you can use that channel'
      let checkPerm = await GetChannel(chId)
      if(checkPerm?.id) channelPerm = true
    }else{
      channelPerm = true
    }
    if(channelPerm && allyCode){
      msg2send.content = 'Error getting player info for **'+allyCode+'**'
      pObj = await swgohClient('queryPlayer', { allyCode: allyCode.toString() })
    }
    if(pObj?.guildId){
      msg2send.content = 'Guild **'+pObj.guildName+'** was added to your list'
      if(chId) msg2send.content += ' and will use <#'+chId+'> as log channel'
      let tempGuild = { id: pObj.guildId, name: pObj.guildName }
      if(chId){
        tempGuild.chId = chId
        tempGuild.sId = obj.guild_id
      }
      if(patreon.guilds && patreon.guilds.filter(x=>x.id == pObj.guildId).length > 0){
        await mongo.pull('patreon', {_id: patreon._id}, {guilds: {id: pObj.guildId}})
        await mongo.push('patreon', {_id: patreon._id}, {guilds: tempGuild})
      }
      if(patreon.maxAllyCodes >= (count + 50)){
        msg2send.content = 'You are only allowed to register **'+patreon.maxAllyCodes+'** and you already have **'+count+'**.\nNote a guild counts as 50'
      }else{
        await mongo.push('patreon', {_id: patreon._id}, {guilds: tempGuild})
      }
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
