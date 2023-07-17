'use strict'
const log = require('logger')
const { ReplyError } = require('helpers')
const Cmds = {}
Cmds.show = require('./show')
module.exports = async(obj = {})=>{
  try{
    let tempCmd = 'show'
    await Cmds[tempCmd](obj, obj.data.options)
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
