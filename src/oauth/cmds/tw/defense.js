'use strict'
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getOptValue, getDiscordAC, replyTokenError, truncateString } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your google account linked to your discordId'}, guildId, loginConfirm, gObj, sendResponse = 0, twData, defAvailable = [], joined = [], uInfo, memberSet = []
  if(obj.confirm) await replyButton(obj, 'Pulling guild data....')
  let loginConfirm = obj.confirm?.response

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return msg2send


  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit'}

  let guild = await swgohClient.oauth(obj, 'guild', dObj, {}, loginConfirm)
  if(guild === 'GETTING_CONFIRMATION') return
  if(guild?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  let guildId = guild?.data?.guild?.profile?.id
  if(!guildId) return { content: 'Error getting tw data...'}
  if(!guild?.data?.guild?.territoryWarStatus || guild?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress' }

  let twData = guild.data.guild.territoryWarStatus[0]
  if(!twData || !twData?.optedInMember) return { content: 'There is not a TW in progress' }

  let joined = twData.optedInMember?.map(m =>m.memberId)
  let gObj = await swgohClient.post('fetchTWGuild', {token: obj.token, id: guildId, projection: {playerId: 1, name: 1, rosterUnit: {definitionId: 1, currentRarity: 1, currentTier: 1, relic: 1, gp: 1}}})
  if(!gObj?.member || gObj?.member?.length === 0) return { content: 'Error getting guild data'}

  if(gObj.member.length > joined?.length) gObj.member = gObj.member.filter(x=>joined?.includes(x.playerId))
  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding unit **${unit}**`}

  let twDefense = twData.homeGuild?.conflictStatus, memberSet = []
  for(let i in twDefense){
    for(let s in twDefense[i].warSquad){
      if(twDefense[i].warSquad[s]?.squad?.cell?.filter(x=>x.unitDefId.startsWith(uInfo.baseId)).length > 0) memberSet.push(twDefense[i].warSquad[s].playerId)
    }
  }

  if(memberSet?.length === 0) return { content: 'No members have set **'+uInfo.nameKey+'** on defense' }

  let defAvailable = gObj.member.filter(x=>!memberSet.includes(x.playerId) && x.rosterUnit.filter(u=>u.definitionId.startsWith(uInfo.baseId)).length > 0)
  if(defAvailable?.length === 0) return { content: 'All members have **'+uInfo.nameKey+'** have set on defense'}

  defAvailable = sorter([{column: 'name', order: 'ascending'}], defAvailable)

  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    description: 'Total Joined ('+gObj.member.length+')\n```autohotkey\n',
    title: 'TW Guild Defense Available for **'+uInfo.nameKey+'**',
    footer: {
      text: "Data Updated"
    }
  }
  let count = 0
  for(let i in defAvailable){
    let tempUnit = defAvailable[i].rosterUnit?.find(x=>x.definitionId.startsWith(uInfo.baseId))
    if(tempUnit){
      embedMsg.description += (tempUnit.currentRarity || 0)+' : '+numeral(tempUnit.gp || 0).format('0,0').padStart(7, ' ')+' : '+truncateString(defAvailable[i].name, 12)+'\n'
      count++;
    }
  }
  embedMsg.description += '```'
  embedMsg.title += ' ('+count+')'
  msg2send.content = null
  msg2send.embeds = [embedMsg]
  return msg2send
}
