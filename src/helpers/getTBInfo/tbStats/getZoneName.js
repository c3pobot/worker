'use strict'
module.exports = (zoneInfo)=>{
  let zoneArray = zoneInfo.zoneDefinition.zoneId.split("_")
  let zoneName = zoneInfo.zoneDefinition.zoneId
  if(zoneArray.length > 2){
    zoneName = "P"+zoneArray[2].charAt(6)
  }else{
    zoneName = "P"+zoneArray[0].charAt(6)
  }
  if(zoneInfo.combatType === 2){
    zoneName += " Ships"
  }else{
    if(zoneArray.length > 2){
      if(zoneArray[3] === "conflict02"){
        zoneName += " Middle"
      }else{
        zoneName += " South"
      }
    }else{
      if(zoneArray[1] === "conflict02"){
        zoneName += " Middle"
      }else{
        zoneName += " South"
      }
    }
  }
  return zoneName
}
