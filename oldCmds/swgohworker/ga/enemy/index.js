'use strict'
const Cmds = {}
Cmds.clear = require('./clear')
Cmds.change = require('./change')
Cmds['faction-basic'] = require('./factionbasic')
Cmds['faction-stats'] = require('./factionstats')
Cmds.history = require('./history')
Cmds.show = require('./show')
Cmds.unit = require('./unit')
Cmds.update = require('./update')
module.exports = async(obj, opts = [])=>{
  try{
    let tempCmd, opt = []
    for(let i in opts){
      if(Cmds[opts[i].name]){
        tempCmd = opts[i].name
        if(opts[i].options) opt = opts[i].options;
        break;
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: 'command not recongnized'})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
