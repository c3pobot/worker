'use strict'
const getData = require('./getData')

const Cmds = {}
Cmds.export = require('./export')
Cmds.unit = require('./unit')
Cmds.journey = require('./journey')
Cmds.squad = require('./squad')
Cmds['unequipped-mod-loadouts'] = require('./unequipped-mod-loadouts')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    if(obj.confirm?.response == 'no') return { content: 'command canceled...' }

    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}, msg2send = { content: 'command not recongnized' }
    let pObj = await getData(obj, opt)
    if(pObj === 'TOKEN_ERROR') return
    if(pObj === 'GETTING_CONFIRMATION') return
    if(pObj?.msg2send) return pObj.msg2send
    if(!pObj?.data) return { content: 'You must have you google or code auth linked to your discordId' }

    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, opt, pObj?.data)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
