'use strict'
const fetch = require('node-fetch')

module.exports = async(obj, opt = [])=>{
  try{
    await fetch('http://data-sync:3000/updateData', {method: 'GET', timeout: 30000})
    HP.ReplyMsg(obj, {content: 'Data Update Request Sent'})
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
