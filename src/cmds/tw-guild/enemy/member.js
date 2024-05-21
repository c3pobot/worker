'use strict'
const mongo = require('mongoclient')
const getGuild = require('../getGuild')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'You do not have your allycode linked to discord id' }

  let twStatus = (await mongo.find('twStatus', { _id: pObj.guildId }))[0]
  if(!twStatus.enemy) return { content: 'there is no opponent guild registerd' }

  let gObj = await getGuild(twStatus.enemy, [], { name: 1, allyCode: 1 })
  let memberSorted = sorter([{column: 'name', order: 'ascending'}], gObj?.member || [])
  if(!memberSorted || memberSorted?.length == 0) return { content: 'error getting away guild data' }
  let msg2send = { content: null, embeds: [] }
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    description: '```autohotkey\n'
  }
  let x = 0, count = 0
  for(let i in memberSorted){
    if(x == 0 && count == 0){
      embedMsg.title = gObj.name+' Members ('+memberSorted.length+')';
    }
    embedMsg.description += memberSorted[i].allyCode+' : '+memberSorted[i].name+'\n'
    count++
    if(((+i + 1) == +memberSorted.length) && count < 25) count = 25
    if(count == 25){
      x++;
      count = 0
      embedMsg.description += '```'
      msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      embedMsg.title = null
      embedMsg.description = '```autohotkey\n'
    }
  }
  return msg2send
}
