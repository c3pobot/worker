'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(!shard.admin) shard.admin = {}
  let adminAdd = opt['admin-add']?.data, adminRemove = opt['admin-remove']?.data, adminMsg = opt.message?.value, adminModify = opt.modify?.value
  let msg2send = { content: ''}
  if(adminAdd){
    if(shard.admin[adminAdd.id]){
      msg2send.content += `**@${adminAdd.name}** is already a shard admin\n`
    }else{
      shard.admin[adminAdd.id] = { id: adminAdd.id, name: adminAdd.name }
      await mongo.set('payoutServers', { _id: shard._id }, { admin: shard.admin })
      msg2send.content += `**${adminAdd.name}** was added as shard admin\n`
    }
  }
  if(adminRemove){
    if(shard.admin[adminRemove.id]){
      delete shard.admin[adminRemove.id]
      await mongo.set('payoutServers', { _id: shard._id }, { admin: shard.admin })
      msg2send.content += `**${adminRemove.name} was removed as a shard admin\n`
    }else{
      msg2send.content += `**@${adminRemove.name} is not a shard admin\n`
    }
  }
  if(adminMsg){
    if(adminMsg.toLowerCase() === 'default') adminMsg = 'default'
    shard.message = adminMsg
    await mongo.set('payoutServers', { _id: shard._id }, { message: adminMsg })
    msg2send.content += `report messages updated\n`
  }
  if(adminModify >= 0){
    shard.allowAll = adminModify
    await mongo.set('payoutServers', {_id: shard._id}, { allowAll: adminModify })
    msg2send.content += 'Add/Edit has been '+(adminModify ? 'enabled':'disabled')+' for all users\n'
  }
  if(msg2send.content === '') msg2send.content = 'There was an error with the provided information'
  return msg2send
}
