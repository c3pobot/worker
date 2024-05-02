'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID

module.exports = async(obj = {}, shard = {})=>{
  if(!obj.member?.user?.id) return
  if(BOT_OWNER_ID === obj.member.user.id) return true
  if(obj?.guild?.owner_id == obj.member.user.id) return true
  if(shard?.patreonId == obj.member.user.id) return true

  let roles = obj.members?.roles
  if(!shard.admin || !roles || roles?.length == 0) return
  let array = Object.values(shard.admin)
  if(array.length == 0) return

  if(!shard.admin.filter(x=>roles.includes(x.id)).length > 0) return true
}
