'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Nothing was changed'}
    let confirm = await HP.GetOptValue(opt, 'confirm')
    if(confirm === 'yes'){
      await mongo.del('reactions', {_id: obj.guild_id})
      msg2send.content = 'All Custom Reactions for this server have been cleared'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
