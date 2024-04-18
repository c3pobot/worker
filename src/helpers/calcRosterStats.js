'use strict'
const log = require('logger')
const { calcRosterStats } = require('statcalc')
module.exports = (rosterUnit = [], allyCode)=>{
  try{
    if(!rosterUnit || rosterUnit.length === 0) throw(`${allyCode} has no units`)
    let profile = calcRosterStats(rosterUnit)
    if(!profile?.summary) return
    let res = { zetaCount: profile.summary.zeta, sixModCount: profile.summary.mod.r6, omiCount: profile.summary.omi, roster: profile.roster, summary: profile.summary}
    res.omiCount.gac = profile.summary.omi.ga
    res.omiCount.conquest = profile.summary.omi.cq
    return res
  }catch(e){
    if(allyCode) log.error(`Roster Calc error for ${allyCode}`)
    throw(e)
  }
}
