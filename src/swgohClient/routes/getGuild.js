'use strict'
const { mongo } = require('helpers/mongo')
const queryGuild = require('./queryGuild')
const getNewGuild = async(opts = {})=>{
  try{
    let guild = await queryGuild(opts)
    if(guild){
      guild.updated = Date.now()
      guild.id = guild.profile.id
      guild.name = guild.profile.name
      mongo.set(opts.collection, {_id: opts.guildId}, JSON.parse(JSON.stringify(guild)))
    }
    return guild
  }catch(e){
    throw(e);
  }
}
module.exports = async(opts = {})=>{
  try{
    let collection = opts.collection || 'guildCache'
    let guild = (await mongo.find(collection, {_id: opts.guildId}, opts.project))[0]
    if(!guild?.profile) guild = await getNewGuild({guildId: opts.guildId, includeActivity: true, collection: collection})
    return guild
  }catch(e){
    throw(e)
  }
}
