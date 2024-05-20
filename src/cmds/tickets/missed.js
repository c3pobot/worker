'use strict'
const mongo = require('mongoclient')
const numeral = require('numeral')
const swgohClient = require('src/swgohClient')
const { checkGuildAdmin, getGuildId } = require('src/helpers')

const createMissedMsg = (gObj, cache)=>{
  let embedMsg = {
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
    let member = cache.member.filter(x=>x.memberContribution.some(m=>m.type == 2 && +m.currentValue < 600)).map(p=>{
      return Object.assign({}, {playerId: p.playerId, name: p.playerName, tickets: +(p.memberContribution.find(t=>t.type == 2).currentValue), total: +(p.memberContribution.find(t=>t.type == 2).lifetimeValue)  })
    })
    let mArray = []
    if(ticketCount < 30000 && member.length > 0){
      for(let i in member){
        let gMember = gObj.member.find(x=>x.playerId == member[i].playerId)
        if(gMember){
          let mTotal = gMember.memberContribution.find(x=>x.type == 2).lifetimeValue - member[i].total - gMember.memberContribution.find(x=>x.type == 2).currentValue
          let dTotal = member[i].tickets + mTotal
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
}

module.exports = async(obj = {}, opt = {})=>{
  let msg2send = {content: 'This command is only available to guild admins'}, redisCache = 0

  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return { content: 'This command is only available to guild admins' }

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }

  let cache = (await mongo.find('ticketCache', {_id: pObj.guildId}))[0]
  if(!cache?.updated) return { content: 'There is no cached ticket data saved' }

  let gObj = await swgohClient.post('guild', { guildId: pObj.guildId, includeRecentGuildActivityInfo: true }, null)
  if(gObj?.guild) gObj = gObj.guild
  if(!gObj?.profile) return { content: 'Error getting guild data' }  

  let timeNow = Date.now()
  let resetTime = gObj.nextChallengesRefresh * 1000
  if(timeNow - cache.updated > 21600000) return { content: 'The cached data is to old' }

  if(resetTime > timeNow && (resetTime - timeNow) > 20 * 3600 * 1000){
    msg2send.content = 'Error calculating the data'
    let embedMsg = await createMissedMsg(gObj, cache)
    if(!embedMsg) return { content: 'Error calculating the data' }
    return { content: null, embeds: [embedMsg] }
  }
  return { content: 'You can only check missed tickets for 4 hours after reset' }
}
