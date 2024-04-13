'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let allyCode, msg2send = {content: 'There is not role watch for that player'}
    if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '')
    if(allyCode && shard.watch && shard.watch[allyCode]){
      await mongo.unset('payoutServers', {_id: shard._id}, {['watch.'+allyCode]:shard.watch[allyCode]})
      msg2send.content = 'Role watch for **'+allyCode+'** was removed'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
