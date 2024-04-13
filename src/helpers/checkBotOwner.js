'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
module.exports = (obj = {})=>{
  if(obj?.member?.user?.id === BOT_OWNER_ID) return true;
}
