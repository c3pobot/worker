'use strict'
const { ForceMessage } = require('./helper')
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, msg2send = {content: 'Rotation schedule not found'}
    const rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
    if(opt && opt.find(x=>x.name == 'schedule')) schedule = opt.find(x=>x.name == 'schedule').value.toUpperCase()
    if(rots && schedule && rots[schedule]){
      msg2send.content = 'po offSet is not set for **'+schedule+'**'
      if(rots[schedule]){
        await ForceMessage(rots[schedule])
        msg2send.content = 'Sent message to <#'+rots[schedule].chId+'>'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
