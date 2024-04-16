'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')
const projection = require('./dbProjection')
const { getOptValue, getGuildId, calcGuildStats, guildReport, getFaction, getUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your allycode linked to discord id'}, glUnits = []
  let includeUnits = getOptValue(opt, 'units', true)

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj.guildId) return msg2send

  let twStatus = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
  let joined = twStatus?.joined?.map(x=>x.playerId) || []
  let enemyId = twStatus?.enemy
  if(!enemyId) return { content: 'There is no opponent guild registered' }

  let charUnits = [], shipUnits = []
  if(includeUnits){
    let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
    if(guild?.units?.length > 0){
      charUnits = guild.units.filter(x=>x.combatType === 1) || []
      shipUnits = guild.units.filter(x=>x.combatType === 2) || []
    }
  }
  if(charUnits?.length > 0) charUnits = sorter([{column: 'nameKey', order: 'ascending'}], charUnits)
  if(shipUnits?.length > 0) shipUnits = sorter([{column: 'nameKey', order: 'ascending'}], shipUnits)
  await replyButton(obj, 'Getting guild data...')
  let [ gObj, eObj] = await Promise.all([
    swgohClient.post('fetchTWGuild', { id: pObj.guildId, projection: projection })
    swgohClient.post('fetchTWGuild', { id: enemyId, projection: projection})
  ])

  if(!gObj?.member || !eObj?.member) return { content: 'Error getting guild data...'}

  if(joined?.length > 0) gObj.member = gObj.member.filter(x=>joined.includes(x.playerId))
  calcGuildStats(gObj, gObj.member)

  msg2send.content = null
  msg2send.embeds = []
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: 'Guild Report',
    description: '['+gObj.name+'](https://swgoh.gg/g/'+gObj.id+'/) ('+gObj.member.length+') vs ['+eObj.name+'](https://swgoh.gg/g/'+eObj.id+'/) ('+eObj.member.length+')',
    fields: [],
    footer: {
      text: "Data Updated"
    }
  }
  await replyButton(obj, 'Starting the report creation...')
  let repotGP = guildReport.getGP(gObj, eObj)
  let overView = guildReport.getOverview(glUnits, gObj, eObj)
  let twRecord = guildReport.getTWRecord(gObj.recentTerritoryWarResult, eObj.recentTerritoryWarResult)
  if(repotGP?.name) embedMsg.fields.push(repotGP)
  if(overView?.name) embedMsg.fields.push(overView)
  if(twRecord?.name) embedMsg.fields.push(twRecord)
  msg2send.embeds.push(embedMsg)
  if(includeUnits){
    let tempGL = await getFaction('galactic_legend', true)
    if(tempGL?.units?.length > 0) glUnits = sorter([{column: 'nameKey', order: 'ascending'}], tempGL.units)
    if(glUnits.length > 0){
      let glMsg = {
        color: 15844367,
        timestamp: new Date(gObj.updated),
        title: 'TW Galactic Legend units',
        fields: [],
        footer: {
          text: "Data Updated"
        }
      }
      let count = 0
      await replyButton(obj, 'Adding GL units to the report ...')
      for(let i in glUnits){
        let uInfo = glUnits[i]
        if(uInfo){
          let tempUnit = guildReport.getUnit(uInfo, gObj.member, eObj.member)
          if(tempUnit){
            glMsg.fields.push(tempUnit)
            count++;
          }
        }
        if((+i + 1) == glUnits.length && count < 20) count = 20
        if(count == 20){
          if(msg2send.embeds.length < 10 && glMsg.fields.length > 0) msg2send.embeds.push(JSON.parse(JSON.stringify(glMsg)))
          glMsg.fields = []
          count = 0
        }
      }
    }
  }
  if(includeUnits && charUnits.length > 0){
    await replyButton(obj, 'Adding character units to the report ...')
    let charMsg = {
      color: 15844367,
      timestamp: new Date(gObj.updated),
      title: 'TW Char units',
      fields: [],
      footer: {
        text: "Data Updated"
      }
    }
    let count = 0
    for(let i in charUnits){
      if(glUnits.filter(x=>x.baseId == charUnits[i].baseId).length == 0){
        let uInfo = await getUnit(charUnits[i].baseId, false, false)
        if(uInfo){
          let tempUnit = guildReport.getUnit(uInfo, gObj.member, eObj.member)
          if(tempUnit){
            charMsg.fields.push(tempUnit)
            count++;
          }
        }
      }
      if((+i + 1) == charUnits.length && count < 20) count = 20
      if(count == 20){
        if(msg2send.embeds.length < 10 && charMsg.fields.length > 0) msg2send.embeds.push(JSON.parse(JSON.stringify(charMsg)))
        charMsg.fields = []
        count = 0
      }
    }
  }

  if(includeUnits && shipUnits.length > 0){
    await replyButton(obj, 'Adding ship units to the report ...')
    let shipMsg = {
      color: 15844367,
      timestamp: new Date(gObj.updated),
      title: 'TW Ship units',
      fields: [],
      footer: {
        text: "Data Updated"
      }
    }
    let count = 0
    for(let i in shipUnits){
      if(glUnits.filter(x=>x.baseId == shipUnits[i].baseId).length == 0){
        let uInfo = await getUnit(shipUnits[i].baseId, false, false)
        if(uInfo){
          let tempUnit = guildReport.getUnit(uInfo, gObj.member, eObj.member)
          if(tempUnit){
            shipMsg.fields.push(tempUnit)
            count++;
          }
        }
      }
      if((+i + 1) == shipUnits.length && count < 20) count = 20
      if(count == 20){
        if(msg2send.embeds.length < 10 && shipMsg.fields.length > 0) msg2send.embeds.push(JSON.parse(JSON.stringify(shipMsg)))
        shipMsg.fields = []
        count = 0
      }
    }
  }
  return msg2send
}
