'use strict'
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getOptValue, getDiscordAC, replyTokenError, truncateString, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...' }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have your google account linked to your discordId' }

  let unit = opt.unit?.value?.toString()?.trim(), has_omi = opt.has_omicron?.value
  if(!unit) return { content: 'you did not provide a unit'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding unit **${unit}**`}

  let guild = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(guild === 'GETTING_CONFIRMATION') return
  if(guild?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(guild?.msg2send) return { content: guild.msg2send }
  let guildId = guild?.data?.guild?.profile?.id
  if(!guildId) return { content: 'Error getting tw data...'}
  if(!guild?.data?.guild?.territoryWarStatus || guild?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress' }

  let twData = guild.data.guild.territoryWarStatus[0]
  if(!twData || !twData?.optedInMember) return { content: 'There is not a TW in progress' }

  let joined = twData.optedInMember?.map(m =>m.memberId)
  let gObj = await swgohClient.post('fetchTWGuild', { guildId: guildId, projection: { playerId: 1, name: 1, roster: { [uInfo.baseId]: 1 } } })
  if(!gObj?.member || gObj?.member?.length === 0) return { content: 'Error getting guild data'}

  if(gObj.member.length > joined?.length) gObj.member = gObj.member.filter(x=>joined?.includes(x.playerId))

  let twDefense = twData.homeGuild?.conflictStatus, memberSet = []
  for(let i in twDefense){
    for(let s in twDefense[i].warSquad){
      if(twDefense[i].warSquad[s]?.squad?.cell?.filter(x=>x.unitDefId.startsWith(uInfo.baseId)).length > 0) memberSet.push(twDefense[i].warSquad[s].playerId)
    }
  }

  if(memberSet?.length === 0) return { content: 'No members have set **'+uInfo.nameKey+'** on defense' }

  let defAvailable = gObj.member.filter(x=>!memberSet.includes(x.playerId) && x?.roster && x.roster[uInfo.baseId])
  if(defAvailable?.length === 0) return { content: 'All members have **'+uInfo.nameKey+'** have set on defense' }
  if(has_omi){
    defAvailable = defAvailable.filter(x=>x.roster[uInfo.baseId].omiCount)
    if(defAvailable?.length == 0) return { content: `all memebers with ${uInfo.nameKey} with omicron have set them on defense` }
  }
  defAvailable = sorter([{column: 'name', order: 'ascending'}], defAvailable)

  let count = 0, embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    description: 'Total Joined ('+gObj.member.length+')\n```autohotkey\n',
    title: 'TW Guild Defense Available for **'+uInfo.nameKey+'**',
    footer: {
      text: "Data Updated"
    }
  }
  if(has_omi) embedMsg.title += ` with omicron`
  for(let i in defAvailable){
    let tempUnit = defAvailable[i].roster[uInfo.baseId]
    if(tempUnit){
      embedMsg.description += (tempUnit.rarity || 0)+' : '+numeral(tempUnit.gp || 0).format('0,0').padStart(7, ' ')+' : '+truncateString(defAvailable[i].name, 12)+'\n'
      count++;
    }
  }
  embedMsg.description += '```'
  embedMsg.title += ' ('+count+')'
  return { content: null, embeds: [embedMsg] }
}
