'use strict'
const permEnums = {
  SEND_MESSAGES: 'SendMessages',
  VIEW_CHANNEL: 'ViewChannel',
  MANAGE_MESSAGES: 'ManageMessages',
  READ_MESSAGE_HISTORY: 'ReadMessageHistory',
  MANAGE_ROLES: 'ManageRoles'
}
module.exports = (perm, permissions)=>{
  if(!perm || !permissions) return
  let perms = new Set(permissions)
  if(!perms?.has('ViewChannel')) return
  if(perms?.has(permEnums[perm])) return true
}
