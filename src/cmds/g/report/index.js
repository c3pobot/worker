'use strict'
const mongo = require('mongoclient')
const { getGuildId, fetchGuild, getOptValue, getPlayerAC } = require('src/helpers')
const sorter = require('json-array-sorter')
const { formatReportGP, formatReportGuild, formatTWRecord, formatReportUnit } = require('src/format')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allyCode linked to discordId'}, guildId, pObj, gObj, charUnits = [], shipUnits = [], glUnits = []

  let includeUnits = getOptValue(opt, 'units', false)
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  if(allyObj?.allyCode) allyCode = allyObj.allyCode
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(allyCode){
    msg2send.content = '**'+allyCode+'** is not a valid allyCode'
    pObj = await getGuildId({}, {allyCode: allyCode}, opt)
    guildId = pObj?.guildId
  }
  if(guildId){
    msg2send.content = 'Error getting guild info'
    gObj = await fetchGuild({token: obj.token, id: guildId, projection: HP.dbProjection.guildReport})
  }
  if(gObj){
    let tempGl = (await mongo.find('factions', {_id: 'galactic_legend'}))[0]
    if(tempGl?.units) glUnits = tempGl.units
    let guild = (await mongo.find('guilds', {_id: guildId}))[0]
    if(!guild) guild = {units: []}
    if(guild.units && guild.units.filter(x=>x.combatType == 1).length > 0) charUnits = sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 1))
    if(guild.units && guild.units.filter(x=>x.combatType == 2).length > 0) shipUnits = sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 2))
    msg2send.content = null
    msg2send.embeds = []
    let baseMsg = {
      color: 15844367,
      timestamp: new Date(gObj.updated),
      title: 'Guild Report for '+gObj.name+' ('+gObj.member.length+')',
      fields: [],
      footer: {
        text: "Data Updated"
      }
    }
    baseMsg.fields.push(formatReportGP(gObj, null));
    baseMsg.fields.push(formatReportGuild(glUnits, gObj, null));
    baseMsg.fields.push(formatTWRecord(gObj.recentTerritoryWarResult, null));
    msg2send.embeds.push(baseMsg)
    if(includeUnits){
      if(glUnits.length > 0){
        let glMsg = {
          color: 15844367,
          timestamp: new Date(gObj.updated),
          title: gObj.name+' Char units',
          fields: [],
          footer: {
            text: "Data Updated"
          }
        }
        let count = 0
        for(let i in glUnits){
          let uInfo = (await mongo.find('units', {_id: glUnits[i]}, {thumbnail: 0, portrait: 0}))[0]
          if(uInfo){
            let gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
              return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
            })
            glMsg.fields.push(formatReportUnit(uInfo, gUnits, null))
            count++
          }
          if((+i + 1) == glUnits.length && count < 20) count = 20
          if(count == 20){
            if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(glMsg)))
            glMsg.fields = []
            count = 0
          }
        }
      }
      if(charUnits.length > 0){
        let charMsg = {
          color: 15844367,
          timestamp: new Date(gObj.updated),
          title: gObj.name+' Char units',
          fields: [],
          footer: {
            text: "Data Updated"
          }
        }
        let count = 0
        for(let i in charUnits){
          if(glUnits.filter(x=>x == charUnits[i].baseId).length == 0){
            let uInfo = (await mongo.find('units', {_id: charUnits[i].baseId}, {thumbnail: 0, portrait: 0}))[0]
            if(uInfo){
              let gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
                return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
              })
              charMsg.fields.push(formatReportUnit(uInfo, gUnits, null))
              count++
            }
          }
          if((+i + 1) == charUnits.length && count < 20) count = 20
          if(count == 20){
            if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(charMsg)))
            charMsg.fields = []
            count = 0
          }
        }
      }
      if(shipUnits.length > 0){
        let shipMsg = {
          color: 15844367,
          timestamp: new Date(gObj.updated),
          title: gObj.name+' Ship units',
          fields: [],
          footer: {
            text: "Data Updated"
          }
        }
        let count = 0
        for(let i in shipUnits){
          if(glUnits.filter(x=>x == shipUnits[i].baseId).length == 0){
            let uInfo = (await mongo.find('units', {_id: shipUnits[i].baseId}, {thumbnail: 0, portrait: 0}))[0]
            if(uInfo){
              let gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
                return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
              })
              shipMsg.fields.push(await FT.FormatReportUnit(uInfo, gUnits, null))
              count++
            }
          }
          if((+i + 1) == shipUnits.length && count < 20) count = 20
          if(count == 20){
            if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(shipMsg)))
            shipMsg.fields = []
            count = 0
          }
        }
      }
    }
  }
  return msg2send
}
