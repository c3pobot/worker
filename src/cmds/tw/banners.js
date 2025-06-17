'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const { getDiscordAC, replyTokenError } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...'}

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have your google account linked to your discordId' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(gObj?.msg2send) return { content: gObj.msg2send }
  if(!gObj?.data?.guild) return { content: 'Error getting guild data...'}

  if(!gObj?.data?.guild?.territoryWarStatus || gObj?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress'}
  if(!gObj.data.guild.territoryWarStatus[0].awayGuild) return { content: 'There is not a TW in progress'}

  
  let guildData = gObj.data.guild.territoryWarStatus[0]
  let conflictStatus = guildData?.homeGuild?.conflictStatus || []
  let defenseSet = 0, defenseTotal = 0
  for(let i in conflictStatus){
    defenseSet += +(conflictStatus[i]?.squadCount || 0)
    defenseTotal += +(conflictStatus[i]?.squadCapacity || 0)
  }
  let playerStat = guildData?.currentStat?.find(x=>x.mapStatId == 'stars')?.playerStat
  let joined = guildData?.optedInMember?.map(x=>x.memberId)
  let member = gObj?.data?.guild?.member.filter(x=>x.memberLevel !== 1).map(x=>{
    return {
      playerId: x.playerId,
      name: x.playerName
    }
  })
  let scores = []

  for(let i in joined){
    let player = member.find(x=>x.playerId == joined[i])
    if(!player?.name) continue
    let score = playerStat.find(x=>x.memberId == joined[i])
    if(!score?.memberId) score = { score: 0 }
    scores.push({...player,...{ score: +score.score }})
  }
  scores = sorter([{ column: 'score', order: 'descending' }], scores || [])
  if(!scores || scores?.length == 0) return { content: 'Error getting player banner count' }
  let embedMsg = {
    color: 15844367,
    title: `${gObj.data.guild.profile?.name} TW Total Banner Count (${joined?.length})`,
    description: `Defense ${defenseSet}/${defenseTotal}`
  }
  embedMsg.description += '\n```\n'
  for(let i in scores){
    embedMsg.description += `${scores[i].score?.toString()?.padStart(3, ' ')} : ${scores[i].name}\n`
  }
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
