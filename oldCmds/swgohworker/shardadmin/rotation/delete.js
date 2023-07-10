'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, msg2send = {content: 'That was not a valid rotation schedule'}
    if(opt && opt.find(x=>x.name == 'schedule')) schedule = opt.find(x=>x.name == 'schedule').value.toUpperCase()
    const rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
    if(schedule && rots && rots[schedule]){
      await mongo.unset('shardRotations', {_id: shard._id}, {[schedule]: rots[schedule]})
      msg2send.content = '**'+schedule+'** rotation was deleted'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
