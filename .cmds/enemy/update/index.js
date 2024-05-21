'use strict'
const Cmds = {}
Cmds.manual = require('./manual')
Cmds.oauth = require('./oauth')
module.exports = async(obj = {}, opt = [])=>{
  let tempCmd = 'oauth'
  if(opt.find(x=>x.name == 'allycode')) tempCmd = 'manual'
  return await Cmds[tempCmd](obj, opt)
}
