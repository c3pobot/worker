'use strict'
const mongo = require('mongoclient')
const { formatGAUnitBasic } = require('src/format')

module.exports = async(pObj = {}, eObj = {}, units = [], msg2send = { embeds = [] }, type)=>{
  let unitMsg = {
    color: 15844367,
    timestamp: new Date(eObj.updated),
    footer: {
      text: 'Data Updated'
    },
    title: `${type} units comparison`,
    description: `[${pObj.name}](https://swgoh.gg/p/${pObj.allyCode}/${type === 'Char' ? 'characters':'ships'}/) vs [${eObj.name}](https://swgoh.gg/p/${eObj.allyCode}/${type === 'Char' ? 'characters':'ships'}/)`,
    fields: []
  }
  let count = 0
  for(let i in units){
    let uInfo = (await mongo.find('units', {_id: units[i].baseId}))[0]
    if(uInfo){
      let pUnit = pObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
      let eUnit = eObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
      unitMsg.fields.push(formatGAUnitBasic(pUnit, eUnit, uInfo))
      count++
      if(((+i + 1) === units.length) && count < 20) count = 20
      if(count == 20){
        if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(unitMsg)))
        unitMsg.fields = []
        count = 0
      }
    }
  }
}
