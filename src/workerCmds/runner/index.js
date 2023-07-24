'use strict'
const log = require('logger')
const Cmds = {}
Cmds.translate = require('./translate')
module.exports = async(obj = {})=>{
  try{
    if(Cmds[obj.type]) return await Cmds[obj.type](obj)
  }catch(e){
    log.error(e);
  }
}
