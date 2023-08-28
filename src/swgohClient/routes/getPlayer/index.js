'use strict'
const mongo = require('mongoclient')
const queryPlayer = require('../queryPlayer')
const statCalc = require('statcalc')
const formatPlayer = require('./formatPlayer')
module.exports = async(opts = {})=>{
  try{
    let collection = opts.collection || 'playerCache', stats
    let res = await queryPlayer(opts)
    if(res?.rosterUnit) stats = await statCalc.calcRosterStats(res.rosterUnit)
    if(stats){
      res.updated = Date.now()
      res = await formatPlayer(res, stats)
      mongo.set(collection, {_id: res.playerId}, res)
      return res
    }
  }catch(e){
    throw(e)
  }
}
