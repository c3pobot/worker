'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only available to guild admins'}, guildId, pObj, gObj, cache, redisCache = 0, guild, embedMsg, ticketCount = 600, mongoCache = 0
    const auth = await HP.CheckGuildAdmin(obj, opt, null)
    if(auth){
      msg2send.content = 'Error getting player guild'
      pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
      if(pObj && pObj.guildId) guildId = pObj.guildId
    }
    if(guildId){
      msg2send.content = 'Error getting guild data'
      guild = (await mongo.find('guilds', {_id: guildId}, {auto: 1}))[0]
      if(guild && guild.auto && guild.auto.ticketCount) ticketCount = +guild.auto.ticketCount
      gObj = (await mongo.find('ticketCheckCache', {_id: pObj.guildId}))[0]
      if(gObj) mongoCache++;
      if(!gObj) gObj = await Client.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
      if(gObj?.guild) gObj = gObj.guild
      if(mongoCache == 0 && gObj?.profile?.id){
        gObj.updated = Date.now()
        await mongo.set('ticketCheckCache', {_id: gObj.profile.id}, gObj)
      }
    }
    if(gObj?.member){
      const timeNow = Date.now()
      const resetTime = gObj.nextChallengesRefresh * 1000
      if(gObj?.profile?.id) await mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
      msg2send.content = 'You are only allowed to send reminders thru the bot 2 hours before guild reset'
      if(resetTime > timeNow && (resetTime - timeNow) < 7200000){
        msg2send.content = 'You are only allowed to send reminders thru the bot every 10 minutes'
        if(guild && guild.auto && guild.auto.sent && (+timeNow - +guild.auto.sent) > 600000){
          await HP.SendMessages({chId: obj.channel_id}, gObj)
          msg2send.content = 'Low ticket messages sent'
        }else{
          embedMsg = await HP.GetLowTickets(gObj, ticketCount)
          if(embedMsg) msg2send.embeds = [embedMsg]
        }
      }else{
        embedMsg = await HP.GetLowTickets(gObj, ticketCount)
        if(embedMsg) msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
