'use strict'
const mongo = require('mongoclient')

const { getFactionUnits } = require('src/helpers')

module.exports = async(squad = [], roster = [])=>{
  if(!squad || squad.length == 0) return
  let squadUnits = []
  let squadFilter = squad.map(u=>u.unitDefId.split(':')[0])
  if(squadFilter?.length > 0) squadUnits =  await mongo.find('units', {_id: {$in: squadFilter}})
  if(squadUnits?.length > 0) return await getFactionUnits( {units: squadUnits}, roster, FT.FormatWebUnitStats, 40 )
}
