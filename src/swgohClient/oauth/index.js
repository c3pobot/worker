'use strict'
const getIdentity = require('./getIdentity')
const apiFetch = require('swgohClient/routes/apiFetch')
const { ConfirmButton } = require('helpers')
const reAuthCodes = {
  4: 'SESSIONEXPIRED',
  5: 'AUTHFAILED',
  11: 'UNAUTHORIZED',
  51: 'FORCECLIENTRESTART',
  55: 'PRIORITYFORCECLIENTRESTART'
}
module.exports = async(uri, payload = {}, opts = {}, job = {})=>{
  try{
    let data, status = 'ok', forceNewIdentity = false, msg2send = 'Using this command will temporarly log you out of the game on your device.\n Are you sure you want to do this?'
    let loginConfirmed = job.confirm?.response
    if(loginConfirmed === 'no') return { msg2send: 'Command Canceled' }
    if(loginConfirmed === 'yes'){
      forceNewIdentity =  true
      loginConfirmed = 'no'
    }

    let identity = await getIdentity(opts.uId, opts.type, forceNewIdentity)
    if(identity?.error) return ({status: 'error', error: 'invalid_grant'})
    if(identity?.description) return({status: 'error', error: identity?.description})
    if(identity?.auth?.authId && identity?.auth?.authToken) data = await apiFetch(uri, payload, identity)
    if((!data || (data?.code && reAuthCodes[data?.code])) && loginConfirmed !== 'no'){
      await ConfirmButton(job, msg2send)
      return
    }
    if(data){
      if(data.code){
        return ({status: status, error: data})
      }else{
        return ({status: status, data: data})
      }
    }
  }catch(e){
    throw(e);
  }
}
