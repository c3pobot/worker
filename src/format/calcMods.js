'use strict'
module.exports = (obj, min, max)=>{
  return obj.reduce((acu, u) => {
    return acu + u.equippedStatMod.reduce((acm, m) => {
      return acm + m.secondaryStat.filter(ss => ss.stat.unitStatId == 5 && ss.stat.statValueDecimal > min*10000 && ss.stat.statValueDecimal < max*10000).length
    }, 0)
  }, 0)
}
