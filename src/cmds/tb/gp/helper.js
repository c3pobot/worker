'use strict'
const numeral = require('numeral')
const Cmds = {}
Cmds.getMissingGP = (member, gpDeployed)=>{
  let tempObj = {
    name: member.name,
    value: "```autohotkey\n"
  }
  tempObj.value += 'Deployed     : '+numeral(gpDeployed).format('0,0')+'\n';
  tempObj.value += 'Not Deployed : '+numeral(member.gp - (+gpDeployed)).format('0,0')+'\n';
  tempObj.value += 'Total        : '+numeral(member.gp).format('0,0')+'\n';
  tempObj.value += 'Char         : '+numeral(member.gpChar).format('0,0')+'\n';
  tempObj.value += 'Ship         : '+numeral(member.gpShip).format('0,0')+'\n';
  tempObj.value += '```'
  return tempObj
}
Cmds.getMemberGP = (member = {}, gpDeployed = 0)=>{
  return {
      name: member.name,
      gp: numeral(member.gp || 0).format('0,0'),
      gpChar: numeral(member.gpChar || 0).format('0,0'),
      gpShip: numeral(member.gpShip || 0).format('0,0'),
      gpDeployed: numeral(gpDeployed || 0).format('0,0'),
      gpNotDeployed: numeral( +(member.gp || 0) - +(gpDeployed || 0)).format('0,0')
   }
}
module.exports = Cmds
