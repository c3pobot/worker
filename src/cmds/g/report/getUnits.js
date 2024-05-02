'use strict'
const mongo = require('mongoclient')

module.exports = async(units, type, gObj, msg2send = { embeds: []})=>{
  if(!units || units?.length == 0) return
  let count = 0, embeds = [], embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: `${gObj.name} ${type} Units`,
    fields: [],
    footer: {
      text: "Data Updated"
    }
  }
  for(let i in units){
    let uInfo = (await mongo.find('units', { _id: units[i] }, { nameKey: 1, baseId: 1, combatType: 1, skills: 1, ultimate: 1 }))[0]
    if(!uInfo?.baseId) continue
    let gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
      return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
    })
    embedMsg.fields.push(formatReportUnit(uInfo, gUnits, null))
    count++
    if((+i + 1) == units.length && count < 20) count = 20
    if(count == 20){
      if(msg2send.embeds.length < 10 && embedMsg?.fields) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      embedMsg.fields = []
      count = 0
    }
  }
}
