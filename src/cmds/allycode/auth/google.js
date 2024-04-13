'use strict'
const authMsg = "EA TOS link: <https://tos.ea.com/legalapp/WEBTERMS/US/en/PC/>\nBy using the link below you will be allowing a discord bot to login to your Star Wars Galaxy of Heroes Account on your behalf. This may be in violation of the ea tos\nif you continue you do so at your own risk\nYou can always revoke the bot\'s saved token from:\n<https://myaccount.google.com/u/2/permissions>\nGoogle Account Link : \n"+process.env.WEB_CONFIG_URL+"/google"
const { getDiscordAC, replyButton, replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Your allyCode is not linked to your discord id'}
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode){
    msg2send.content = authMsg
    msg2send.flags = 64
    //SendLink(obj.member.user.id, dObj.allyCode)
    //MSG.SendDM(dId, {content: authMsg})
  }
  await replyButton(obj, 'Sending Private message')
  await replyMsg(obj, msg2send, 'POST')
}
