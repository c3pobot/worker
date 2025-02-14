'use strict'
const log = require('logger');
const mongo = require('mongoclient')
const { cmdMap } = require('src/helpers/cmdMap')
const { replyMsg } = require('src/helpers')
let Cmds = {}

const saveCmd = async(obj = {})=>{
  try{
    let type = 'chat'
    if(obj.type > 2) type = 'component'
    await mongo.set(`${type}BotCmd`, { _id: obj.id }, obj)
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj = {})=>{
  try{
    //await saveCmd(obj)    
    if(!obj?.cmd || !cmdMap || !cmdMap[obj.cmd]) return

    if(!obj.timestamp) obj.timestamp = Date.now()
    //if(!Cmds[obj.data.name]) cmds[obj.data.name] = require(`src/cmds/${obj.data.name}`)
    let msg2send = await cmdMap[obj.cmd](obj)
    if(msg2send && obj.token) await replyMsg(obj, msg2send)
  }catch(e){
    log.error(e)
  }
}
