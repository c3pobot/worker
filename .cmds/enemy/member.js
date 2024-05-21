'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const { getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have discordId linked to allyCode'}
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send

  let guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
  if(!guild?.enemy) return { content: 'You do not have an opponent guild registered'}

  let eObj = await swgohClient.post('fetchTWGuild', {token: obj.token, id: guild.enemy, projection: {name: 1, allyCode: 1}})
  if(!eObj?.member || eObj?.member?.length === 0) return { content: 'error getting opponent guild info' }

  let memberSorted = sorter([{column: 'name', order: 'ascending'}], eObj.member)
  msg2send.content = null
  msg2send.embeds = []
  const embedMsg = {
    color: 15844367,
    timestamp: new Date(eObj.updated),
    description: '```autohotkey\n'
  }
  let x = 0, count = 0
  for(let i in memberSorted){
    if(x == 0 && count == 0){
      embedMsg.title = eObj.name+' Members ('+memberSorted.length+')';
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
