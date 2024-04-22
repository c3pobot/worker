'use strict'
const swgohClient = require('src/swgohClient')
const getMemberPrevious = require('./getMemberPrevious')
const getMember = require('./getMember')
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
const { replyButton, getDiscordAC, replyTokenError, getImg } = require('src/helpers')
module.exports = async(obj = {}, opts = [])=>{
  let loginConfirm, msg2send = {content: 'You do not have google or fb linked'}
  let dObj = await getDiscordAC(obj.member?.user?.id, opts)
  if(!dObj?.uId || !dObj?.type) return msg2send

  if(obj?.confirm){
    await replyButton(obj, null)
    loginConfirm = obj.confirm.response
  }
  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {}, loginConfirm)
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(gObj?.msg2send) return { content: gObj.msg2send }
  if(!gObj?.data?.guild || !gObj?.data?.guild?.member || gObj?.data?.guild?.member?.length === 0) return { content: 'Error getting data'}

  gObj = gObj.data.guild
  if(!gObj?.raidStatus || gObj?.raidStatus?.length === 0) return { content: 'There is not a raid in progress'}

  let raid = {id: gObj.raidStatus[0].raidId, profile: gObj.profile, mission: gObj.raidStatus[0].identifier?.campaignMissionId, endTime: gObj.raidStatus[0].expireTime, leaderBoard: [], score: +(gObj.raidStatus[0].guildRewardScore || 0), reward: {} }
  if(!raid?.id) return { content: 'error getting raid'}

  let raidDef = (await mongo.find('raidDef', {_id: raid.id}))[0]
  if(!raidDef?.nameKey) return { content: 'Error getting raid definition...'}

  let previousScores = getMemberPrevious(gObj.raidResult, raid.id)

  msg2send.content = 'Error calculating data'
  let raidRewards = raidDef.mission.find(x=>x.id === raid?.mission)?.rewards
  raid.nameKey = raidDef.nameKey
  for(let i in gObj.raidStatus[0].raidMember){
    let player = await getMember(gObj.raidStatus[0].raidMember[i].playerId, gObj.member)
    if(player){
      let tempObj = {name: player.playerName, previous: {low: 0, avg: 0, high: 0}}
      if(previousScores && previousScores[player.playerId]) tempObj.previous = previousScores[player.playerId]
      raid.leaderBoard.push({...gObj.raidStatus[0].raidMember[i],...tempObj})
    }
  }
  if(raid.score > 0 && raidRewards?.length > 0){
    raid.reward.current = raidRewards?.find(x=>raid.score >= x.rankStart && (x.rankEnd > raid.score || x.rankEnd === 0))
    raid.reward.next = raidRewards?.find(x=>x.rankStart === (raid.reward?.current?.rankEnd || 0) + 1)
  }
  if(raid.leaderBoard?.length > 0){
    raid.leaderBoard = await sorter([{column: 'memberRank', order: 'ascending'}], raid.leaderBoard)
    if(previousScores.guildTotal) raid.leaderBoard.unshift({...{name: 'Guild Total', memberProgress: raid.score},...{previous: previousScores.guildTotal}})
  }
  raid.footer = await timeTillEnd(raid.endTime)
  if(!raidData?.leaderBoard || raidData?.leaderBoard?.length === 0) return { content: 'error calculating data' }

  let raidHTML = await getHTML.status(raid)
  if(!raidHTML) return { content: 'Error getting HTML'}

  let raidImg = await getImg(raidHTML, obj.id, 900, false)
  if(!raidImg) return { content: 'Error getting image'}

  msg2send.content = null
  msg2send.file = raidImg
  msg2send.fileName = gObj?.profile?.name+'-'+raidDef?.id+'-raid.png'
  return msg2send
}
