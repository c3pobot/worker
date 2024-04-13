'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'Nothing was changed'}
    if(shard.enemyWatch && opt && opt.find(x=>x.name == 'confirm') && opt.find(x=>x.name == 'confirm').value == 'yes'){
      await mongo.unset('payoutServers', {_id: shard._id}, {enemyWatch: shard.enemyWatch})
      msg2send.content = 'Enemy group watch has been cleared'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
