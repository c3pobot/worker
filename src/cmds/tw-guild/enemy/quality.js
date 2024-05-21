'use strict'
const mongo = require('mongoclient')
const getGuild = require('../getGuild')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getGuildId, replyButton } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You do not have your allycode linked to discord id' }

  let twStatus = (await mongo.find('twStatus', { _id: pObj.guildId }))[0]
  if(!twStatus?.enemy) return { content: 'there is no opponent guild registerd' }

  let gObj = await getGuild(twStatus.enemy, [], { playerId: 1, name: 1, quality: 1 })
  if(!gObj?.member) return { content: 'error getting away guild data' }

  let unsortedArray = []
  let guildTotal = { mods: 0, gear: 0, total: 0, top: 0 }
  for(let i in gObj.member){
    if(!gObj.member[i].quality) continue
    let tempObj = gObj.member[i].quality
    tempObj.name = gObj.member[i].name
    tempObj.total = tempObj.mods + tempObj.gear
    guildTotal.mods += (gObj.member[i].quality.mods || 0)
    guildTotal.gear += (gObj.member[i].quality.gear || 0)
    guildTotal.total += (tempObj.mods + tempObj.gear || 0)
    guildTotal.top += (gObj.member[i].quality.top || 0)
    unsortedArray.push(tempObj)
  }
  let sortedArray = sorter([{column: 'mods', order: 'descending'}], unsortedArray)
  if(!sortedArray || sortedArray?.length == 0) return { content: 'error calcuating data' }

  let msg2send = { content: null, embeds: [] }
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    description: '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
  }
  embedMsg.description += numeral(guildTotal.mods / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.gear / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.total / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
  let x = 0, count = 0
  for(let m in sortedArray){
    if(x == 0 && count == 0){
      embedMsg.title = gObj.name+' Roster Quality ('+gObj.member.length+')';
    }
    let modQuality = numeral(sortedArray[m].mods).format('0.00')
    let gearQuality = numeral(sortedArray[m].gear).format('0.00')
    let totalQuality = numeral(sortedArray[m].total).format('0.00')
    let top80Quality = numeral(sortedArray[m].top).format('0.00')
    embedMsg.description += (modQuality.length > 4 ? modQuality.substring(0,4):modQuality)+' : '+(gearQuality.length > 4 ? gearQuality.substring(0,4):gearQuality)+' : '+(totalQuality.length > 4 ? totalQuality.substring(0,4):totalQuality)+' : '+(top80Quality.length > 4 ? top80Quality.substring(0,4):top80Quality)+' : '+(sortedArray[m].name.length > 10 ? sortedArray[m].name.substring(0, 10):sortedArray[m].name)+'\n'
    count++
    if(((+m + 1) == +sortedArray.length) && count < 25) count = 25
    if(count == 25){
      x++;
      count = 0
      embedMsg.description += '```'
      msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      embedMsg.title = null
      embedMsg.description = '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
      embedMsg.description += numeral(guildTotal.mods / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.gear / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.total / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
    }
  }
  return msg2send
}
