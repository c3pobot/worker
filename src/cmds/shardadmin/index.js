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
    let msg2send = { content: 'No payout shard was found for this channel category' }
    if(shard && !shard.status) return { content: 'Your payout server has been disabled' }
    if(shard?.status){
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
      msg2send = {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')}
      if(tempCmd){
        let auth = await checkShardAdmin(obj, shard)
        msg2send = await Cmds[tempCmd](obj, shard, opt, auth)
      }
    }
    return msg2send
  }catch(e){
    replyError(e)
    throw(e)
  }
}
