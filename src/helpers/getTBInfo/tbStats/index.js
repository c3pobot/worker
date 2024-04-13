'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const log = require('logger')
const newTBObj = require('./newTBObj')
const getZoneName = require('./getZoneName')
const getTotalUndeployed = (totalGp, stats = [])=>{
  try{
    let gpDeployed = stats.reduce((acc, a)=>{
      return acc + (+a.score || 0)
    }, 0)
    return +totalGp - gpDeployed
  }catch(e){
    console.error(e);
  }
}
module.exports = async(guildId, guildData)=>{
  try{
    let status = {status: 'ok'}, tempPscore = [], tempPscoreArray = [], currentRound = guildData.currentRound, previousRound = guildData.currentRound - 1, pScores = []
    let tbDef = (await mongo.find('tbDefinition', {_id: guildData.definitionId}))[0]
    let getPscores = (await mongo.find('tbCache', {_id: guildId}, {_id:0, pScores: 1}))[0]
    if(getPscores && getPscores.pScores) pScores = getPscores.pScores
    if(pScores) tempPscore = (pScores.find(x=>x.round === previousRound) ? pScores.find(x=>x.round === previousRound).data : [])
    let tbData = await newTBObj(guildData)
    tbData.nameKey = tbDef?.nameKey
    for(let i in guildData.conflictZoneStatus){
      let zoneInfo = tbDef.conflictZoneDefinition.find(x=>x.zoneDefinition.zoneId === guildData.conflictZoneStatus[i].zoneStatus.zoneId)
      let cmInfo = tbDef.strikeZoneDefinition.filter(x=>x.zoneDefinition.linkedConflictId === guildData.conflictZoneStatus[i].zoneStatus.zoneId)
      let smInfo  = tbDef.covertZoneDefinition.filter(x=>x.zoneDefinition.linkedConflictId === guildData.conflictZoneStatus[i].zoneStatus.zoneId)
      let platoonInfo = tbDef.reconZoneDefinition.filter(x=>x.zoneDefinition.linkedConflictId === guildData.conflictZoneStatus[i].zoneStatus.zoneId)
      if(guildData.conflictZoneStatus[i].zoneStatus.zoneState === 3){
        let pScore = tempPscore.find(x=>x.zoneId === guildData.conflictZoneStatus[i].zoneStatus.zoneId)
        if(!pScore) pScore = {
          score: 0,
          zoneId: guildData.conflictZoneStatus[i].zoneStatus.zoneId,
          platoons: 0,
          gpDeployed: 0,
          starCount: 0,
          cm: [],
          sm: []
        };
        let newpScore = {
          score: +guildData.conflictZoneStatus[i].zoneStatus.score,
          zoneId: guildData.conflictZoneStatus[i].zoneStatus.zoneId,
          platoons: 0,
          gpDeployed: 0,
          starCount: 0,
          cm: [],
          sm: []
        }
        let tempObj = {
          name: zoneInfo?.zoneDefinition?.phase+'-'+zoneInfo?.zoneDefinition?.conflict+'-'+zoneInfo?.zoneDefinition?.type+' : '+zoneInfo?.zoneDefinition?.nameKey,
          score: +guildData.conflictZoneStatus[i].zoneStatus.score,
          gpDeployed: 0,
          combatType: zoneInfo.territoryBattleZoneUnitType,
          starCount: 0,
          sort: zoneInfo?.zoneDefinition?.sort,
          cmTotalScore: 0,
          cmCount: 0,
          cm:[],
          sm:[],
          platoons:0,
          stars:{}
        }

        for(let v in zoneInfo.victoryPointRewards){
          if(tempObj.score < +zoneInfo.victoryPointRewards[v].galacticScoreRequirement){
            tempObj.stars[((+v) + 1)] = +zoneInfo.victoryPointRewards[v].galacticScoreRequirement - tempObj.score
          }else{
            newpScore.starCount += 1
            tempObj.starCount += 1
            tempObj.stars[((+v) + 1)] = 0
          }
        }
        newpScore.stars = tempObj.stars
        //get CM details
        let cmTotalScore = 0
        for(let c in cmInfo){
          let lastCMScore = pScore.cm.find(x=>x.zoneId === cmInfo[c].zoneDefinition.zoneId)?.score || 0
          let cmScore = +guildData.strikeZoneStatus.find(x=>x.zoneStatus.zoneId === cmInfo[c].zoneDefinition.zoneId)?.zoneStatus?.score || 0
          let cmCount = +guildData.strikeZoneStatus.find(x=>x.zoneStatus.zoneId === cmInfo[c].zoneDefinition.zoneId).playersParticipated || 0
          tempObj.cmTotalScore += ( cmScore - lastCMScore ) || 0
          tempObj.cmCount += cmCount || 0
          newpScore.cm.push({
            zoneId: cmInfo[c].zoneDefinition.zoneId,
            score: cmScore,
            completed : cmCount
          });
          tempObj.cm.push({
            zoneId: cmInfo[c].zoneDefinition.zoneId,
            score: cmScore - lastCMScore,
            completed : cmCount
          });
          cmTotalScore += (guildData.strikeZoneStatus.find(x=>x.zoneStatus.zoneId === cmInfo[c].zoneDefinition.zoneId).zoneStatus.score - lastCMScore || 0);
        }
        //get sm details
        let smTotalScore = 0
        for(let c in smInfo){
          let lastSMScore = (pScore.sm.find(x=>x.zoneId === smInfo[c].zoneDefinition.zoneId) ? pScore.sm.find(x=>x.zoneId === smInfo[c].zoneDefinition.zoneId).score : 0)
          newpScore.sm.push({
            zoneId: smInfo[c].zoneDefinition.zoneId,
            score: +guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).zoneStatus.score,
            completed: +guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).playersParticipated,
            success: +guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).successfulAttempts
          });
          tempObj.sm.push({
            zoneId: smInfo[c].zoneDefinition.zoneId,
            score: +guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).zoneStatus.score - lastSMScore,
            completed: +guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).playersParticipated,
            success: +guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).successfulAttempts
          })
          smTotalScore += (+guildData.covertZoneStatus.find(x=>x.zoneStatus.zoneId === smInfo[c].zoneDefinition.zoneId).zoneStatus.score -lastSMScore -lastSMScore || 0)
        }
        //get platoon details
        let platoonTotalScore = 0
        for(let c in platoonInfo){
          let tempPlatoon = guildData.reconZoneStatus.find(x=>x.zoneStatus.zoneId === platoonInfo[c].zoneDefinition.zoneId).platoon
          for(let p in tempPlatoon){
            let numSquads = 0
            let squadFilled = 0
            for(let s in tempPlatoon[p].squad){
              numSquads += tempPlatoon[p].squad[s].unit.length
              squadFilled += tempPlatoon[p].squad[s].unit.filter(x=>x.memberId != "").length
            }
            if(numSquads === squadFilled){
              tempObj.platoons += +platoonInfo[c].platoonDefinition.find(x=>x.id === tempPlatoon[p].id).reward.value
            }
          }
          newpScore.platoons += tempObj.platoons
          tempObj.platoons -= pScore.platoons
          platoonTotalScore += tempObj.platoons
        }
        tempObj.gpDeployed = tempObj.score - pScore.score - cmTotalScore - smTotalScore - platoonTotalScore
        if(tempObj.combatType == 1) tbData.gpCharUndepoyed -= tempObj.gpDeployed;
        if(tempObj.combatType == 2) tbData.gpShipUndeployed -= tempObj.gpDeployed;
        if(tempObj.combatType == 3){
          tbData.showTotalGp = true
        }
        newpScore.gpDeployed = tempObj.gpDeployed
        tempObj.gpDeployed = tempObj.gpDeployed
        tempObj.score = tempObj.score
        tempObj.platoons = tempObj.platoons
        tempPscoreArray.push(newpScore)
        tbData.zoneData.push(tempObj)
      }
    }
    tbData.gpUndeployed = getTotalUndeployed(tbData.gp, guildData.currentStat?.find(x=>x.mapStatId === 'power_round_'+currentRound)?.playerStat)
    tbData.gpCharUndepoyed = tbData.gpCharUndepoyed
    tbData.gpShipUndeployed = tbData.gpShipUndeployed
    tbData.gp = tbData.gp
    tbData.zoneData = sorter([{column: 'sort', order: 'ascending'}], tbData.zoneData)
    await mongo.set('tbCache', {_id: guildId}, {totalStarCount: tbData.totalStarCount})
    if(pScores.filter(x=>x.round === guildData.currentRound).length > 0){
      await mongo.set('tbCache', {_id: guildId, 'pScores.round': +currentRound}, {'pScores.$.data': tempPscoreArray})
    }else{
      await mongo.push('tbCache', {_id: guildId}, {pScores: {round: +currentRound, data: tempPscoreArray}})
    }
    status.data = tbData
    return(status)
  }catch(e){
    log.error(e)
    return ({status: 'error'})
  }
}
