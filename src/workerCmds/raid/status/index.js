'use strict'
const { mongo, GetAllyCodeObj, GetScreenShot, ReplyButton, ReplyMsg, ReplyTokenError } = require('helpers')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const getHTML = require('getHTML/raid/status')
const timeTillEnd = (endTime)=>{
  try{
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
  }catch(e){
    throw(e);
  }
}
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have google linked'}, gObj, raidDef, raid, previousScores, webHTML, webImg, lastRaid
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.uId && dObj?.type){
      if(obj.confirm) await ReplyButton(obj, null)
      msg2send.content = 'Error getting data'
      gObj = await swgohClient('guild', {}, dObj, obj)
      if(gObj?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return
      }
      if(gObj === 'GETTING_CONFIRMATION') return;
      if(gObj?.data?.guild){
        msg2send.content = 'There is not a raid in progress'
        gObj = gObj.data.guild
      }
    }
    if(gObj?.member?.length > 0 && gObj?.raidStatus?.length > 0){
      msg2send.content = 'Error getting raid definition'
      raid = { id: gObj.raidStatus[0].raidId, profile: gObj.profile, mission: gObj.raidStatus[0].identifier?.campaignMissionId, endTime: gObj.raidStatus[0].expireTime, leaderBoard: [], score: +(gObj.raidStatus[0].guildRewardScore || 0), reward: {}, type: 'status' }
      if(raid?.id) raidDef = (await mongo.find('raidList', {_id: raid.id}))[0]
      lastRaid = gObj?.raidResult?.find(x=>x.raidId === raid.id)
    }
    if(raid?.id && raidDef?.nameKey){
      msg2send.content = 'Error calculating data'
      let raidRewards = raidDef.mission.find(x=>x.id === raid?.mission)?.rewards
      raid.nameKey = raidDef.nameKey
      for(let i in gObj.raidStatus[0].raidMember){
        let player = gObj.member.find(x=>x.playerId === gObj.raidStatus[0]?.raidMember[i]?.playerId)
        if(player){
          let previous = lastRaid?.raidMember?.find(x=>x.playerId === player.playerId)
          let tempObj = {name: player.playerName, previous: +previous?.memberProgress || 0}
          if(previousScores && previousScores[player.playerId]) tempObj.previous = previousScores[player.playerId]
          raid.leaderBoard.push({...gObj.raidStatus[0].raidMember[i],...tempObj})
        }
      }
      if(raid.score > 0 && raidRewards?.length > 0){
        raid.reward.current = raidRewards?.find(x=>raid.score >= x.rankStart && (x.rankEnd > raid.score || x.rankEnd === 0))
        raid.reward.next = raidRewards?.find(x=>x.rankStart === (raid.reward?.current?.rankEnd || 0) + 1)
      }
      if(raid.leaderBoard?.length > 0){
        raid.leaderBoard = sorter([{column: 'memberRank', order: 'ascending'}], raid.leaderBoard)
        raid.leaderBoard.unshift({name: 'Guild Total', memberProgress: raid.score, previous: +lastRaid?.guildRewardScore || 0})
      }
      raid.footer = timeTillEnd(raid.endTime)
    }
    if(raid?.leaderBoard?.length > 0){
      msg2send.content = 'error getting HTML'
      webHTML = getHTML(raid)
    }
    if(webHTML){
      msg2send.content = 'error getting image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = gObj?.profile?.name+'-'+raidDef?.id+'-raid.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
