'use strict'
const getData = require('./getData')
const Cmds = {}
Cmds.discs = require('./discs')
Cmds.feats = require('./feats')
Cmds.stamina = require('./stamina')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let sendMsg = false, tempCmd, getCache = false, opt = [], msg2send = {content: 'You must have you google or guest auth linked to your discordId'}
    if(obj?.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    let cqData = await getData(obj, opt)
    if(cqData === 'GETTING_CONFIRMATION') return
    if(cqData?.msg2send) msg2send.content = cqData.msg2send
    if(!cqData?.data) return msg2send
    msg2send.content = 'command not found'
    if(tempCmd) msg2send = await Cmds[tempCmd](obj, opt, cqData.data)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
