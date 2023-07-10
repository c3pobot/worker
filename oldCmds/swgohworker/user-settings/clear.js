'use strict'
module.exports = async(obj={}, opt=[])=>{
  try{
    let msg2send = { content: 'Error clearing settings', components: null}, confirm
    if(obj.confirm?.response) confirm = obj.confirm.response
    let type = await HP.GetOptValue(opt, 'type', 'ga')
    if(!confirm){
      await HP.ConfirmButton(obj, 'Are you sure you want to clear you '+type+' user settings')
      return
    }
    if(confirm === 'no') msg2send.content = 'Command Canceled'
    if(confirm === 'yes'){
      if(obj.member.user.id) await mongo.set('discordId', {_id: obj.member.user.id}, {['settings.'+type]: null})
      msg2send.content = type+' user settings cleared'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
