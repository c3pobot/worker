'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You must specify a @user'}, usr
    let dId = await HP.GetOptValue(opt, 'user')
    let crLimit = await HP.GetOptValue(opt, 'cr-limit', 100)
    let vipLevel = await HP.GetOptValue(opt, 'level', 1)
    if(dId){
      if(obj.data && obj.data.resolved){
        if(obj.data.resolved.members && obj.data.resolved.members[dId] && obj.data.resolved.members[dId].nick) usr = obj.data.resolved.members[dId].nick
        if(!usr && obj.data.resolved.users && obj.data.resolved.users[dId] && obj.data.resolved.users[dId].username) usr = obj.data.resolved.users[dId].username
      }
      msg2send.content = (usr ? '**@'+usr+'**':'that user')+' is already a vip member'
      const exists = (await mongo.find('vip', {_id: dId}))[0]
      if(!exists){
        await mongo.set('vip', {_id: dId}, {
          crLimit: +crLimit,
          status: 1,
          level: +vipLevel
        })
        msg2send.content = (usr ? '**@'+usr+'**':'User')+' was added as level **'+vipLevel+'** vip with cr limit of **'+crLimit+'**'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
