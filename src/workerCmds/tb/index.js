'use strict'
const log = require('logger')
const { ReplyError, ReplyMsg } = require('helpers')
const Cmds = {}
Cmds.gp = require('./gp')
Cmds.status = require('./status')
Cmds['platoons-missing'] = require('./platoons-missing')
Cmds.info = require('./info')
Cmds.platoons = require('./platoons')
Cmds['platoons-cache'] = require('./platoons-cache')
Cmds['platoons-export'] = require('./platoons-export')
Cmds['my-platoons'] = require('./my-platoons')
module.exports = async(obj)=>{
  try{
    let tempCmd, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opt)
    }else{
      ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    log.error(e)
    ReplyError(obj)
  }
}
