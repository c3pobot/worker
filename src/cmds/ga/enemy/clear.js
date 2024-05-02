'use strict'
const mongo = require('mongoclient')
const { getDiscordAC } = require('src/helpers')

module.exports = async(obj, opt = [])=>{
  if(opt.confirm?.value !== 1) return { content: 'command canceled' }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  await mongo.delMany('gaCache', { opponent: +allyCode });
  await mongo.set('ga', { _id: dObj.allyCode.toString()}, { enemies: [], currentEnemy: null })
  return { content: 'Your GA opponent data has been cleared' }
}
