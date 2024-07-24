'use strict'
const authMsg = "EA TOS link: <https://tos.ea.com/legalapp/WEBTERMS/US/en/PC/>\nBy using the link below you will be allowing a discord bot to login to your Star Wars Galaxy of Heroes Account on your behalf. This may be in violation of the ea tos\nif you continue you do so at your own risk\nYou can always revoke the bot\'s saved token from:\n<https://myaccount.google.com/u/2/permissions>\nGoogle Account Link : \n"+process.env.WEB_CONFIG_URL+"/google"
const { getDiscordAC, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  //return { content: 'The bots ability to do google auth commands has been removed. please use `/allycode auth ea_connect` until further notice' }
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj.allyCode) return { content: 'Your allyCode is not linked to your discord id' }
  await replyMsg(obj, { content: 'Sending Private message' })
  await replyMsg(obj, { content: authMsg, flags: 64 }, 'POST')
}
