'use strict'
const { mongo, GetAllyCodeObj, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const { getGp, getMapStats, getMissingGp, getTimeTillEnd } = require('./helper')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let gObj, tbDef, mapStats, currentRound, msg2send = {content: 'You do not have google/code auth linked to your discordId'}
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.uId && dObj?.type){
      await ReplyButton(obj, 'Pulling guild TB data ...')
      msg2send.content = 'Error getting guild data'
      let tempGuild = await swgohClient('guild', {}, dObj, obj)
      if(tempGuild?.data?.guild){
        msg2send.content = 'there is not a TB in progress'
        gObj = tempGuild?.data?.guild
        mongo.set('tbGpTotal', {_id: 'guild'}, {data: gObj})
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
    }
    if(mapStats){
      msg2send.content = 'error calculating gp'
      let gp = getGp(gObj.territoryBattleStatus[0].conflictZoneStatus.filter(x=>x.zoneStatus.zoneState === 3), mapStats, tbDef.conflictZoneDefinition, gObj.member)
      let missingGp = getMissingGp(gp.player)
      mongo.set('webTemp', {_id: 'tbGp'}, { mapStats: mapStats, data: gp, missingGp: missingGp })
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
