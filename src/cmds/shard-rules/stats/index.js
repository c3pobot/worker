'use strict'
const Cmds = {}
Cmds.show = require('./show')
Cmds.clear = require('./clear')
module.exports = async(obj, shard, opt = [])=>{
  try{
    let tempCmd = 'show'
    const auth = await HP.CheckShardAdmin(obj, shard)
    if(opt.find(x=>x.name == 'option')) tempCmd = opt.find(x=>x.name == 'option').value
    if(Cmds[tempCmd]){
      if(tempCmd == 'show' || auth){
        await Cmds[tempCmd](obj, shard, opt)
      }else{
        HP.ReplyMsg(obj, {content: 'This command requires Shard admin rights'})
      }
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }

  }catch(e){
    console.error(e)
    HP.ReplyError(e)
  }
}
