'use strict'
const clientRoutes = require('./routes')
const oauth = require('./oauth')
const statCalc = require('statcalc')
module.exports = async(uri, payload = {}, identity = null, job = {})=>{
  try{
    if(uri === 'calcRosterStats') return await statCalc.calcRosterStats(payload)
    if(uri === 'setGameData') return await statCalc.setGameData(payload)
    if(identity) return await oauth(uri, payload, identity, job)
    if(clientRoutes[uri]) return await clientRoutes[uri](payload)
    return await clientRoutes.apiFetch(uri, payload)
  }catch(e){
    throw(e)
  }
}
