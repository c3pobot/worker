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
    if(tempCmd){
      await Cmds[tempCmd](obj, shard, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }else{
    if(shard){
      HP.ReplyMsg(obj, {content: 'Your payout server has been disabled'})
    }else{
      HP.ReplyMsg(obj, {content: 'No payout shard was found for this channel category'})
    }
  }
}
