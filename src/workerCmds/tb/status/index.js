'use strict'
const { mongo, GetAllyCodeObj, GetScreenShot, ReplyButton, ReplyMsg, ReplyTokenError } = require('helpers')
const { getGp, getMapStats, getZoneStatus, getStarCount } = require('./helper')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const getTimeTillEnd = require('./getTimeTillEnd')
const getHTML = require('getHTML/tb/status')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let gObj, loginConfirm = obj.confirm?.response, msg2send = {content: 'You do not have google/code auth linked to your discordId'}
    let mapStats, tbStatus, tbDef, tbData, webHTML, webImg, currentRound
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.uId && dObj?.type){
      await ReplyButton(obj, 'Pulling guild TB data ...')
      msg2send.content = 'Error getting guild data'
      let tempGuild = await swgohClient('guild', {}, dObj, obj)
      if(tempGuild?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return;
      }
      if(tempGuild === 'GETTING_CONFIRMATION') return
      if(tempGuild?.data?.guild){
        msg2send.content = 'there is not a TB in progress'
        gObj = tempGuild.data.guild
      }
    }
    if(gObj?.territoryBattleStatus.length > 0){
      currentRound = +gObj.territoryBattleStatus[0].currentRound
      msg2send.content = 'error getting tb definition file'
      tbDef = (await mongo.find('tbList', {_id: gObj.territoryBattleStatus[0].definitionId}))[0]
    }
    if(tbDef){
      msg2send.conent = 'error getting map stats'
      mapStats = await getMapStats(obj, dObj, tbDef.statCategory, gObj.territoryBattleStatus[0].instanceId)
      if(mapStats === 'GETTING_CONFIRMATION') return
    }
    if(mapStats){
      msg2send.content = 'error getting zone info'
      let oldData = (await mongo.find('tbCache', {_id: gObj.profile.id}, {roundData: 1}))[0]
      let zone = await getZoneStatus(gObj.territoryBattleStatus[0].conflictZoneStatus.filter(x=>x.zoneStatus.zoneState === 3), tbDef.conflictZoneDefinition)
      let combat = await getZoneStatus(gObj.territoryBattleStatus[0].strikeZoneStatus.filter(x=>x.zoneStatus.zoneState === 3), tbDef.strikeZoneDefinition)
      let special = await getZoneStatus(gObj.territoryBattleStatus[0].covertZoneStatus.filter(x=>x.zoneStatus.zoneState === 3), tbDef.covertZoneDefinition)
      let platoon = await getZoneStatus(gObj.territoryBattleStatus[0].reconZoneStatus.filter(x=>x.zoneStatus.zoneState === 3), tbDef.reconZoneDefinition)
      if(currentRound >= 1 && oldData?.roundData && oldData.roundData[currentRound - 1]?.combat && combat && zone){
        let previousData = oldData.roundData[currentRound - 1].combat
        for(let i in combat){
          if(previousData[i]) combat[i].score = +combat[i].score - +previousData[i].score
          if(!combat[i].linkedConflictId) continue
          if(!zone[combat[i].linkedConflictId].combat) zone[combat[i].linkedConflictId].combat = []
          zone[combat[i].linkedConflictId].combat.push(combat[i])
        }
      }else{
        if(zone && combat){
          for(let i in combat){
            if(!combat[i].linkedConflictId) continue
            if(!zone[combat[i].linkedConflictId].combat) zone[combat[i].linkedConflictId].combat = []
            zone[combat[i].linkedConflictId].combat.push(combat[i])
          }
        }
      }
      if(zone && special){
        for(let i in special){
          if(!special[i].linkedConflictId) continue
          if(!zone[special[i].linkedConflictId].special) zone[special[i].linkedConflictId].special = []
          zone[special[i].linkedConflictId].special.push(special[i])
        }
      }
      if(zone && platoon){
        for(let i in platoon){
          if(!platoon[i].linkedConflictId) continue
          if(!zone[platoon[i].linkedConflictId].platoon) zone[platoon[i].linkedConflictId].platoon = []
          zone[platoon[i].linkedConflictId].platoon.push(platoon[i])
        }
      }
      let star = await getStarCount(gObj.territoryBattleStatus[0].conflictZoneStatus.filter(x=>x.zoneStatus.zoneState !== 1), tbDef.conflictZoneDefinition)
      let gp = await getGp(zone, mapStats, gObj.member)
      if(zone && combat && special && platoon && star >= 0 && gp){
        tbData = { gp: gp, roundData: oldData?.roundData || {}, currentRound: gObj.territoryBattleStatus[0].currentRound, memberCount: gObj.member.length, guildName: gObj.profile.name, nameKey: tbDef.nameKey }
        tbData.roundData[tbData.currentRound] = { platoon: platoon, combat: combat, }, tbData.currentRoundEndTime = gObj.territoryBattleStatus[0].currentRoundEndTime, tbData.definitionId = gObj.territoryBattleStatus[0].definitionId
        tbData.star = star, tbData.currentStat = mapStats, tbData.endTime = getTimeTillEnd(gObj.territoryBattleStatus[0].currentRoundEndTime)
        tbData.zoneData = await sorter([{column: 'sort', order: 'ascending'}], Object.values(zone))
        tbData.reconZoneStatus = gObj.territoryBattleStatus[0].reconZoneStatus
        mongo.set('webTemp', {_id: 'tbStatus'}, {data: tbData})
        await mongo.set('tbCache', {_id: gObj.profile.id}, tbData)
      }
    }
    if(tbData){
      msg2send.content = 'error getting html'
      webHTML = getHTML(tbData)
    }
    if(webHTML){
      msg2send.content = 'error getting screen shot'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'tb-status.png'
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
