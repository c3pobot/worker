'use strict'
const mongo = require('mongoclient')
const { checkServerAdmin, getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkServerAdmin(obj)
  if(!auth) return { content: 'This command is only available to server admin\'s' }

  let pObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
  if(!pObj?.guildId) return { content: 'Error getting your guildId...' }

  let guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]

  let exists = await mongo.find('discordServer', { 'guilds.guildId': pObj.guildId })
  if(exists?.length > 0){
    for(let i in exists) await mongo.pull('discordServer', { _id: exists[i]._id }, { guilds: { guildId: pObj.guildId } })
  }
  if(guild?._id) await mongo.del('guilds', { _id: pObj.guildId })
  return { content: `${pObj.guildName} has been unlinked from all servers and removed from the db...` }
}
