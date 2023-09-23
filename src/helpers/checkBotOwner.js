'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
module.exports = (obj = {})=>{
  try{
    let auth
    if(BOT_OWNER_ID && obj.member?.user?.id === BOT_OWNER_ID) auth = true
    return auth
  }catch(e){
    throw(e);
  }
}
