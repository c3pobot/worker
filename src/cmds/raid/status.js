'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')
const getMemberPrevious = require('./getMemberPrevious')
const getHTML = require('webimg').raid

const timeTillEnd = (endTime)=>{
  let d = 0, h = 0, m = 0, s = 0
  let timeDiff = +endTime - +(Date.now())
  if(timeDiff){
    timeDiff = timeDiff / 1000
    d = (Math.floor(timeDiff / 86400) || 0)
    h = (Math.floor((timeDiff - (d * 86400)) / 3600) || 0)
    m = (Math.floor((timeDiff - (d * 86400) - (h * 3600)) / 60) || 0)
    s = ((timeDiff - (d * 86400) - (h * 3600) - (m * 60)) || 0)
    return 'Time left '+d?.toString()?.padStart('0', 2)+' Day(s) '+h?.toString()?.padStart('0', 2)+' Hour(s) '+m?.toString()?.padStart('0', 2)+' Minute(s)'
  }
}
const { getDiscordAC, replyTokenError, getImg } = require('src/helpers')
module.exports = async(obj = {}, opts = [])=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled' }
  let dObj = await getDiscordAC(obj.member?.user?.id, opts)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google or fb linked' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.msg2send) return gObj.msg2send
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(!gObj?.data?.guild || !gObj?.data?.guild?.member || gObj?.data?.guild?.member?.length === 0) return { content: 'Error getting data'}

  gObj = gObj.data.guild
  if(!gObj?.raidStatus || gObj?.raidStatus?.length === 0) return { content: 'There is not a raid in progress'}
  let raid = gObj.raidStatus[0], raidMember = gObj.raidStatus[0].raidMember
  if(!raidMember || raidMember?.length === 0) return { content: 'Error getting raid members' }
  
  let raidData = { id: raid.raidId, profile: gObj.profile, mission: raid.identifier?.campaignMissionId, endTime: raid.expireTime, leaderBoard: [], score: +(raid.guildRewardScore || 0), reward: {} }
  if(!raidData?.id) return { content: 'error getting raid'}

  let raidDef = (await mongo.find('raidDef', {_id: raidData.id}))[0]
  if(!raidDef?.nameKey) return { content: 'Error getting raid definition...'}

  let previousScores = getMemberPrevious(gObj.raidResult?.find(x=>x.raidId === raidData.id))
  raidData.previous = +(previousScores?.guildRewardScore || 0)
  let raidRewards = raidDef.mission.find(x=>x.id === raidData?.mission)?.rewards
  raidData.nameKey = raidDef.nameKey
  raid.footer = timeTillEnd(raidDef.endTime)

  for(let i in raidMember){
    let player = gObj.member.find(x=>x.playerId === raidMember[i].playerId)
    if(!player?.playerName) continue
    raidData.leaderBoard.push({ name: player.playerName, score: +(raidMember[i].memberProgress || 0), rank: raidMember[i].memberRank, attempt: raidMember[i].memberAttempt, previous: +(previousScores?.scores[raidMember[i].playerId]?.score || 0) })
  }
  if(raidData.score > 0 && raidRewards?.length > 0){
    raidData.reward.current = raidRewards?.find(x=>raidData.score >= x.rankStart && (x.rankEnd > raidData.score || x.rankEnd === 0))
    raidData.reward.next = raidRewards?.find(x=>x.rankStart === (raidData.reward?.current?.rankEnd || 0) + 1)
  }
  let sort = opts.sort?.value || 'score', sortOrder = 'descending'
  if(sort !== 'score') sortOrder = 'ascending'
  raidData.leaderBoard = await sorter([{column: sort, order: sortOrder}], raidData.leaderBoard || [])
  if(!raidData?.leaderBoard || raidData?.leaderBoard?.length == 0) return { content: 'error calculating data' }

  let webHtml = await getHTML.status(raidData)
  if(!webHtml) return { content: 'Error getting HTML'}

  let webImg = await getImg(webHtml, obj.id, 900, false)
  if(!webImg) return { content: 'Error getting image'}

  return { content: null, file: webImg, fileName: gObj?.profile?.name+'-'+raidDef?.id+'-raid.png' }
}
