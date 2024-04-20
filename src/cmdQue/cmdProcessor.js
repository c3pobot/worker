'use strict'
const log = require('logger');
const { cmdMap } = require('src/helpers/cmdMap')
const { replyMsg } = require('src/helpers')
let Cmds = {}
module.exports = async(obj = {})=>{
  try{
    if(!obj?.data || !obj?.data?.name) return
    if(!obj.timestamp) obj.timestamp = Date.now()
    if(!cmdMap || !cmdMap[obj.data.name]) return
    //if(!Cmds[obj.data.name]) cmds[obj.data.name] = require(`src/cmds/${obj.data.name}`)
    let msg2send = await cmdMap[obj.data.name](obj)
    if(msg2send) await replyMsg(obj, msg2send)
  }catch(e){
    log.error(e)
  }
}
