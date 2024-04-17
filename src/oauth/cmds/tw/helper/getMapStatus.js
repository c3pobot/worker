'use strict'
const swgohClient = require('src/swgohClient')
const { replyTokenError } = require('src/helpers')

module.exports = async(obj = {}, dObj = {}, loginConfirm)=>{
  let twData = await swgohClient.oauth(obj, 'getTerritoryMapStatus', dObj, { eventType: 8}, loginConfirm)
  if(twData === 'GETTING_CONFIRMATION') return twData
  if(twData?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return 'GETTING_CONFIRMATION';
  }
  if(twData?.data) return twData.data
  return twData
}
