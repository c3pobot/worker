'use strict'
const Cmds = {}
Cmds.speed = require('./speed')
const { replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    return { content: 'command still in progress i think...'}
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
