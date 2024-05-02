'use strict'
const Cmds = {}
Cmds.defense = require('./defense')
Cmds.payouts = require('./payouts')
Cmds.player = require('./player')
Cmds.p = require('./player')
Cmds.ranks = require('./ranks')
Cmds.status = require('./status')
const { getShard, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let shard = await getShard(obj)
    if(!shard) return { content: 'No payout shard was found for this channel category' }
    if(shard && !shard.status) return { content: 'Your payout server has been disabled' }

    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt)
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
