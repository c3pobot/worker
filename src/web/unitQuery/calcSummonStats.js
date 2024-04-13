"use strict";

const convertFlatDefToPercent = (value, level)=>{
  return (value / (level*7.5 + value))
}

const convertFlatCritToPercent = (value)=>{
  return ((value / 2400) + 0.1)
}
const convertPercentDefToFlat = (value,level)=>{
  return ( ((level * 7.5) * value) / ( 1 - value ) )
}
const convertPercentCritToFlat = (value)=>{
  return ( (value - 0.1)*2400)
}
const convertFlatAccToPercent = (value)=>{
  return (value/1200)
}

module.exports = async(unit)=>{
  try{
    const div = 100000000
    let sTier = 0
    const uStats = unit.stats
    const sUnit = (await mongo.find("summonerList", {baseId: unit.baseId}))[0]
    if(sUnit){
      if(sUnit.skill != "none" && unit.skill.find(x=>x.id == sUnit.skill))
      sTier = (unit.skill.find(x=>x.id == sUnit.skill).tier) - 1
    }
    const sId = sUnit.tier[sTier]
    const sData = await redis.get('su-'+sId)
    if(sData){
      const sInfo = {
        nameKey:sData.nameKey,
        combatType:sData.combatType
      }
      const stats = {}
      for(let i in sData.gearLvl[unit.currentTier]){
        stats[i] = sData.gearLvl[unit.currentTier][i] / div
      }

      stats[2] += Math.floor( (sData.growthModifiers[unit.currentRarity][2] / div) * unit.currentLevel )
      stats[3] += Math.floor( (sData.growthModifiers[unit.currentRarity][3] / div) * unit.currentLevel )
      stats[4] += Math.floor( (sData.growthModifiers[unit.currentRarity][4] / div) * unit.currentLevel )

      stats[1] = Math.floor( (stats[1] || 0) + (stats[2] * 18) )
      stats[6] = Math.floor( (stats[6] || 0) + (stats[sData.primaryStat] * 1.4) )
      stats[7] = Math.floor( (stats[7] || 0) + (stats[4] * 2.4) )
      stats[8] = Math.floor( (stats[8] || 0) + (stats[2] * 0.14) + (stats[3] * 0.07)  )
      stats[9] = Math.floor( (stats[9] || 0) + (stats[4] * 0.1) )
      stats[14] = Math.floor( (stats[14] || 0) + (stats[3] * 0.4) )
      stats[12] = (stats[12] || 1) + 23
      stats[13] = (stats[13] || 1) + 23
      if(stats[16]){
        if(stats[16] >=0){
          stats[16] = stats[16]
        }else{
          stats[16] = 1.5
        }
      }
      stats[18] = (stats[18] || 0) + 0.15
      for(let i in sData.scaler){
        let uBase = (uStats.base[i] || 0)
        if(sData.combatType == 1){
          uBase += (uStats.gear[i] || 0) + (uStats.mods[i] || 0)
        }else{
          uBase += (uStats.crew[i] || 0)
        }
        if(i == 8 || i == 9){
          uBase = convertPercentDefToFlat(uBase, unit.currentLevel)
          stats[i] = (stats[i] || 0) + Math.floor(uBase * (sData.scaler[i]/div))
        }else if(i == 14 || i == 15){
          if(i == 14 && sData.combatType == 1){
            uBase = (uStats.base[14] || 0) + (uStats.base[21] || 0)
            uBase = convertPercentCritToFlat(uBase)
            stats[i] = (stats[i] || 0) + Math.floor(uBase * (sData.scaler[i]/div))
          }
          if(i == 15 && sData.combatType == 1){
            uBase = (uStats.base[15] || 0) + (uStats.base[22] || 0)
            uBase = convertPercentCritToFlat(uBase)
            stats[i] = (stats[i] || 0) + Math.floor(uBase * (sData.scaler[i]/div))
          }
        }else{
          stats[i] = (stats[i] || 0) + Math.floor(uBase * (sData.scaler[i]/div))
        }
      }
      stats[8] = convertFlatDefToPercent((stats[8] || 0),unit.currentLevel)
      stats[9] = convertFlatDefToPercent((stats[9] || 0),unit.currentLevel)
      stats[12] = convertFlatAccToPercent(stats[12] || 0)
      stats[13] = convertFlatAccToPercent(stats[13] || 0)
      stats[14] = convertFlatCritToPercent(stats[14] || 0)
      stats[15] = convertFlatCritToPercent(stats[15] || 0)
      stats[52] = convertFlatAccToPercent(stats[52] || 0)
      let statsNeeded = sData.scaler
      if(sUnit.stats){
        statsNeeded = sUnit.stats
      }
      if(sUnit.nameKey){
        sInfo.nameKey = sUnit.nameKey
      }
      let cleanStats = []
      for(let i in statsNeeded){
        if(i == 14 || i == 15){
          cleanStats.push({
            nameKey:(i == 14 ? 'Physical Crit' : 'Special Crit'),
            value: numeral(stats[i] * 100).format("0.0")+"%"
          })
        }else{
          cleanStats.push({
            nameKey:statEnum.stats[i],
            value:(statEnum.pct[i] ? numeral(stats[i] * 100).format("0.0")+"%" : numeral(stats[i]).format("0,0"))
          })
        }

      }
      sInfo.stats = cleanStats
      return(sInfo)
    }else{
      return({})
    }
  }catch(e){
    console.log(e)
    return({})
  }
}
