'use strict'
const Cmds = {}
Cmds['3v3'] = '3v3'
Cmds['5v5'] = '5v5'
const counter = require('./counter')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let mode, opt = [], msg2send = {content: 'command not recongnized'}
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          mode = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
          break;
        }
      }
    }
    if(mode) msg2send = await counter(obj, opt, mode)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
