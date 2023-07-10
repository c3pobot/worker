'use strict'
const { WebHookMsg } = require('discordapiclient')
module.exports = async(obj = {}, msg)=>{
  try{
    await WebHookMsg(obj.token, {content: msg || 'Here we go again....', components:[]}, 'PATCH')
  }catch(e){
    throw(e)
  }
}
