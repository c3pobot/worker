'use strict'
const { Show } = require('./helper')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only available to guild admins'}, guildId, pObj, gObj, guild, tempObj, status, chId, ticketCount, channelPerm = 1
    const auth = await HP.CheckGuildAdmin(obj, opt, null)
    if(opt.find(x=>x.name == 'status')) status = opt.find(x=>x.name == 'status').value
    if(opt.find(x=>x.name == 'channel')) chId = opt.find(x=>x.name == 'channel').value
    if(opt.find(x=>x.name == 'count')){
      ticketCount = opt.find(x=>x.name == 'count').value
      if(ticketCount > 600) ticketCount = 600
    }
    if(auth){
      msg2send.content = 'Error getting player guild'
      pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
      if(pObj && pObj.guildId) guildId = pObj.guildId
    }
    if(pObj && pObj.guildId){
      msg2send.content = 'Your guild is not linked to this server'
      guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
      if(!guild){
        guild = {_id: pObj.guildId, guildName: pObj.guildName}
        await mongo.set('guilds', {_id: pObj.guildId}, {guildName: pObj.guildName})[0]
      }
    }
    if(guild && guild.sId == obj.guild_id){
      msg2send.content = 'Error getting guild data'
      gObj = await Client.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
    }
    if(gObj && gObj.guild){
      tempObj = {
        guildId: pObj.guildId,
        guildName: pObj.guildName,
        sent: 0,
        sId: guild.sId,
        chId: obj.channel_id,
        dId: obj.member.user.id,
        allyCode: pObj.allyCode,
        followup: 0,
        final: 0,
        missed: 0,
        ticketCount: 600,
        status: 1
      }
      let tempReset
      if(guild.auto) tempObj = guild.auto
      if(!tempObj.guildId) tempObj.guildId = pObj.guildId
      if(!tempObj.guildName) tempObj.guildName = pObj.guildName
      if(gObj) tempReset = new Date(gObj.guild.nextChallengesRefresh * 1000)
      if(tempReset){
        tempObj.hours = tempReset.getHours()
        tempObj.mins = tempReset.getMinutes()
      }
      if(!chId) chId = tempObj.chId
      if(guild.sId) tempObj.sId = guild.sId
      msg2send.content = 'I do not have permissions to view <#'+chId+'>'
      if(chId){
        const checkPerm = await MSG.GetChannel(chId)
        if(!checkPerm || !checkPerm.id) channelPerm = 0
      }
      if(status >= 0) tempObj.status = status
      if(chId) tempObj.chId = chId
      if(ticketCount >= 0) tempObj.ticketCount = ticketCount
      if(channelPerm){
        await mongo.set('guilds', {_id: guildId}, {auto: tempObj})
        msg2send.content = 'Error updating data'
        const embedMsg = await Show(gObj.guild, tempObj)
        if(embedMsg){
          msg2send.content = null
          msg2send.embeds = [embedMsg]
        }
      }
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
