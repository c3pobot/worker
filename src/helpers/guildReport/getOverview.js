'use strict'
const numeral = require('numeral')
module.exports = (glUnits = [], homeGuild = {}, awayGuild)=>{
  let homeGLCount = 0, awayGLCount = 0, len = 7
  let res = {
    name:"Overview",
    value:"```autohotkey\n"
  }
  if(glUnits.length > 0){
    for(let i in glUnits){
      homeGLCount += +(homeGuild.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(glUnits[i].baseId+':'))).length || 0)
      if(awayGuild?.member) awayGLCount += +(awayGuild.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(glUnits[i].baseId+':'))).length || 0)
    }
  }
  if(homeGuild){
    res.value += "Zeta's  : "+numeral(homeGuild.zetaCount || 0).format("0,0").padStart(len, ' ')
    if(awayGuild) res.value += " vs "+numeral(awayGuild.zetaCount || 0).format("0,0")
    res.value += '\n'
    res.value += "R6 Mods : "+numeral(homeGuild.sixModCount || 0).format("0,0").padStart(len, ' ')
    if(awayGuild) res.value += " vs "+numeral(awayGuild.sixModCount || 0).format("0,0")
    res.value += '\n'
    res.value += "GL's    : "+numeral(homeGLCount || 0).format("0,0").padStart(len, ' ')
    if(awayGuild) res.value += " vs "+numeral(awayGLCount || 0).format("0,0")
    res.value += '\n'
    if(awayGuild) res.value += "TW Omi  : "+numeral(homeGuild.omiCount?.tw || 0).format('0,0').padStart(len, ' ')+' vs '+numeral(awayGuild.omiCount?.tw || 0).format('0,0')+'\n'
  }
  res.value +="```"
  return res
}
