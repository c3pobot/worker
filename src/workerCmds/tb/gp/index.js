'use strict'
const getHTML = require('getHTML/tb/gp')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const { mongo, GetAllyCodeObj, GetScreenShot, ReplyButton, ReplyMsg } = require('helpers')
const { getGp, getMapStats, getMissingGp, getTimeTillEnd } = require('./helper')
const cmdOptions = {'char': 1, 'low': 1, 'total': 1}

module.exports = async(obj = {}, opt = [])=>{
  try{
    let tempCmd, dObj, gObj, tbDef, tbData, mapStats, msg2send = {content: 'error with the command'}, webHTML, webImg
    for(let i in opt){
      if(cmdOptions[opt[i].name]){
        tempCmd = opt[i].name
        break;
      }
    }
    if(tempCmd){
      msg2send.conent = 'You do not have google/code auth linked to your discordId'
      dObj = await GetAllyCodeObj(obj, opt)
    }
    if(dObj?.uId && dObj?.type){
      await ReplyButton(obj, 'Pulling guild TB data ...')
      msg2send.content = 'Error getting guild data'
      let tempGuild = await swgohClient('guild', {}, dObj, obj)
      if(tempGuild === 'GETTING_CONFIRMATION') return
      if(tempGuild?.data?.guild){
        msg2send.content = 'there is not a TB in progress'
        gObj = tempGuild?.data?.guild
      }
    }
    if(gObj?.territoryBattleStatus.length > 0){
      msg2send.content = 'error getting tb definition file'
      tbDef = (await mongo.find('tbList', {_id: gObj.territoryBattleStatus[0].definitionId}))[0]
    }
    if(tbDef){
      msg2send.conent = 'error getting map stats'
      mapStats = await getMapStats(obj, dObj, tbDef.statCategory, gObj.territoryBattleStatus[0].instanceId)
      if(mapStats === 'GETTING_CONFIRMATION') return
    }
    if(mapStats){
      msg2send.content = 'error calculating gp'
      let gp = getGp(mapStats, gObj.member, gObj.territoryBattleStatus[0].currentRound)
      let missingGp = getMissingGp(gp.player)
      if(gp && missingGp && missingGp[tempCmd]){

        if(missingGp[tempCmd].players.length > 0){
          missingGp[tempCmd].players = sorter([{column: 'deployed', order: 'descending'}], missingGp[tempCmd].players)
          tbData = { guildName: gObj.profile.name, gp: gp.guild, deployed: gp.deployed, missing: missingGp[tempCmd], currentRound: gObj.territoryBattleStatus[0].currentRound}
          tbData.endTime = getTimeTillEnd(gObj.territoryBattleStatus[0].currentRoundEndTime)
        }else{
          msg2send.conent = 'No players with deployment issues'
        }
      }
    }
    if(tbData){
      msg2send.conent = 'error getting html'
      webHTML = getHTML(tbData)
    }
    if(webHTML){
      msg2send.content = 'error getting screen shot'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'tb-gp-satus.png'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
