'use strict'
module.exports = async(squad = [], roster = [])=>{
  try{
    if(squad?.length > 0){
      let squadUnits = []
      const squadFilter = squad.map(u=>u.unitDefId.split(':')[0])
      if(squadFilter?.length > 0) squadUnits =  await mongo.find('units', {_id: {$in: squadFilter}}, {portrait: 0})
      if(squadUnits?.length > 0) return await HP.GetFactionUnits({units: squadUnits}, roster, FT.FormatWebUnitStats, 40)
    }
  }catch(e){
    console.log(e)
  }
}
