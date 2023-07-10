'use strict'
const log = require('logger')
const POD_NAME = process.env.WORKER_NAME || 'botworker'
const BOT_BRIDGE_URI = process.env.BOT_BRIDGE_URI
const SOCKET_EMIT_TIMEOUT = process.env.SOCKET_EMIT_TIMEOUT || 10000
const io = require('socket.io-client')
let socket = io(BOT_BRIDGE_URI, {transports: ['websocket']}), notify = true
socket.on('connect', ()=>{
  if(notify){
    notify = false
    log.info(POD_NAME+' socket.io is connected to bot bridge...')
  }else{
    log.debug(POD_NAME+' socket.io is connected to bot bridge...')
  }
})
socket.on('disconnect', (reason)=>{
  log.debug(POD_NAME+' socket.io is disconnected from bot bridge because of '+reason)
})
const SocketEmit = ( cmd, obj = {} )=>{
  return new Promise((resolve, reject)=>{
    try{
      if(!socket || !socket?.connected) reject('Socket Error: connection not available')
      socket.timeout(SOCKET_EMIT_TIMEOUT).emit('request', cmd, obj, (err, res)=>{
        if(err) reject(`Socket Error: ${err.message || err}`)
        resolve(res)
      })
    }catch(e){
      reject(e.message)
    }
  })
}
module.exports.call = SocketEmit
