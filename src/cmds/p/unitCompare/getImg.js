const GetHTML = require('webimg').ga
module.exports = async(uInfo = {}, pObj = {}, eObj = {})=>{
  try{
    let res = {content: 'Neither player has **'+uInfo.nameKey+'**'}, webData, unitImg
    let pUnit = pObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
    let eUnit = eObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
    if(pUnit) pUnit = await FT.FormatUnit(uInfo, pUnit)
    if(eUnit) eUnit = await FT.FormatUnit(uInfo, eUnit)
    if(pUnit || eUnit){
      res.content = 'Error getting HTML'
      webData = await GetHTML.unit(pUnit, eUnit, {
        player: pObj.name,
        enemy: eObj.name,
        footer: 'Unit comparison | Data Updated '+(new Date(pObj.updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})
      })
    }
    if(webData){
      res.content = 'Error getting image'
      unitImg = await HP.GetImg(webData, null, 50, false)
    }
    if(unitImg){
      res.content = null
      res.file = unitImg
      res.fileName = 'unit-'+uInfo.baseId+'.png'
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error occured getting image'}
  }
}
