'use strict'
const Cmds = {}
Cmds.export = require('./export')
Cmds.gp = require('./gp')
Cmds.status = require('./status')
Cmds.history = require('./history')
Cmds.info = require('./info')
Cmds.platoons = require('./platoons')
Cmds['platoons-cache'] = require('./platoons-cache')
Cmds['platoons-export'] = require('./platoons-export')
Cmds['platoons-missing'] = require('./platoons-missing')
Cmds['my-platoons'] = require('./my-platoons')
Cmds['special-mission'] = require('./special-mission')
const { replyError } = require('src/helpers')
module.exports = async(obj = {})=>{
  try{
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}, msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
