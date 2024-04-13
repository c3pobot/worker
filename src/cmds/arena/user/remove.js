'use strict'
const mongo = require('mongoclient')
const { buttonPick, getOptValue } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  let allyCode, msg2send = {content: 'You did not provide the correct information'}
  if(obj?.confirm?.allyCode) allyCode = +obj.confirm.allyCode
  let usr = getOptValue(opt, 'user')
  if(!allyCode && !usr) allyCode = getOptValue(opt, 'allycode')
  if(!allyCode && usr){
    let dObj = (await mongo.find('discordId', {_id: opt.find(x=>x.name == 'user').value}))[0]
    if(dObj?.allyCodes?.length === 0) msg2send.content = 'That user does not have allyCode linked to discordId'
    if(dObj?.allyCodes?.length === 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj?.allyCodes?.length > 1){
      let usrname = obj?.data?.resolved?.users[usr]?.username
      if(obj.data?.resolved?.members[usr].nick) usrname = obj.data?.resolved?.members[usr].nick
      let embedMsg = {
        content: 'There are multiple allyCodes for '+(usrname ? '**@'+usrname+'**':'that user')+'. Which one do you want to remove?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in dObj.allyCodes){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
          style: 1,
          custom_id: JSON.stringify({id: obj.id, allyCode: dObj.allyCodes[i].allyCode})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      await buttonPick(obj, embedMsg)
      return
    }
  }
  if(allyCode){
    msg2send.content = '**'+allyCode+'** is not in your user list'
    let tempUser = patreon.users?.find(x=>x.allyCode === +allyCode)
    if(tempUser?.allyCode){
      await mongo.pull('patreon', {_id: patreon._id}, {users:{allyCode: +allyCode}})
      msg2send.content = '**'+tempUser.name+'** was removed from your list'
    }
  }
  return msg2send
}
