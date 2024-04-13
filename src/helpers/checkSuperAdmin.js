'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
const { botSettings } = require('./botSettings')
module.exports = (obj = {})=>{
  let auth = 0
  if(obj.member.user.id === BOT_OWNER_ID) auth++
  if(auth === 0 && botSettings?.sAdmin?.filter(x=>x === obj.member.user.id).length > 0) auth++
  if(auth > 0) return true
}
