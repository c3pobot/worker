'use strict'
const Cmds = {}
Cmds.gp = require('./gp')
Cmds.status = require('./status')
Cmds.info = require('./info')
Cmds.platoons = require('./platoons')
Cmds['platoons-cache'] = require('./platoons-cache')
Cmds['platoons-export'] = require('./platoons-export')
Cmds['my-platoons'] = require('./my-platoons')
const { replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
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
    let msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
