'use strict'
const CreateMissedMsg = (gObj, cache)=>{
  try{
    const embedMsg = {
      color: 15844367,
      timestamp: new Date(gObj.updated),
      title: gObj.profile.name+' Daily Raid Tickets',
      footer: {
        text: "Data updated"
      }
    }
    let ticketCount = cache.member.reduce((acc, m)=>{
      return acc + (m.memberContribution.find(x=>x.type == 2) ? +m.memberContribution.find(x=>x.type == 2).currentValue:0)
    }, 0)
    const member = cache.member.filter(x=>x.memberContribution.some(m=>m.type == 2 && +m.currentValue < 600)).map(p=>{
      return Object.assign({}, {playerId: p.playerId, name: p.playerName, tickets: +(p.memberContribution.find(t=>t.type == 2).currentValue), total: +(p.memberContribution.find(t=>t.type == 2).lifetimeValue)  })
    })
    const mArray = []
    if(ticketCount < 30000 && member.length > 0){
      for(let i in member){
        const gMember = gObj.member.find(x=>x.playerId == member[i].playerId)
        if(gMember){
          const mTotal = gMember.memberContribution.find(x=>x.type == 2).lifetimeValue - member[i].total - gMember.memberContribution.find(x=>x.type == 2).currentValue
          const dTotal = member[i].tickets + mTotal
          if(mTotal >= 0) ticketCount += mTotal
          if(dTotal < 600) mArray.push({name: member[i].name, tickets: dTotal})
        }
      }
    }
    embedMsg.description = 'Total: **'+numeral(ticketCount).format('0,0')+'**/30,000\n'
    if(mArray.length > 0){
      embedMsg.description += 'Guild Members that missed\n```\n'
      for(let i in mArray){
        embedMsg.description += (mArray[i].tickets).toString().padStart(3, '0')+' : '+mArray[i].name+'\n'
      }
      embedMsg.description += '```'
    }
    return embedMsg
  }catch(e){
    console.error(e)
  }
}
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only available to guild admins'}, guildId, pObj, gObj, cache, redisCache = 0
    const auth = await HP.CheckGuildAdmin(obj, opt, null)
    if(auth){
      msg2send.content = 'Error getting player guild'
      pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
      if(pObj && pObj.guildId) guildId = pObj.guildId
    }
    if(guildId){
      msg2send.content = 'Error getting guild data'
      gObj = await redis.get('tickets-'+guildId)
      if(gObj) redisCache++;
      if(!gObj) gObj = await Client.post('guild', {guildId: pObj.guildId, includeRecentGuildActivityInfo: true}, null)
      if(gObj && gObj.guild) gObj = gObj.guild
      if(redisCache == 0 && gObj && gObj.profile && gObj.profile.id){
        gObj.updated = Date.now()
        redis.setTTL('tickets-'+gObj.profile.id, gObj, 60)
      }
    }
    if(gObj && gObj.profile){
      msg2send.content = 'There is no cached ticket data saved'
      cache = (await mongo.find('ticketCache', {_id: guildId}))[0]
    }
    if(cache){
      msg2send.content = 'You can only check missed tickets for 4 hours after reset'
      const timeNow = Date.now()
      const resetTime = gObj.nextChallengesRefresh * 1000
      if(resetTime > timeNow && (resetTime - timeNow) > 72000000){
        msg2send.content = 'The cached data is to old'
        if(timeNow - cache.updated < 21600000){
          msg2send.content = 'Error calculating the data'
          const embedMsg = await CreateMissedMsg(gObj, cache)
          if(embedMsg){
            msg2send.content = null
            msg2send.embeds = [embedMsg]
          }
        }
      }
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
