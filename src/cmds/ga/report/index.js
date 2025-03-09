'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')
const getUnits = require('./getUnits')

const { getDiscordAC } = require('src/helpers')
const { formatGAOverview, formatGAMods, formatGARelics, formatGAQuality } = require('src/format')

module.exports = async(obj = {}, opt = {}, dObj, gaInfo)=>{
  if(!dObj) dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  if(!gaInfo) gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.currentEnemy) return { content: 'You do not have a GA opponent configured' }

  if(!gaInfo?.playerId) gaInfo.playerId = dObj.playerId
  if(!gaInfo?.playerId) gaInfo.playerId = await swgohClient.post('getPlayerId', { allyCode: dObj.allyCode })

  let [ pObj, eObj ] = await Promise.allSettled([
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.playerId, allyCode: dObj.allyCode, opponent: dObj.allyCode }),
    swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: dObj.allyCode})
  ])
  if(!pObj?.value?.playerId) return { content: 'error getting player info' }
  if(!eObj?.value?.playerId) return { content: 'error getting opponent info' }

  pObj = pObj.value, eObj = eObj.value
  let msg2send = { content: null, embeds: [] }
  let gaOverview = {
    color: 15844367,
    timestamp: new Date(eObj.updated),
    footer: {
      text: 'Data Updated'
    },
    title: pObj.name+' GA Overview',
    description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
    fields: []
  }
  gaOverview.fields.push(formatGAOverview(pObj, eObj));
  gaOverview.fields.push(formatGAMods(pObj, eObj));
  gaOverview.fields.push(formatGARelics(pObj, eObj));
  gaOverview.fields.push(formatGAQuality(pObj, eObj));
  msg2send.embeds.push(gaOverview)
  if(gaInfo.units.length > 0){
    let charUnits = sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 1))
    let shipUnits = sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 2))
    if(charUnits?.length > 0) await getUnits(pObj, eObj, charUnits, msg2send, 'Char')
    if(shipUnits.length > 0) await getUnits(pObj, eObj, shipUnits, msg2send, 'Ship')
  }
  return msg2send
}
