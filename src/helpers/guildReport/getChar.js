'use strict'
const numeral = require('numeral')
const { CalcUnitZeta, CalcUnitRelic, CalcUnitUlt, CalcUnitOmi } = require('./statCalc')
const omiFilter = {
  all: (x=>x.omiTier),
  tw: (x=>x.omicronMode === 8)
}
module.exports = (uInfo = {}, homeUnits = [], awayUnits)=>{
  let str = '', len = 7, homeZeta, awayZeta, homeUlt, awayUlt, omiSkills = [], homeOmi, awayOmi, omiOpt = 'all'
  if(awayUnits) omiOpt = 'tw'
  let homeRelic = CalcUnitRelic(homeUnits)
  let awayRelic = CalcUnitRelic(awayUnits)
  if(uInfo.skills){
     omiSkills = Object.values(uInfo.skills).filter(omiFilter[omiOpt])
     if(Object.values(uInfo.skills).filter(x=>x.zetaTier).length > 0){
       homeZeta = CalcUnitZeta(uInfo.skills, homeUnits)
       awayZeta = CalcUnitZeta(uInfo.skills, awayUnits)
     }
  }
  if(uInfo.ultimate && Object.values(uInfo.ultimate).length > 0){
    homeUlt = CalcUnitUlt(homeUnits)
    awayUlt = CalcUnitUlt(awayUnits)
  }
  if(omiSkills?.length > 0){
    homeOmi = CalcUnitOmi(omiSkills, homeUnits)
    awayOmi = CalcUnitOmi(omiSkills, awayUnits)
  }
  if(homeRelic){
    str += 'Reliced     : '+numeral(homeRelic.total || 0).format('0,0').padStart(len, ' ')
    if(awayRelic) str += ' vs '+numeral(awayRelic.total || 0).format('0,0')
    str += '\n'
    for(let i=11;i>4;i--){
      if(homeRelic[i] || (awayRelic && awayRelic[i])){
        str += 'R'+i.toString()+'          : '+numeral(homeRelic[i] || 0).format('0,0').padStart(len, ' ')
        if(awayRelic) str += ' vs '+numeral(awayRelic[i] || 0).format('0,0')
        str += '\n'
      }
    }
  }
  if(homeZeta){
    str += 'All Zeta\'s  : '+numeral(homeZeta.all || 0).format('0,0').padStart(len, ' ')
    if(awayZeta) str += ' vs '+numeral(awayZeta.all || 0).format('0,0')
    str += '\n'
    if(homeZeta.some || awayZeta?.some){
      str += 'Some Zeta\'s : '+numeral(homeZeta.some || 0).format('0,0').padStart(len, ' ')
      if(awayZeta) str += ' vs '+numeral(awayZeta.some || 0).format('0,0')
      str += '\n'
    }
  }
  if(homeOmi){
    str += 'All Omi\'s   : '+numeral(homeOmi.all).format('0,0').padStart(len, ' ')
    if(awayOmi) str += ' vs '+numeral(awayOmi.all).format('0,0')
    str += '\n'
    if(homeOmi.some || awayOmi?.some){
      str += 'Some Omi\'s  : '+numeral(homeOmi.some).format('0,0').padStart(len, ' ')
      if(awayOmi) str += ' vs '+numeral(awayOmi.some).format('0,0')
      str += '\n'
    }
  }
  if(homeUlt >= 0 || awayUlt >= 0){
    str += 'Ultimate    : '+numeral(homeUlt).format('0,0').padStart(len, ' ')
    if(awayUlt >= 0) str += ' vs ' + numeral(awayUlt).format('0,0')
    str += '\n'
  }
  return str
}
