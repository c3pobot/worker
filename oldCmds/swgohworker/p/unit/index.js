'use strict'
const Cmds = {}
Cmds.basic = require('./basic')
Cmds.compare = require('./compare')
module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd = 'basic'
    if(opt.filter(x=>x.name === 'gear' || x.name === 'rarity').length > 0) tempCmd = 'compare'
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
