'use strict'
const mongo = require('mongoclient')
const { getDiscordAC, getPlayerAC, fetchPlayer } = require('src/helpers')
const { formatGAOverview, formatGAMods, formatGARelics, formatGAQuality, formatGAUnitBasic } = require('src/format')
const getUnits = require('./getUnits')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allyCode linked to discordId'}, pObj, eObj, eAllyCode, gaInfo, charUnits = [], shipUnits = []
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.allyCode) return {content: 'You do not have allyCode linked to discordId'}
  let edObj = await getPlayerAC({}, opt)
  if(edObj?.mentionError) return {content: 'That user does not have allyCode linked to discordId'}
  if(edObj?.allyCode) eAllyCode = edObj.allyCode
  if(eAllyCode){
    msg2send.content = 'Error getting player data'
    pObj = await fetchPlayer({token: obj.token, allyCode: dObj.allyCode.toString()})
    gaInfo = (await mongo.find('ga', {_id: dObj.allyCode.toString()}))[0]
    if(!gaInfo) gaInfo = {}
    if(!gaInfo.units) gaInfo.units = []
  }
  if(pObj?.allyCode){
    msg2send.content = '**'+eAllyCode+'** is not a valid allyCode'
    eObj = await fetchPlayer({token: obj.token, allyCode: eAllyCode.toString()})
  }
  if(eObj?.allyCode){
    msg2send.content = null
    msg2send.embeds = []
    let baseMsg = {
      color: 15844367,
      timestamp: new Date(eObj.updated),
      footer: {
        text: 'Data Updated'
      },
      title: pObj.name+' player comparison',
      description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
      fields: []
    }

    baseMsg.fields.push(formatGAOverview(pObj, eObj));
    baseMsg.fields.push(formatGAMods(pObj, eObj));
    baseMsg.fields.push(formatGARelics(pObj, eObj));
    baseMsg.fields.push(formatGAQuality(pObj, eObj));
    msg2send.embeds.push(baseMsg)
    if(gaInfo.units.length > 0){
      if(gaInfo.units.filter(x=>x.combatType == 1).length > 0) charUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 1))
      if(gaInfo.units.filter(x=>x.combatType == 2).length > 0) shipUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 2))
      if(charUnits.length > 0) await getUnits(pObj, eObj, charUnits, msg2send, 'Char')
      if(shipUnits.length > 0) await getUnits(pObj, eObj, shipUnits, msg2send, 'Ship')
    }
  }
  return msg2send
}
