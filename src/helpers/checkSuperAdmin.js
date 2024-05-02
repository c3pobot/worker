'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
const { botSettings } = require('./botSettings')
module.exports = (obj = {})=>{
  if(obj.member?.user?.id === BOT_OWNER_ID) return true
  if(auth === 0 && botSettings?.sAdmin?.filter(x=>x === obj.member?.user?.id).length > 0) return true
}
