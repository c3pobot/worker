'use strict'
const mongo = require('mongoclient')
const { checkGuildAdmin, getGuildId, replyComponent } = require('src/helpers')

module.exports = async(obj ={}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'Command canceled' }
  let auth = await checkGuildAdmin(obj, opt)
  if(!auth) return { content: 'This command is only avaliable to guild Admins' }

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return { content: 'you do not have discord id linked to allyCode' }

  if(obj.confirm?.tbDay){
    await mongo.del('tbPlatoonCache', {guildId: pObj.guildId, tbDay: obj.confirm?.tbDay})
    return { content: 'tb platoon cache for Round '+obj.confirm.tbDay+' has been cleared' }
  }

  let gObj = await mongo.find('tbPlatoonCache', {guildId: pObj.guildId}, {platoons: 0})
  if(!gObj || gObj?.length === 0) return { content: 'There is no platoon data cached' }

  let x = 0, msg2send = {
    content: 'Please select the round for the platoons you want to clear the cache for?',
    components: [],
    flags: 64
  }
  for(let i in gObj){
    if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
    msg2send.components[x].components.push({
      type: 2,
      label: 'Round-'+gObj[i].tbDay,
      style: 1,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, tbDay: +gObj[i].tbDay })
    })
    if(msg2send.components[x].components.length == 5) x++;
  }
  if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
  msg2send.components[x].components.push({
    type: 2,
    label: 'Cancel',
    style: 4,
    custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
  })
  await replyComponent(obj, msg2send)
}
