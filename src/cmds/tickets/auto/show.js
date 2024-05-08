'use strict'
const mongo = require('mongoclient')
const { show } = require('./helper')
const { getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting player guild' }

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
  if(!guild?.auto) return { content: 'You do not have auto tickets set up' }

  let embedMsg =  show({profile: {name: pObj.guildName}}, guild.auto)
  if(embedMsg) return { content: null, embeds: [embedMsg] }
  return { content: 'Error getting settings' }
}
