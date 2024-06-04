'use strict'
const mongo = require('mongoclient')
const { getOptValue, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getDiscordAC(obj.member.user.id, opt)
  let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id }))[0]
  if(!pObj?.allyCode || !dObj.allyCodes) return { content: 'Your allyCode is not linked to your discord id...' }
  if(!pObj.uId || pObj.type) return { content: `**${pObj?.allyCode}** does not have bot login auth set up...`}

  if(opt.confirm?.value !== 1) return { content: 'command canceled...'}

  await mongo.del('tokens', { _id: pObj.uId } )
  await mongo.del('facebook', { _id: pObj.uId })
  await mongo.del('identity',  {_id: pObj.uId })
  await mongo.set('discordId', { _id: obj.member.user.id }, { allyCodes: dObj.allyCodes.filter(x=>+x.allyCode !== +pObj.allyCode) })
  return { content: `Authorization for the bot to login to account for **${pObj.allyCode}** has been removed...`}

}
