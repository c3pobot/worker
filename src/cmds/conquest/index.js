'use strict'
const getData = require('./getData')
const Cmds = {}
Cmds.discs = require('./discs')
Cmds.feats = require('./feats')
Cmds.stamina = require('./stamina')
const { replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    if(obj.confirm?.response == 'no') return { content: 'command canceled...'}
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    let cqData = await getData(obj, opt)
    if(cqData === 'GETTING_CONFIRMATION') return
    if(cqData?.msg2send) return msg2send
    if(!cqData?.data) return { content: 'You must have you google or code auth linked to your discordId' }
    if(tempCmd) msg2send = await Cmds[tempCmd](obj, opt, cqData.data)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
