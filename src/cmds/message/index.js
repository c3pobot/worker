'use strict'
module.exports = async(obj = {})=>{
  try{
    const auth = await HP.CheckServerAdmin(obj)
    if(auth){
      let channelPerm = 0, msg2send = {content: 'You did not provide the correct information'}
      let chId = await HP.GetOptValue(obj.data?.options, 'channel')
      let msg = await HP.GetOptValue(obj.data?.options, 'message')
      let usr = await HP.GetOptValue(obj.data?.options, 'user')
      if(msg && usr) msg = msg.replace(/%user%/g, '<@'+usr+'>')
      if(msg && chId){
        msg2send.content = 'Error sending message to <#'+chId+'>'
        const status = await HP.SendMsg({sId: obj.guild_id, chId: chId}, {content: msg})
        if(status?.status === 'ok'){
          msg2send.content = 'Messages successfully sent to <#'+chId+'>'
        }else{
          if(status?.msg) msg2send.content = status.msg
        }
      }
      HP.ReplyMsg(obj, msg2send)
    }else{
      HP.AdminNotAuth(obj)
    }
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
