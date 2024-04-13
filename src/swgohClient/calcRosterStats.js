'use strict'
const log = require('logger')
const { calcRosterStats } = require('statcalc')
module.exports = (player = {}, calcExtraStats = false)=>{
  try{
    if(!player.rosterUnit || player.rosterUnit.length === 0) throw(`${player.allyCode} has no units`)
    let profile = calcRosterStats(player.rosterUnit)

    if(profile?.summary){
      let res = { zetaCount: profile.summary.zeta, sixModCount: profile.summary.mod.r6, omiCount: profile.summary.omi, roster: profile.roster, summary: profile.summary}
      res.omiCount.gac = profile.summary.omi.ga
      res.omiCount.conquest = profile.summary.omi.cq
      return res
    }
  }catch(e){
    log.error('Roster Calc error for '+player.allyCode)
    throw(e)
  }
}
