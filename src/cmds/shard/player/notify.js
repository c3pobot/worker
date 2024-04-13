'use strict'
const { ShowNotifyStatus } = require('./helper')
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id or your allyCode has not been added to the shard'}
    let pObj = (await mongo.find('shardPlayers', {dId: obj.member.user.id, shardId: shard._id}))[0]
    if(!pObj){
      const dObj = await HP.GetDiscordAC(obj.member.user.id)
      if(dObj && dObj.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
    }
    if(pObj){
      msg2send.content = 'Error setting notify status'
      let tempNotify = {
        status: 0,
        method: 'log',
        startTime: 24,
        poMsg: 0,
        altStatus: 0
      }
      if(pObj && pObj.notify) tempNotify = pObj.notify
      if(opt && opt.find(x=>x.name == 'status')){
        if(opt.find(x=>x.name == 'status').value >= 0){
          tempNotify.status = opt.find(x=>x.name == 'status').value
        }else{
          tempNotify.status = 1
          tempNotify.method = opt.find(x=>x.name == 'status').value
        }
      }
      if(opt && opt.find(x=>x.name == 'hours')){
        if(opt.find(x=>x.name == 'hours').value > 0 && opt.find(x=>x.name == 'hours').value < 25) tempNotify.startTime = opt.find(x=>x.name == 'hours').value
      }
      if(opt && opt.find(x=>x.name == 'po')) tempNotify.poMsg = opt.find(x=>x.name == 'po').value
      if(opt && opt.find(x=>x.name == 'alt')) tempNotify.altStatus = opt.find(x=>x.name == 'alt').value
      await mongo.set('shardPlayers', {_id: pObj._id}, {notify: tempNotify})
      const embedMsg = await ShowNotifyStatus(shard, pObj._id)
      if(embedMsg){
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
