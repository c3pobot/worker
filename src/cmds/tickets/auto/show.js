'use strict'
const mongo = require('mongoclient')
const { show } = require('./helper')
const { getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Error getting player guild'}
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send
  msg2send.content = 'You do not have auto tickets set up'
  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild?.auto) return msg2send
  msg2send.content = 'Error getting settings'
  let embedMsg =  show({profile: {name: pObj.guildName}}, guild.auto)
  if(embedMsg){
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
