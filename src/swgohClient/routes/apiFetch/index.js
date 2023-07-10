'use strict'
const log = require('logger')
const POD_NAME = process.env.WORKER_NAME || 'botworker'
let GAME_CLIENT_URL = process.env.GAME_CLIENT_URL || 'http://localhost:3000'
GAME_CLIENT_URL = GAME_CLIENT_URL.replace('http:', 'ws:')

const SOCKET_EMIT_TIMEOUT = process.env.SOCKET_EMIT_TIMEOUT || 30000
const io = require('socket.io-client')
let socket = io(GAME_CLIENT_URL, {transports: ['websocket']}), notify = true
socket.on('connect', ()=>{
  if(notify){
    notify = false
    log.info(POD_NAME+' socket.io is connected to swgoh-client...')
  }else{
    log.debug(POD_NAME+' socket.io is connected to swgoh-client...')
  }

})
socket.on('disconnect', reason=>{
  log.debug('socket.io is diconnected from swgoh-client socket server...')
})
function socketCall(endpoint, data){
  return new Promise((resolve, reject)=>{
    try{
      if(!socket || !socket?.connected) reject('swgoh-client Socket Error: connection not available')
      socket.timeout(SOCKET_EMIT_TIMEOUT).emit('request', endpoint, data, function(err, res){
        if(err){
          log.error(err?.type)
          resolve({status: 400, message: {code: 999, message: `swgoh-client Socket Error: ${err.message || err}`}})
        }
        resolve(res)
      })
    }catch(e){
      reject(e);
    }
  })
}
const handleRequest = async(uri, payload, identity, retryCount = 0)=>{
  try{
    let req = { payload: payload, identity: identity }
    let res = await socketCall(uri, req)
    if(res?.data) return res.data
    if(res?.message?.code === 5)  return res.message
    /*
    if(res?.message?.code === 999 && retryCount < 10){
      return await handleRequest(uri, payload, identity, retryCount++)
    }
    */
    if(res?.message) log.error(res.message)
  }catch(e){
    throw(e)
  }
}
module.exports = async(uri, payload, identity)=>{
  try{
    return await handleRequest(uri, payload, identity)
  }catch(e){
    throw(e)
  }
}
