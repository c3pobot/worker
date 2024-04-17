'use strict'
const mongo = require('mongoclient')
const { checkGuildAdmin, getGuildId, replyButton, buttonPick } = require('src/helpers')

module.exports = async(obj ={}, opt = [])=>{
  let msg2send = {content: 'you do not have discord id linked to allyCode'}
  let tbDay = obj.confirm?.tbDay
  if(tbDay === 'cancel') return { content: 'Command canceled', components: null }

  if(obj?.confirm) await replyButton()
  let auth = await checkGuildAdmin(obj, opt, null)
  if(!auth) return { content: 'This command is only avaliable to guild Admins' }

  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send

  if(!tbDay){
    let gObj = await mongo.find('tbPlatoonCache', {guildId: pObj.guildId}, {platoons: 0})
    if(!gObj || gObj?.length === 0) return { content: 'There is no platoon data cached' }

    let embedMsg = {
        content: 'Please select the round for the platoons you want to clear the cache for?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in gObj){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: 'Round-'+gObj[i].tbDay,
          style: 1,
          custom_id: JSON.stringify({id: obj.id, tbDay: +gObj[i].tbDay})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 1,
        custom_id: JSON.stringify({id: obj.id, tbDay: 'cancel'})
      })
      await buttonPick(obj, embedMsg)
      return
  }
  
  await mongo.del('tbPlatoonCache', {guildId: pObj.guildId, tbDay: tbDay})
  return { content: 'tb platoon cache for Round '+tbDay+' has been cleared' }
}
