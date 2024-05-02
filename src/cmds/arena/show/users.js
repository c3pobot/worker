'use strict'
const log = require('logger')
const swgohClient = require('src/swgohClient')

const getPlayerName = async(allyCode)=>{
  try{
    if(!allyCode) return
    let pObj = await playerCache.get('playerCache', null, +allyCode, { _id: 1, allyCode: 1, name: 1, playerId: 1})
    if(!pObj) pObj = await swgohClient.post('playerArena', { allyCode: allyCode.toString() }, null)
    return pObj?.name
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  if(!patreon.users || patreon.users?.length == 0) return { content: 'you do not have any user set...'}

  let dataChange = false, embedMsg = {
    color: 15844367,
    title: `Aren synced players (${patreon.users.length})`,
    description: ''
  }
  if(patreon?.logChannel) embedMsg.description += `Log Channel : <#${patreon.logChannel}>\n`
  embedMsg.description += 'allyCode  : Name\n```\n'
  for(let i in patreon.users){
    if(!patreon.users[i].name){
      dataChange = true
      patreon.users[i].name = await getPlayerName(patreon.users[i].allyCode)
    }
    embedMsg.description += `${patreon.users[i].allyCode} : ${patreon.users[i].name}\n`
  }
  embedMsg.description += '```'
  if(dataChange) await mongo.set('patreon', { _id: patreon._id }, { users: patreon.users })
  return { content: null, embeds: [embedMsg] }
}
