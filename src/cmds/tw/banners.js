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
  let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, {territoryMapId: guildData?.instanceId})
  if(battleStats === 'GETTING_CONFIRMATION') return
  if(battleStats?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(battleStats?.msg2send) return { content: battleStats.msg2send }
  if(!battleStats?.data?.currentStat) return { content: 'error getting stats' }

  guildData.currentStat = battleStats.data.currentStat

  let conflictStatus = guildData?.homeGuild?.conflictStatus || []
  let defenseSet = 0, defenseTotal = 0
  for(let i in conflictStatus){
    defenseSet += +(conflictStatus[i]?.warSquad?.length || 0)
    defenseTotal += +(conflictStatus[i]?.squadCapacity || 0)
  }
  let totalStat = guildData?.currentStat?.find(x=>x.mapStatId == 'stars')?.playerStat
  let defenseStat = guildData?.currentStat?.find(x=>x.mapStatId == 'set_defense_stars')?.playerStat
  let attackStat = guildData?.currentStat?.find(x=>x.mapStatId == 'attack_stars')?.playerStat

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
    let tempTotal = totalStat.find(x=>x.memberId == joined[i]), tempDef = defenseStat.find(x=>x.memberId == joined[i]), tempOff = attackStat.find(x=>x.memberId == joined[i])

    scores.push({...player,...{ total: +(tempTotal?.score || 0), attack: +(tempOff?.score || 0), defense: +(tempDef?.score || 0) }})
  }
  scores = sorter([{ column: 'total', order: 'descending' }], scores || [])
  if(!scores || scores?.length == 0) return { content: 'Error getting player banner count' }
  let embedMsg = {
    color: 15844367,
    title: `${gObj.data.guild.profile?.name} TW Total Banner Count (${joined?.length})`,
    description: `Defense ${defenseSet}/${defenseTotal}`
  }
  embedMsg.description += '\n```\nOff / Def / Tot : Name\n'
  for(let i in scores){
    embedMsg.description += `${scores[i].attack?.toString()?.padStart(3, ' ')} / ${scores[i].defense?.toString()?.padStart(3, ' ')} / ${scores[i].total?.toString()?.padStart(3, ' ')} : ${scores[i].name}\n`
  }
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
