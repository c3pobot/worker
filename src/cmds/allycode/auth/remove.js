'use strict'
const mongo = require('mongoclient')
const { getOptValue, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let pObj = await getDiscordAC(obj.member.user.id, opt)
  let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id }))[0]
  if(!pObj?.allyCode || !dObj.allyCodes) return { content: 'Your allyCode is not linked to your discord id...' }
  if(!pObj.uId || !pObj.type) return { content: `**${pObj?.allyCode}** does not have bot login auth set up...`}

  if(opt.confirm?.value !== 1) return { content: 'command canceled...'}

  let uId = pObj.uId
  for(let i in dObj.allyCodes){
    if(dObj.allyCodes[i].uId === uId){
      delete dObj.allyCodes[i].uId
      delete dObj.allyCodes[i].type
    }
  }
  await mongo.del('tokens', { _id: uId } )
  await mongo.del('facebook', { _id: uId })
  await mongo.del('identity',  {_id: uId })
  await mongo.set('discordId', { _id: obj.member.user.id }, { allyCodes: dObj.allyCodes })
  return { content: `Authorization for the bot to login to account for **${pObj.allyCode}** has been removed...`}

}
