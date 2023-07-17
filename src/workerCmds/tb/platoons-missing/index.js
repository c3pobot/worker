'use strict'
const { log, mongo, ButtonPick, GetAllyCodeObj, GetScreenShot, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const { getGuild, getGuildMembers, getTimeTillEnd, getUnitMap, getMissingUnitMap } = require('./helper')
const sorter = require('json-array-sorter')
const getHTML = require('helpers/getHTML/tbMissingPlatoons')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let gObj, tbDef, missingUnitMap, unitMap, replyMethod = 'PATCH', showPlayers = true, guildMembers, webHTML, webImg, msg2send = {content: 'You do not have google/code auth linked to your discordId'}
    let dObj = await GetAllyCodeObj(obj, opt)
    let commandState = obj.confirm?.commandState || 3
    if(obj.confirm?.commandState) replyMethod = 'POST'
    if(dObj?.uId && dObj?.type){
      if(obj.confirm) await ReplyButton(obj, 'Pulling guild TB data ...')
      msg2send.content = 'Error getting guild data'
      gObj = await getGuild(dObj, obj)
      if(gObj === 'GETTING_CONFIRMATION') return
      if(gObj?.member) msg2send.content = 'there is not a TB in progress'
    }
    if(gObj?.territoryBattleStatus.length > 0){
      mongo.set('webTemp', {_id: 'guild'}, {data: gObj})
      msg2send.content = 'error getting tb definition file'
      tbDef = (await mongo.find('tbList', {_id: gObj.territoryBattleStatus[0].definitionId}))[0]
    }
    if(tbDef){
      msg2send.content = 'all platoons are filled'
      let tempData = getUnitMap(gObj.territoryBattleStatus[0].reconZoneStatus.filter(x=>x.zoneStatus.zoneState === 3 && x.zoneStatus.commandState < commandState), tbDef.reconZoneDefinition)
      if(tempData.missingUnits > 0 && tempData.unitMap){
        unitMap = tempData.unitMap
        if( tempData.missingUnits > 20 ) showPlayers = false
      }
    }
    if(unitMap){
      msg2send.content = 'error getting guild members'
      if(showPlayers){
        guildMembers = await getGuildMembers(gObj.member, gObj.profile.id)
      }else{
        guildMembers = []
      }
    }
    if(guildMembers?.length > 0 || (unitMap && !showPlayers)){
      msg2send.content = 'error mapping data'
      missingUnitMap = getMissingUnitMap(unitMap, guildMembers, tbDef, showPlayers)
      if(missingUnitMap?.length > 0) missingUnitMap = await sorter([{column: 'sort', order: 'ascending'}], missingUnitMap)
    }
    if(missingUnitMap?.length > 0){
      msg2send.content = 'error getting html'
      //mongo.set('webTemp', {_id: 'platoonMap'}, {data: { name: gObj.profile.name, tbName: tbDef.nameKey, currentRound: gObj.territoryBattleStatus[0].currentRound, timeTillEnd: getTimeTillEnd(gObj.territoryBattleStatus[0].currentRoundEndTime), missingUnitMap: missingUnitMap }})
      webHTML = getHTML({ name: gObj.profile.name, tbName: tbDef.nameKey, currentRound: gObj.territoryBattleStatus[0].currentRound, timeTillEnd: getTimeTillEnd(gObj.territoryBattleStatus[0].currentRoundEndTime), missingUnitMap: missingUnitMap, showPlayers: showPlayers })
    }
    if(webHTML){
      msg2send.content = 'error getting screen shot'
      webImg = await GetScreenShot(webHTML, obj.id)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'tb-'+tbDef._id+'-missing-platoons.png'
      msg2send.components = []
      let component = { type: 1, components: []}
      component.components.push({
        type: 2,
        label: commandState === 3 ? 'Included Prohibited':'Exlude Prohibited',
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, commandState: (commandState === 3 ? 4:3)})
      })
      msg2send.components.push(component)
    }
    if(msg2send.components){
      await ButtonPick(obj, msg2send, replyMethod)
    }else{
      await ReplyMsg(obj, msg2send)
    }
  }catch(e){
    throw(e)
  }
}
