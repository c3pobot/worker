'use strict'
const Cmds = {}
Cmds['enemy-hits'] = require('./enemyHits')
Cmds['enemy-skips'] = require('./enemySkips')
Cmds['early-hits'] = require('./earlyHits')
Cmds.stats = require('./stats')
const { getShard, checkShardAdmin, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let shard = await getShard(obj)
    if(!shard) return { content: 'No payout shard was found for this channel category' }
    if(shard && !shard.status) return { content: 'Your payout server has been disabled' }
    let auth = await checkShardAdmin(obj, shard)
    let tempCmd = obj.subCmdGroup || obj.subCmd, opt = obj.data?.options || {}
    if(!tempCmd || !Cmds[tempCmd]) return { content: 'command not provided' }
    let msg2send = { content: 'This command requires Shard admin rights' }
    if(auth || tempCmd === 'stats') msg2send = await Cmds[tempCmd](obj, shard, opt, auth)
    return msg2send
  }catch(e){
    replyError(e)
    throw(e)
  }
}
