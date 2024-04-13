'use strict'
module.exports = async(uInfo, unit)=>{
  try{
    const alignment = (uInfo.categoryId.filter(x=>x == 'alignment_light').length > 0 ? 'light':'dark')
    const obj = {
      nameKey: uInfo.nameKey,
      baseId: uInfo.baseId,
      thumbnail: uInfo.thumbnailName,
      gp: 0,
      formatedGP: 0,
      zeta: 0,
      rarity: 0,
      level: 0,
      relic: 0,
      gClass: (uInfo.combatType == 1 ? 'char-portrait-full-gear-t1':''),
      stats: {
        speed: 0,
        health: 0,
        protection: 0,
        pd: 0,
        sd: 0
      }
    }
    if(unit){
      obj.gp = +unit.gp
      obj.formatedGP = numeral(unit.gp).format('0,0')
      obj.rarity = +unit.currentRarity
      obj.level = +unit.currentLevel
      if(uInfo.combatType == 1) obj.gClass = 'char-portrait-full-gear-t'+unit.currentTier
      if(uInfo.combatType == 1 && unit.currentTier > 12) obj.gClass += ' char-portrait-full-alignment-'+alignment+'-side'
      if(uInfo.combatType == 1 && unit.relic && unit.relic.currentTier > 2){
        obj.relic = unit.relic.currentTier
        obj.rClass = (unit.ultimate > 0 ? 'char-portrait-full-relic char-ultimate' : 'char-portrait-full-relic')
      }
      if(uInfo.combatType == 1){
        for(let s in unit.skill){
          if(uInfo.skills[unit.skill[s].id].isZeta && uInfo.skills[unit.skill[s].id].maxTier == (unit.skill[s].tier + 2)) obj.zeta++
        }
      }
      if(unit.stats){
        if(uInfo.combatType == 1){
          obj.stats.speed = (+unit.stats.base[5] || 0) + (+unit.stats.gear[5] || 0) + (+unit.stats.mods[5] || 0)
          obj.stats.health = numeral((+unit.stats.base[1] || 0) + (+unit.stats.gear[1] || 0) + (+unit.stats.mods[1] || 0)).format('0,0')
          obj.stats.protection = numeral((+unit.stats.base[28] || 0) + (+unit.stats.mods[28] || 0)).format('0,0')
          obj.stats.pd = numeral((+unit.stats.base[6] || 0) + (+unit.stats.gear[6] || 0) + (+unit.stats.mods[6] || 0)).format('0,0')
          obj.stats.sd = numeral((+unit.stats.base[7] || 0) + (+unit.stats.gear[7] || 0) + (+unit.stats.mods[7] || 0)).format('0,0')
        }else{
          obj.stats.speed = (+unit.stats.base[5] || 0) + (+unit.stats.crew[5] || 0)
          obj.stats.health = numeral((+unit.stats.base[1] || 0) + (+unit.stats.crew[1] || 0)).format('0,0')
          obj.stats.protection = numeral((+unit.stats.base[28] || 0) + (+unit.stats.crew[28] || 0)).format('0,0')
          obj.stats.pd = numeral((+unit.stats.base[6] || 0) + (+unit.stats.crew[6] || 0)).format('0,0')
          obj.stats.sd = numeral((+unit.stats.base[7] || 0) + (+unit.stats.crew[7] || 0)).format('0,0')
        }
      }
    }
    return obj
  }catch(e){
    console.error(e)
  }
}
