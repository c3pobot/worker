'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  let waitList = (await mongo.find('guildWaitList', { _id: pObj.guildId }))[0]
  if(!waitList || waitList?.players?.length === 0) return { content: `${pObj.guildName} has no players on the waitlist` }

  let embedMsg = { color: 15844367, title: waitList.name+' waitlist ('+waitList?.players?.length+')', description: '' }
  for(let i in waitList.players){
    embedMsg.description += `${waitList.players[i].allyCode} : [${waitList.players[i].name}](https://swgoh.gg/p/${waitList.players[i].allyCode})\n`
  }
  return { content: null, embeds: [embedMsg] }
}
