'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'Nothing was changed'}
    if(shard.watch && opt && opt.find(x=>x.name == 'confirm') && opt.find(x=>x.name == 'confirm').value == 'yes'){
      await mongo.unset('payoutServers', {_id: shard._id}, {watch: shard.watch})
      msg2send.content = 'All Role watches have been cleared'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
