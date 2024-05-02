'use strict'
const authMsg = "EA TOS link: <https://tos.ea.com/legalapp/WEBTERMS/US/en/PC/>\nBy using the link below you will be allowing a discord bot to login to your Star Wars Galaxy of Heroes Account on your behalf. This may be in violation of the ea tos\nif you continue you do so at your own risk\nYou can always revoke the bot\'s saved token using the command `/allyCode auth remove`\nEA Connect Link:\n<"+process.env.WEB_CONFIG_URL+"/codeAuth>"
const { getDiscordAC, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj.allyCode) return { content: 'Your allyCode is not linked to your discord id' }
  await replyMsg(obj, { content: 'Sending Private message' })
  await replyMsg(obj, { content: authMsg, flags: 64 }, 'POST')
}
