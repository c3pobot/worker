'use strict'
const apiFetch = require('./apiFetch')
let apiStatus = false
const checkStatus = async()=>{
  try{
    let obj = await apiFetch('metadata')
    if(obj?.latestLocalizationBundleVersion){
      apiStatus = true
      console.log('game api is ready...')
    }else{
      console.log('game api is not ready...')
      setTimeout(checkStatus, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(checkStatus, 5000)
  }
}
checkStatus()
module.exports = ()=>{
  return apiStatus
}
