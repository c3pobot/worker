'use strict'
const { botSettings } = require('src/helpers/botSettings')
const enumRarity = {
  1: 'ONE_STAR',
  2: 'TWO_STAR',
  3: 'THREE_STAR',
  4: 'FOUR_STAR',
  5: 'FIVE_STAR',
  6: 'SIX_STAR',
  7: 'SEVEN_STAR'
}

const createCrewMember = async(uInfo = {})=>{
  let res = {
    definitionId: uInfo.baseId+':'+enumRarity[rarity],
    currentRarity: 6,
    currentLevel: 85,
    equipment: [],
    equippedStatMod: [],
    baseSkill: uInfo.skills,
    skill: [],
    currentTier: 12,
    relic: {currentTier: 1}
  }
  return res
}
const createShip = async(baseId, rarity)=>{
  let res = {
    definitionId: uInfo.baseId+':'+enumRarity[rarity],
    currentRarity: rarity,
    currentLevel: 85
  }
  return res
}
const mongo = require('mongoclient')
const { getOptValue, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opts = [])=>{
  let msg2send = { content: 'ship not provided'}, uInfo, rLevel = botSettings.maxRelic || 11, crew, shipData, baseCrew, baseShip
  return { content: 'command still in progress i think...'}
  let unit = getOptValue(opt, 'unit')
  let shipRarity = getOptValue(opt, 'rarity', 7)
  if(+shipRarity > 7 || !shipRarity) shipRarity = 7
  shipRarity = +shipRarity
  if(unit) unit = unit.toString().trim()
  if(unit){
    msg2send.content = 'Error finding unit **'+unit+'**'
    uInfo = await findUnit(obj, unit, guildId)
    if(uInfo === 'GETTING_CONFIRMATION') return
  }
  if(uInfo?.baseId){
    crew = []
    msg2send.content = 'error getting info for crew from DB'
    for(let i in uInfo.crew){
      let cInfo = await mongo.find('units', {_id: {$in: uInfo.crew}}, {faction: 0, categoryId: 0})
      if(cInfo?.length > 0) crew = cInfo
    }
    if(uInfo.crew && crew){
      if(crew.length !== uInfo.crew.length) crew = null
    }
  }
  if(crew){
    for(let i in crew){
      let tempCrew = await createCrewMember(crew[i])
    }
  }
  return msg2send
}
