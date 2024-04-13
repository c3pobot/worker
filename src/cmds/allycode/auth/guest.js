'use strict'
const { SendDM } = require('src/helpers/discordmsg')
const { getDiscordAC } = require('src/helpers')
const GOOG_REDIRECT_URI = process.env.GOOG_REDIRECT_URI
const sendLink = (dId, allyCode)=>{
  let msgToSend = "EA TOS link: <https://tos.ea.com/legalapp/WEBTERMS/US/en/PC/>\n"
  msgToSend += "To link your discordId to your swgoh game account that has been linked to an andorid guest account click on the provided link below\n"
  msgToSend += "By using the link below you will be allowing a discord bot to login to your"
  msgToSend += " Star Wars Galaxy of Heroes Account on your behalf. This may be in violation of the ea tos\n"
  msgToSend += "if you continue you do so at your own risk\n"
  msgToSend += 'Account Link : '+GOOG_REDIRECT_URI+'/guestAuth'
  SendDM(dId, {content: msgToSend})
}
module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}
  const dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj && dObj.allyCode){
    msg2send.content = 'I have sent you a DM with info'
    SendLink(obj.member.user.id, dObj.allyCode)
  }
  return msg2send
}
