'use strict'
const { WebHookMsg } = require('discordapiwrapper')
module.exports = async(obj = {}, msg)=>{
  try{
    await WebHookMsg(obj.token, {content: msg ? msg:'Here we go again....', components:[]}, 'PATCH')
  }catch(e){
    console.error(e)
  }
}
