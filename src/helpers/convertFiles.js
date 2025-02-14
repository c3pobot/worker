'use strict'
const log = require('logger')
module.exports = (msg = {})=>{
  try{
    if(msg.file) msg.file = Buffer.from(msg.file, 'base64')
    if(msg.files){
      for(let i in msg.files) msg.files[i].file = Buffer.from(msg.files[i].file, 'base64')
    }
  }catch(e){
    log.error(e)
  }
}
