'use strict'
const numeral = require('numeral')
module.exports = (glUnits = [], homeGuild = {}, awayGuild)=>{
  let homeGLCount = 0, awayGLCount = 0, len = 7
  if(glUnits.length > 0){
    for(let i in glUnits){
      homeGLCount += +(homeGuild?.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(glUnits[i]+':'))).length || 0)
      if(awayGuild?.member) awayGLCount += +(awayGuild?.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(glUnits[i].baseId+':'))).length || 0)
    }
  }
  let res = {
    name:"Overview",
    value:"```autohotkey\n"
  }
  if(awayGuild){
    res.value +="Zeta's  : "+numeral(homeGuild?.zetaCount || 0).format("0,0").padStart(len, ' ')+" vs "+numeral(awayGuild?.zetaCount || 0).format("0,0")+"\n"
    res.value +="R6 Mods : "+numeral(homeGuild?.sixModCount || 0).format("0,0").padStart(len, ' ')+" vs "+numeral(awayGuild?.sixModCount || 0).format("0,0")+"\n"
    if(homeGLCount || awayGLCount) res.value +="GL's    : "+numeral(homeGLCount).format("0,0").padStart(len, ' ')+" vs "+numeral(awayGLCount).format("0,0")+"\n"
    res.value +="TW Omi  : "+numeral(homeGuild?.omiCount?.tw || 0).format('0,0').padStart(len, ' ')+' vs '+numeral(awayGuild?.omiCount?.tw || 0).format('0,0')+'\n'
  }else{
    res.value +="Zeta's  : "+numeral(homeGuild?.zetaCount || 0).format("0,0")+"\n"
    res.value +="R6 Mods : "+numeral(homeGuild?.sixModCount || 0).format("0,0")+"\n"
    if(homeGLCount) res.value +="GL's    : "+numeral(homeGLCount).format("0,0")+"\n"
  }
  res.value +="```"
  return res
}
