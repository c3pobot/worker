'use strict'
const Cmds = {}
Cmds.add = require('./add')
Cmds.discord = require('./discord')
Cmds.edit = require('./edit')
Cmds.find = require('./find')
Cmds.list = require('./list')
Cmds.import = require('./import')
Cmds.notify = require('./notify')
Cmds.remove = require('./remove')
Cmds.rotation = require('./rotation')
Cmds.status = require('./status')
Cmds.unwatch = require('./unwatch')
Cmds.watch = require('./watch')
module.exports = async(obj, shard, options)=>{
  try{
    let tempCmd, opts
    for(let i in options){
      if(Cmds[options[i].name]){
        tempCmd = options[i].name
        opts = options[i].options
        break;
      }
    }
    if(tempCmd){
      await Cmds[tempCmd](obj, shard, opts)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
