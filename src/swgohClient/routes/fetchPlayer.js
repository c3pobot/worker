'use strict'
const { mongo } = require('helpers/mongo')
const getPlayer = require('./getPlayer')
const getNewPlayer = async(opts = {})=>{
  try{
    let collection = opts.collection || 'playerCache'
    let res = await getPlayer(opts)
    if(res){
      res.updated = Date.now()
      mongo.set(collection, {_id: res.playerId}, res)
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(opts = {})=>{
  try{
    let collection = opts.collection || 'playerCache'
    let query
    if(opts.allyCode) query = {allyCode: +opts.allyCode}
    if(opts.playerId) query = {_id: opts.playerId}
    if(!query) return
    let res = (await mongo.find(collection, query, opts.project))[0]
    if(!res) res = await getNewPlayer(opts)
    return res
  }catch(e){
    throw(e)
  }
}
