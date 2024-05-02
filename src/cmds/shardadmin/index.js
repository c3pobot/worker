'use strict'
const Cmds = {}
Cmds.alias = require('./alias')
Cmds.channels = require('./channels')
Cmds.enemy = require('./enemy')
Cmds.prune = require('./prune')
Cmds.rotation = require('./rotation')
//Cmds.rules = require('./rules')
Cmds.settings = require('./settings')
Cmds.watch = require('./watch')
const { getShard, replyError, checkShardAdmin } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let shard = await getShard(obj)
    if(!shard) { content: 'No payout shard was found for this channel category' }
    if(shard && !shard.status) return { content: 'Your payout server has been disabled' }
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    let msg2send = { content: 'command not recongnized' }
    let auth = await checkShardAdmin(obj, shard)
    if(tempCmd && Cmds[tempCmd]) msg2send = await Cmds[tempCmd](obj, shard, opt, auth)
    return msg2send
  }catch(e){
    replyError(e)
    throw(e)
  }
}
