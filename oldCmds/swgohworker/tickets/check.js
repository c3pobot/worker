'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Could not find guild'}, gObj, ticketCount = 600
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj?.guildId){
      msg2send.content = 'Error Getting Data'
      let mongoCache = 0
      gObj = (await mongo.find('ticketCheckCache', {_id: pObj.guildId}))[0]
      if(gObj) mongoCache++;
      if(!gObj) gObj = await Client.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
      if(gObj?.guild) gObj = gObj.guild
      if(mongoCache == 0 && gObj?.profile?.id){
        gObj.updated = Date.now()
        await mongo.set('ticketCheckCache', {_id: gObj.profile.id}, gObj)
      }
      const guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
      if(guild?.auto?.ticketCount >= 0) ticketCount = +guild.auto.ticketCount
    }
    if(gObj?.member){
      msg2send.content = 'Error calculating data'
      //const timeNow = Date.now()
      //const resetTime = gObj.nextChallengesRefresh * 1000
      //gObj.TTL = new Date(gObj.nextChallengesRefresh)
      await mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
      //if(resetTime > timeNow && (resetTime - timeNow) < 300000) await mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now()})
      const embedMsg = await HP.GetLowTickets(gObj, ticketCount);
      if(embedMsg){
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
