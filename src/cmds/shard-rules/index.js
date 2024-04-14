'use strict'
const Cmds = {}
Cmds['enemy-hits'] = require('./enemyHits')
Cmds['enemy-skips'] = require('./enemySkips')
Cmds['early-hits'] = require('./earlyHits')
Cmds.stats = require('./stats')
const { getShardm checkShardAdmin, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let shard = await getShard(obj)
    let msg2send = {content: 'No payout shard was found for this channel category'}
    if(shard && !shard.status) msg2send.content = 'Your payout server has been disabled'
    if(shard?.status){
      let auth = await checkShardAdmin(obj, shard)
      let tempCmd, opt = []
      if(obj.data && obj.data.options){
        for(let i in obj.data.options){
          if(Cmds[obj.data.options[i].name]){
            tempCmd = obj.data.options[i].name
            if(obj.data.options[i].options) opt = obj.data.options[i].options
            break;
          }
        }
      }
      if(!tempCmd){
        await replyMsg({ content: 'command not provided'})
        return
      }
      msg2send.content = 'This command requires Shard admin rights'
      if(auth || tempCmd === 'stats') msg2send = await Cmds[tempCmd](obj, shard, opt, auth)
    }
    return msg2send
  }catch(e){
    replyError(e)
    throw(e)
  }
}
