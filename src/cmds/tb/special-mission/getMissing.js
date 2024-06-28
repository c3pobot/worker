'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getGuideUnits = require('src/cmds/g/panic/getGuideUnits')
const getFactionUnits = require('src/cmds/g/panic/getFactionUnits')
const checkMember = require('src/cmds/g/panic/checkMember')
const { fetchGuild } = require('src/helpers')
module.exports = async(mission, guildId, attempted)=>{
  let id = mission.rewardUnit?.baseId || mission.id
  let guideTemplate = (await mongo.find('guideTemplates', { _id: id}))[0]
  if(!guideTemplate?.baseId) return

  let { requiredUnits, optionalUnits } = await getGuideUnits(guideTemplate)
  if(!requiredUnits || !optionalUnits) return { content: 'error getting guide' }
  if(requiredUnits?.length === 0 && optionalUnits.length === 0) return { content: 'error getting guide units' }

  let rosterProject = {}
  for(let i in requiredUnits){
    if(!requiredUnits[i]) continue
    rosterProject[requiredUnits[i]] = { baseId: 1, nameKey: 1, combatType: 1, icon: 1, gp: 1, rarity: 1, level: 1, relicTier: 1, gearTier: 1 }
  }
  for(let i in optionalUnits){
    if(!optionalUnits[i]) continue
    rosterProject[optionalUnits[i]] = { baseId: 1, nameKey: 1, combatType: 1, icon: 1, gp: 1, rarity: 1, level: 1, relicTier: 1, gearTier: 1 }
  }

  let gObj = await fetchGuild({ guildId: guildId, projection: { playerId: 1, name: 1, roster: rosterProject } })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: `error finding guild...` }

  let unitList = { count: 0 }, data = []
  if(guideTemplate.factions?.length > 0){
    for(let i in guideTemplate.factions){
      guideTemplate.factions[i].units = getFactionUnits(guideTemplate.factions[i], new Set(requiredUnits))
    }
  }

  for(let i in gObj.member){
    if(attempted?.has(gObj.member[i].playerId)) continue
    let tempObj = await checkMember(gObj.member[i].roster, guideTemplate, unitList)
    if(!tempObj.requiredUnits) continue
    if(!tempObj.notMet) data.push(gObj.member[i].playerId)
  }
  return data
}
