'use strict'
const fetch = require('node-fetch')
const { ReplyMsg } = require('helpers')

module.exports = async(obj = {}, opt = [])=>{
  try{
    await fetch('http://data-sync:3000/updateData', {method: 'GET', timeout: 30000})
    await ReplyMsg(obj, {content: 'Data Update Request Sent'})
  }catch(e){
    throw(e)
  }
}
