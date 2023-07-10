'use strict'
module.exports = async(obj, opt)=>{
  try{
    let tempCmd = 'all', tempDebug = 1
    if(opt && opt.find(x=>x.name == 'status')) tempDebug = opt.find(x=>x.name == 'status').value
    BotSocket.send('SetDebug', {tempCmd: tempCmd, debugMsg: tempDebug})
    HP.ReplyMsg(obj, {content: tempCmd+' debug has been turned '+(tempDebug > 0 ? 'on':'off')})
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
