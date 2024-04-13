'use strict'
const Cmds = {}
Cmds.defense = require('./defense')
Cmds.payouts = require('./payouts')
Cmds.player = require('./player')
Cmds.p = require('./player')
Cmds.ranks = require('./ranks')
Cmds.status = require('./status')
module.exports = async(obj)=>{
  try{
    const shard = await HP.GetShard(obj)
    if(shard && shard.status){
      let tempCmd, opt
      if(obj.data && obj.data.options){
        for(let i in obj.data.options){
          if(Cmds[obj.data.options[i].name]){
            tempCmd = obj.data.options[i].name
            opt = obj.data.options[i].options
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
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
