'use strict'
const mongo = require('mongoclient')

const { omicron } = require('src/helpers/enum')
const { formatWebUnit } = require('src/format')

module.exports = async(units = [], omiData = [])=>{
  if(!units) return
  if(units.length == 0) return []
  let res = {}
  for(let u in units){
    let omiSkills = []
    let omiconMode = 0
    for(let i in units[u].skill){
      const tempSkill = omiData.find(x=>x.id == units[u].skill[i].id)
      if(tempSkill?.omiTier && +units[u].skill[i].tier + 2 >= tempSkill.omiTier) omiSkills.push(tempSkill)
    }
    if(omiSkills?.length == 0) continue
    if(!res[omiSkills[0].omicronMode]) res[omiSkills[0].omicronMode] = { nameKey: omicron[omiSkills[0].omicronMode], units: [], count: 0 }
    let uInfo = (await mongo.find('units', {_id: units[u].definitionId.split(':')[0]}))[0]
    if(!uInfo?.baseId) continue
    let tempUnit = await formatWebUnit(units[u], uInfo)
    if(!tempUnit) continue
    tempUnit.omiSkills = omiSkills
    if(res[omiSkills[0].omicronMode]?.units){
      res[omiSkills[0].omicronMode].units.push(tempUnit)
      res[omiSkills[0].omicronMode].count++
    }
  }
  if(res) return Object.values(res)
}
