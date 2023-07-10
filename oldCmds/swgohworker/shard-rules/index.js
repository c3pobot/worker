'use strict'
const Cmds = {}
Cmds['enemy-hits'] = require('./enemyHits')
Cmds['enemy-skips'] = require('./enemySkips')
Cmds['early-hits'] = require('./earlyHits')
Cmds.stats = require('./stats')
module.exports = async(obj)=>{
  const shard = await HP.GetShard(obj)
  if(shard && shard.status){
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
    const auth = await HP.CheckShardAdmin(obj, shard)
    if(auth || tempCmd == 'stats'){
      if(tempCmd){
        await Cmds[tempCmd](obj, shard, opt)
      }else{
        HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
      }
    }else{
      HP.ReplyMsg(obj, {content: 'This command requires Shard admin rights'})
    }
  }else{
    if(shard){
      HP.ReplyMsg(obj, {content: 'Your payout server has been disabled'})
    }else{
      HP.ReplyMsg(obj, {content: 'No payout shard was found for this channel category'})
    }
  }
}
