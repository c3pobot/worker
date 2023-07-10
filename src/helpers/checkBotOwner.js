'use strict'
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
module.exports = async(obj = {})=>{
  try{
    let auth = 0
    if(BOT_OWNER_ID && obj.member?.user?.id === BOT_OWNER_ID) auth++
    return auth
  }catch(e){
    throw(e);
  }
}
