'use strict'
const Cmds = {}
Cmds.oauth = require('./oauth')
Cmds.manual = require('./manual')
module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd = 'oauth'
    if(opt.find(x=>x.name == 'allycodes')) tempCmd = 'manual'
    await Cmds[tempCmd](obj, opt)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
