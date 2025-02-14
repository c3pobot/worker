'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const { cmdMap } = require('src/helpers/cmdMap')
const { replyMsg } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    if(!obj?.cmd || !cmdMap || !cmdMap[obj.cmd]) return

    if(!obj.timestamp) obj.timestamp = Date.now()
    mongo.set('cmdMsgCache', { _id: obj.id }, obj)
    let msg2send = await cmdMap[obj.cmd](obj)
    if(msg2send && obj.token) await replyMsg(obj, msg2send)
  }catch(e){
    log.error(e)
  }
}
