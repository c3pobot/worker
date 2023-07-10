'use strict'

module.exports = async(obj = {}, opt= [])=>{
  try{
    let msg2send = {content: 'Nothing was done'}, dObj
    let confirm = HP.GetOptValue(opt, 'confirm')
    if(confirm){
      msg2send.content = 'You do not have allyCode linked to discord Id'
      dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    }
    if(dObj?.allyCode){
      msg2send.content = 'Your GA Hist image cache was cleared\nNote: it will take longer to pull images now.'
      mongo.delMany('gaHistImg', {allyCode: +dObj.allyCode})
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
