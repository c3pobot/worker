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
    let msg2send = {content: 'No payout shard was found for this channel category'}
    if(shard && !shard.status) msg2send.content = 'Your payout server has been disabled'
    if(shard?.status){
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
      msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
      if(tempCmd) msg2send = await Cmds[tempCmd](obj, shard, opt)
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
