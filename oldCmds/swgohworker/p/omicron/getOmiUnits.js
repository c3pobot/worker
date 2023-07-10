'use strict'
const enumOmicron = require('./enum')
module.exports = async(units = [], omiData = [])=>{
  try{
    let res = {}
    for(let u in units){
      const omiSkills = []
      let omiconMode = 0
      for(let i in units[u].skill){
        const tempSkill = omiData.find(x=>x.id == units[u].skill[i].id)
        if(tempSkill?.omiTier && +units[u].skill[i].tier + 2 >= tempSkill.omiTier) omiSkills.push(tempSkill)
      }
      if(omiSkills?.length > 0){
        if(!res[omiSkills[0].omicronMode]) res[omiSkills[0].omicronMode] = {nameKey: enumOmicron[omiSkills[0].omicronMode], units: [], count: 0}
        const uInfo = (await mongo.find('units', {_id: units[u].definitionId.split(':')[0]}))[0]
        if(uInfo){
          const tempUnit = await FT.FormatWebUnit(units[u], uInfo)
          if(tempUnit){
            tempUnit.omiSkills = omiSkills
            if(res[omiSkills[0].omicronMode]?.units){
              res[omiSkills[0].omicronMode].units.push(tempUnit)
              res[omiSkills[0].omicronMode].count++
            }
          }
        }
      }
    }
    if(res) return Object.values(res)
  }catch(e){
    console.error(e);
  }
}
