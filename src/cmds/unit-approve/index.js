'use strict'
const log = require('logger')
const Cmds = {}
Cmds.portrait = require('./portrait')
module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.confirm || {}
    if(tempCmd && Cmds[tempCmd]) return await Cmds[tempCmd](obj, opt)
  }catch(e){
    log.error(e)
  }
}
