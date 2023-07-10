'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'Error getting player info'}, pObj
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode) pObj = await Client.post('getArenaPlayer', {allyCode: dObj.allyCode.toString()}, null)
    if(pObj){
      let tempNotify = {
        playerId: pObj.playerId,
        allyCode: pObj.allyCode,
        type: 0,
        notify:{
          status: 1,
          poNotify: 0,
          timeBeforePO: 24,
          method: 'dm',
          climb: 0
        }
      }
      const nObj = (await mongo.find('arena', {_id: pObj.playerId}, {_id:0, TTL:0}))[0]
      if(nObj) tempNotify = nObj
      tempNotify.dId = obj.member.user.id
      if(pObj.name) tempNotify.name = pObj.name
      if(opt){
        if(opt.find(x=>x.name == 'status')){
          if(opt.find(x=>x.name == 'status').value >= 0){
            tempNotify.notify.status = +opt.find(x=>x.name == 'status').value
          }else{
            tempNotify.notify.status = 1
            tempNotify.notify.method = opt.find(x=>x.name == 'status').value
          }
        }
        if(opt.find(x=>x.name == 'hours') && opt.find(x=>x.name == 'hours').value > 0) tempNotify.notify.timeBeforePO = opt.find(x=>x.name == 'hours').value
        if(opt.find(x=>x.name == 'po')) tempNotify.notify.poNotify = opt.find(x=>x.name == 'po').value
        if(opt.find(x=>x.name == 'climb')) tempNotify.notify.climb = opt.find(x=>x.name == 'climb').value
        if(opt.find(x=>x.name == 'type')) tempNotify.type = opt.find(x=>x.name == 'type').value
      }
      await mongo.set('arena', {_id: pObj.playerId}, tempNotify)
      const embedMsg = {
        color: 15844367,
        title: (tempNotify.name ? tempNotify.name+' ':'')+'Arena Notification Info',
        description: '```\n'
      }
      embedMsg.description += 'allyCode       : '+tempNotify.allyCode+'\n'
      embedMsg.description += 'Notifications  : '+(tempNotify.notify.status ? 'enabled':'disabled')+'\n'
      embedMsg.description += 'PO Notify      : '+(tempNotify.notify.poNotify ? 'enabled':'disabled')+'\n'
      embedMsg.description += 'Climb Notify   : '+(tempNotify.notify.climb ? 'enabled':'disabled')+'\n'
      embedMsg.description += 'Method         : '+tempNotify.notify.method+'\n'
      embedMsg.description += 'Time before PO : '+tempNotify.notify.timeBeforePO+'\n'
      embedMsg.description += 'Type           : '+(tempNotify.type > 0 ? (tempNotify.type === 1 ? 'Char':'Ship'):'Both')+'\n'
      embedMsg.description += '```'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
