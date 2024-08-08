'use strict'
const mongo = require('mongoclient')
const { replyComponent } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...' }

  let option = obj.confirm?.opt
  let allyCode = +obj.confirm?.allyCode
  let dObj = (await mongo.find('discordId', { _id: obj.member.user.id }))[0]
  if(1 >= dObj?.allyCodes?.length || !dObj.allyCodes) return { content: 'You must have more than 1 allyCode linked to set a primary or alt' }
  if(!option){
    let msg2send = {
      content: 'Set primary or alt allyCode?',
      flags: 64,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'Primary',
              style: 1,
              custom_id: JSON.stringify({dId: obj.member?.user?.id, opt: 'primary', id: obj.id })
            },
            {
              type: 2,
              label: 'Alt',
              style: 1,
              custom_id: JSON.stringify({dId: obj.member?.user?.id, opt: 'alt', id: obj.id })
            },
            {
              type: 2,
              label: 'Cancel',
              style: 4,
              custom_id: JSON.stringify({dId: obj.member?.user?.id, cancel: true, id: obj.id })
            }
          ]
        }
      ]
    }
    await replyComponent(obj, msg2send)
    return
  }

  if(!allyCode){
    let x = 0, msg2send = {
      content: 'Which allyCode do you want to set as **'+(option == 'alt' ? 'Alt':'Primary')+'**?',
      components: [],
      flags: 64
    }
    for(let i in dObj.allyCodes){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
      msg2send.components[x].components.push({
        type: 2,
        label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
        style: 1,
        custom_id: JSON.stringify({dId: obj.member?.user?.id, opt: option, allyCode: dObj.allyCodes[i].allyCode, id: obj.id })
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({dId: obj.member?.user?.id, cancel: true, id: obj.id})
    })
    await replyComponent(obj, msg2send)
    return
  }

  if(dObj.allyCodes.find(x=>x.opt == option)) delete dObj.allyCodes.filter(x=>x.opt == option)[0].opt
  if(dObj.allyCodes.find(x=>x.allyCode == allyCode)) dObj.allyCodes.filter(x=>x.allyCode == allyCode)[0].opt = option
  await mongo.set('discordId', {_id: dObj._id}, {allyCodes: dObj.allyCodes})
  return { content: 'Your **'+(option == 'alt' ? 'Alt':'Primary')+'** allyCode has been updated to **'+allyCode+'**' }
}
