'use strict'
const permEnums = {
  SEND_MESSAGES: 0x800,
  VIEW_CHANNEL: 0x400,
  MANAGE_MESSAGES: 0x2000,
  READ_MESSAGE_HISTORY: 0x10000,
  MANAGE_ROLES: 0x10000000
}
module.exports = (perm, permissions)=>{
  if(!perm || !permissions) return
  if((permissions & permEnums[perm]) == permEnums[perm]) return true
}
