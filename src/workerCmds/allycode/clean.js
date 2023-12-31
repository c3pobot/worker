'use strict'
const mongo = require('mongoclient')
const { ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have an allyCode linked. use `/allycode` to link'}
    let dObj = (await mongo.find('discordId', {_id: obj.member.user.id}))[0]
    if(dObj && dObj.allyCodes && dObj.allyCodes.length > 0){
      let allyCodes = []
      for(let i in dObj.allyCodes){
        if(allyCodes.filter(x=>x.allyCode == dObj.allyCodes[i].allyCode).length === 0) allyCodes.push(dObj.allyCodes[i])
      }
      if(allyCodes.length > 0) await mongo.set('discordId', {_id: dObj._id}, {allyCodes: allyCodes})
      msg2send.content = 'Duplicate allyCodes have been removed'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
