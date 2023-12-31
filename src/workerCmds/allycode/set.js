'use strict'
const mongo = require('mongoclient')
const { ButtonPick, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have an allyCode linked. use `/allycode` to link'}, allyCode, option
    if(obj.confirm){
      if(obj.confirm.opt) option = obj.confirm.opt
      if(obj.confirm.allyCode) allyCode = +obj.confirm.allyCode
    }
    let dObj = (await mongo.find('discordId', {_id: obj.member.user.id}))[0]
    if(!dObj?.allyCodes || dObj?.allyCodes?.length === 0 || dObj?.allyCodes?.length === 1){
      await ReplyMsg(obj, {content: 'You must have more than 1 allyCode linked to set a primary or alt' })
      return
    }
    if(!option){
      let embedMsg = {
        content: 'Set primary or alt allyCode?',
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: 'Primary',
                style: 1,
                custom_id: JSON.stringify({id: obj.id, opt: 'primary'})
              },
              {
                type: 2,
                label: 'Alt',
                style: 1,
                custom_id: JSON.stringify({id: obj.id, opt: 'alt'})
              }
            ]
          }
        ],
        flags: 64
      }
      await ButtonPick(obj, embedMsg)
      return
    }
    if(!allyCode){
      let embedMsg = {
        content: 'Which allyCode do you want to set as **'+(option == 'alt' ? 'Alt':'Primary')+'**?',
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
          custom_id: JSON.stringify({id: obj.id, opt: option, allyCode: dObj.allyCodes[i].allyCode})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      await ButtonPick(obj, embedMsg)
      return
    }
    if(allyCode && option){
      if(dObj.allyCodes.find(x=>x.opt == option)) delete dObj.allyCodes.filter(x=>x.opt == option)[0].opt
      if(dObj.allyCodes.find(x=>x.allyCode == allyCode)) dObj.allyCodes.filter(x=>x.allyCode == allyCode)[0].opt = option
      await mongo.set('discordId', {_id: dObj._id}, {allyCodes: dObj.allyCodes})
      msg2send.content = 'Your **'+(option == 'alt' ? 'Alt':'Primary')+'** allyCode has been updated to **'+allyCode+'**'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
