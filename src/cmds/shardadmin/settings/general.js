'use strict'
const mongo = require('mongoclient')
const { getOptValue } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'You did not provide any settings to change'}
  let adminAdd = getOptValue(opt, 'admin-add')
  let adminRemove = getOptValue(opt, 'admin-remove')
  let adminMsg = getOptValue(opt, 'message')
  let adminModify = getOptValue(opt, 'modify')
  if(opt.length > 0){
    msg2send.content = ''
    if(adminAdd && obj.data?.resolved?.roles && obj.data?.resolved?.roles[adminAdd]){
      let addRole = obj.data.resolved.roles.[adminAdd]
      if(!shard.admin || !shard.admin[addRole.id]){
        await mongo.set('payoutServers', {_id: shard._id}, {['admin.'+addRole.id]: {id: addRole.id, name: addRole.name}})
        msg2send.content += '@'+addRole.name+' was added as shard admin role\n'
      }else{
        msg2send.content += '@'+addRole.name+' is already a shard admin role\n'
      }
    }
    if(adminRemove)){
      if(shard.admin[adminRemove]){
        let rmvRole = shard.admin[adminRemove]
        await mongo.unset('payoutServers', {_id: shard._id}, {['admin.'+rmvRole.id]: rmvRole})
        msg2send.content += '@'+rmvRole.name+' was removed as a shard admin role\n'
      }else{
        msg2send.content += 'The provide role was not removed as it is not a shard admin role\n'
      }
    }
    if(adminMsg){
      if(adminMsg.toLowerCase() === 'default') adminMsg = 'default'
      await mongo.set('payoutServers', {_id: shard._id}, {message: newMessage})
      msg2send.content += 'report messages has been updated\n'
    }
    if(adminModify >= 0){
      await mongo.set('payoutServers', {_id: shard._id}, { allowAll: adminModify })
      msg2send.content += 'Add/Edit has been '+(adminModify ? 'enabled':'disabled')+' for all users\n'
    }
    if(msg2send.content === '') msg2send.content = 'There was an error with the provided information'
  }
  return msg2send
}
