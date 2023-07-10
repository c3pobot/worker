'use strict'
const log = require('logger')
const apiFetch = require('./apiFetch')
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
checkStatus()
module.exports = ()=>{
  return apiStatus
}
