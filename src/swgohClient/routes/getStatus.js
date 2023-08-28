'use strict'
const log = require('logger')
const apiFetch = require('./apiFetch')
const GAME_API_NEEDED = process.env.GAME_API_NEEDED
let apiStatus = false
const checkStatus = async()=>{
  try{
    let obj = await apiFetch('metadata')
    if(obj?.latestLocalizationBundleVersion){
      apiStatus = true
      log.info('game api is ready...')
    }else{
      log.info('game api is not ready...')
      setTimeout(checkStatus, 5000)
    }
  }catch(e){
    log.info('game api is not ready...')
    setTimeout(checkStatus, 5000)
  }
}
if(GAME_API_NEEDED) checkStatus()
module.exports = ()=>{
  return apiStatus
}
