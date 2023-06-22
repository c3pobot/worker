'use strict'
module.exports = async(obj = {}, msg)=>{
  try{
    await MSG.WebHookMsg(obj.token, {content: msg ? msg:'Here we go again....', components:[]}, 'PATCH')
  }catch(e){
    console.error(e)
  }
}
