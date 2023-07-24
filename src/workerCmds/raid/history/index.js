'use strict'
const { mongo, GetAllyCodeObj, GetGuildId, GetOptValue, GetScreenShot, ReplyMsg } = require('helpers')
const getHTML = require('getHTML/raid/status')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const getGuild = async(guildId)=>{
  try{
    let guild = (await mongo.find('guildCache', {_id: guildId}, { recentRaidResult: 1, profile: 1, member: { playerId: 1, playerName: 1}}))[0]
    if(!guild) guild = await swgohClient('queryGuild', { guildId: guildId, includeRecentGuildActivityInfo: true} )
    return guild
  }catch(e){
    throw(e);
  }
}
const getDate = (timestamp)=>{
  let dateOptions = {month: 'numeric', day: 'numeric', year: 'numeric'}
  let dateTime = new Date(+timestamp)
  return dateTime.toLocaleDateString('en-US', dateOptions)+' '+dateTime.toLocaleTimeString('en-US')
}
module.exports = async(obj = {}, opt=[])=>{
  try{
    let msg2send = { content: 'you do not have discord linked to allycode' }, allyCode, guildId, gObj, raids, raidDef, raidData, previousScores, webHTML, webImg, lastRaid
    let raidId = GetOptValue(opt, 'raid')
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.allyCode) allyCode = dObj.allyCode
    if(dObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Player is not in a guild'
      let pObj = await GetGuildId({dId: null}, {allyCode: allyCode}, opt)
      if(pObj?.guildId) guildId = pObj.guildId
    }
    if(guildId){
      msg2send.content = 'Error getting guild info'
      gObj = await getGuild(guildId)
    }
    if(gObj?.recentRaidResult){
      msg2send.content = 'there is no raid history for '+gObj?.name
      raids = sorter([{column: 'endTime', order: 'descending'}], gObj.recentRaidResult)
    }
    if(raids?.length > 0){
      msg2send.content = 'Error getting raid definition'
      if(!raidId) raidId = raids[0].raidId
      if(raidId) raidDef = (await mongo.find('raidList', {_id: raidId}))[0]
    }
    if(raidDef?.nameKey){
      msg2send.content = 'Error getting previous scores'
      lastRaid = raids.find(x=>x.raidId === raidId)
    }
    if(lastRaid?.raidMember?.length > 0){
      msg2send.content = 'error calculating data'
      let raidRewards = raidDef.mission.find(x=>x.id === lastRaid?.identifier?.campaignMissionId)?.rewards
      raidData = { profile: gObj.profile, nameKey: raidDef.nameKey, leaderBoard: [], score: +lastRaid.guildRewardScore || 0, reward: {}, type: 'history' }
      raidData.footer = 'Raid completed '+getDate(+lastRaid.endTime * 1000)
      for(let i in lastRaid.raidMember){
        let player = gObj.member.find(x=>x.playerId === lastRaid.raidMember[i]?.playerId)
        raidData.leaderBoard.push({name: player?.playerName || 'unknown', memberProgress: lastRaid.raidMember[i].memberProgress, memberRank: lastRaid.raidMember[i].memberRank })
      }
      if(raidData.score > 0 && raidRewards?.length > 0){
        raidData.reward.current = raidRewards?.find(x=>raidData.score >= x.rankStart && (x.rankEnd > raidData.score || x.rankEnd === 0))
        raidData.reward.next = raidRewards?.find(x=>x.rankStart === (raidData.reward?.current?.rankEnd || 0) + 1)
      }
      if(raidData.leaderBoard?.length > 0) raidData.leaderBoard = sorter([{column: 'memberRank', order: 'ascending'}], raidData.leaderBoard)
      raidData.leaderBoard.unshift({name: 'Guild Total', memberProgress: raidData.score})
    }
    if(raidData?.leaderBoard?.length > 0){
      msg2send.content = 'Error getting html'
      webHTML = getHTML(raidData)
    }
    if(webHTML){
      msg2send.content = 'error getting image'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = gObj?.name+'-'+raidId+'-raid.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
