'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let dId, status, msg2send = {content: 'You must specify a @user or discordid'}, usr, deleteConfirm
    let dId = await HP.GetOptValue(opt, 'user')
    if(!dId) dId = await HP.GetOptValue(opt, 'discordid')
    if(obj.confirm?.response) deleteConfirm = obj.confirm.response
    if(dId){
      if(obj.data && obj.data.resolved){
        if(obj.data.resolved.members && obj.data.resolved.members[dId] && obj.data.resolved.members[dId].nick) usr = obj.data.resolved.members[dId].nick
        if(!usr && obj.data.resolved.users && obj.data.resolved.users[dId] && obj.data.resolved.users[dId].username) usr = obj.data.resolved.users[dId].username
      }
      if(!deleteConfirm){
        await HP.ConfirmButton(obj, 'Are you sure you want to remove vip member '+(usr ? '**@'+usr+'**':'with discord Id **'+dId+'**')+'?')
        return
      }else{
        msg2send.components = null
        if(deleteConfirm == 'yes'){
          await mongo.del('vip', {_id: dId})
          msg2send.content = (usr ? '**@'+usr+'**':'User with discord id **'+dId+'**')+' was removed as a vip member'
        }else{
          msg2send.content = 'Command canceled'
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
