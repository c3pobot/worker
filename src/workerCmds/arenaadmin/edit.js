'use strict'
const { GetOptValue, ReplyMsg } = require('helpers')
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let patreon, msg2send = {content: 'You did not provide the correct information'}
    let dId = GetOptValue(opt, 'user')
    let num = GetOptValue(opt, 'num')
    let status = GetOptValue(opt, 'status')
    if(dId){
      msg2send.content = 'Could not find that patreon'
      patreon = (await mongo.find('patreon', { _id: dId }))[0]
    }
    if(patreon?._id){
      if(num) mongo.set('patreon', {_id: patreon._id}, { maxAllyCodes: +num})
      if(+status >= 0) mongo.set('patreon', {_id: patreon._id}, { status: +status })
      msg2send.content = 'patreon updated'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
