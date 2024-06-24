'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')

const { getDiscordAC } = require('src/helpers')

const getUnits = (pObj = {}, units = [], msg2send = { embeds: []}, type)=>{
  if(!units || units?.length == 0) return
  let unitMsg = {
    color: 15844367,
    title: `${pObj.name} ${type} units for GA comparison`,
    description: '```\n'
  }
  for(let i in units) unitMsg.description += units[i].nameKey+'\n';
  unitMsg.description += '```'
  msg2send.embeds.push(unitMsg)
}

module.exports = async(obj = {}, opt = {}, dObj, gaInfo)=>{
  if(!dObj) dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  if(!gaInfo) gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo) gaInfo = { units: [], enemies: [] }
  if(!gaInfo.units) gaInfo.units = [];
  if(!gaInfo.enemies) gaInfo.enemies = [];
  if(!gaInfo.playerId && pObj.id) gaInfo.playerId = pObj.id
  if(!gaInfo?.units || gaInfo?.units?.length == 0) return { content: 'You have no units set for comparison' }

  let pObj = await swgohClient.post('playerArena', { allyCode: allyCode?.toString() })
  if(!pObj) return { content: 'error getting player info' }

  let msg2send = { content: null, embeds: [] }

  getUnits(pObj, sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 1) || []), msg2send, 'Char')
  getUnits(pObj, sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 2) || []), msg2send, 'Ship')
  return msg2send
}
