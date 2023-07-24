'use strict'
const { ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opts = [])=>{
  try{
    let msg2send = { content: 'Coming soon (tm)'}
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
