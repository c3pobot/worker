'use strict'
const getData = require('./getData')
const Cmds = {}
Cmds.unit = require('./unit')
Cmds.journey = require('./journey')

const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let sendMsg = true, tempCmd, opt = [], msg2send = {content: 'command not found'}
    if(obj.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    let pObj = await GetData(obj, opt)
    if(pObj === 'GETTING_CONFIRMATION') return
    if(pObj?.msg2send) msg2send.content = cqData.msg2send
    if(!pObj?.data) return msg2send
    msg2send.content = 'command not found'
    if(tempCmd) msg2send = await Cmds[tempCmd](obj, opt, pObj.data)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
