'use strict'
const getPlayer = require('./getPlayer')
const getCachedPlayer = async(opts = {})=>{
  try{
    let collection = opts.collection || 'playerCache'
    let query
    if(opts.allyCode) query = {allyCode: +opts.allyCode}
    if(opts.playerId) query = {_id: opts.playerId}
    if(!query) return
    let res = (await mongo.find(collection, query, opts.project))[0]
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(opts = {})=>{
  try{
    let res = await getCachedPlayer(opts)
    if(res) return res
    return await getPlayer(opts)
  }catch(e){
    throw(e)
  }
}
