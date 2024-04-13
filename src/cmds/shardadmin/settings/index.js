'use strict'
const Cmds = {}
Cmds['admin-messages'] = require('./adminMessages')
Cmds.general = require('./general')
Cmds.payouts = require('./payouts')
Cmds.ranks = require('./ranks')
module.exports = async(obj, shard, options = [])=>{
  try{
    const auth = await HP.CheckShardAdmin(obj, shard)
    let tempCmd, opt
    for(let i in options){
      if(Cmds[options[i].name]){
        tempCmd = options[i].name
        if(options[i].options) opt = options[i].options
        break;
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      if(tempCmd == 'show' || auth){
        await Cmds[tempCmd](obj, shard, opt)
      }else{
        HP.ReplyMsg(obj, {content: 'This command require Shard admin rights'})
      }
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
