'use strict'
const { mongo } = require('helpers/mongo')
const deepCopy = require('./deepCopy')
const queryGuild = require('./queryGuild')
const getCacheGuild = async(opts = {})=>{
  try{
    let collection = opts.collection || 'guildCache'
    let res = (await mongo.find(collection, {_id: opts.guildId}, opts.project))[0]
    return res
  }catch(e){
    throw(e)
  }
}
const getNewGuild = async(opts = {})=>{
  try{
    let collection = opts.collection || 'guildCache'
    let res = await queryGuild(opts)
    if(res){
      res.updated = Date.now()
      res.id = res.profile.id
      res.name = res.profile.name
      res.member = res.member.filter(x=>x.memberLevel !== 1)
      let guildCopy = deepCopy(res)
      mongo.set(collection, {_id: res.id}, guildCopy)
      return res
    }
  }catch(e){
    throw(e);
  }
}
module.exports = async(opts = {})=>{
  try{
    let res = await getCacheGuild(opts)
    if(res) return res
    return await getNewGuild(opts)
  }catch(e){
    throw(e)
  }
}
