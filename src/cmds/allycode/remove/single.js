'use strict'
const mongo = require('mongoclient')
const { replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id }))[0]
  if(!dObj?.allyCodes) return { content: 'There are no allyCode(s) regsiterd to your discordId' }

  let allyCode = +obj.confirm?.allyCode
  if(!allyCode){
    let x = 0, msg2send = {
      content: 'Please pick which allyCode to unlink...',
      components: [],
      flags: 64
    }
    for(let i in dObj.allyCodes){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
      msg2send.components[x].components.push({
        type: 2,
        label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
        style: 1,
        custom_id: JSON.stringify({ dId: obj.member?.user?.id, allyCode: dObj.allyCodes[i].allyCode, id: obj.id })
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ dId: obj.member?.user?.id, cancel: true, id: obj.id })
    })
    await replyComponent(obj, msg2send)
    return
  }

  let allyObj = dObj.allyCodes.find(x=>x.allyCode === allyCode)
  if(!allyObj?.allyCode) return { content: `${allyCode} is not registerd to your account...` }

  if(allyObj.type == 'google' || allyObj.type == 'codeAuth') mongo.del('tokens', {_id: allyObj.uId})
  if(allyObj.type == 'facebook') mongo.del('facebook', {_id: allyObj.uId})
  if(allyObj.uId) mongo.del('identity', {_id: allyObj.uId})
  await mongo.set('discordId', { _id: obj.member.user.id }, { allyCodes: dObj.allyCodes.filter(x=>x.allyCode !== allyCode) })
  return { content: `**${allyCode}** was unlinked...`}
}
