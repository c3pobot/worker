'use strict'
const eaTOSUrl = 'https://tos.ea.com/legalapp/WEBTERMS/US/en/PC/'
const { replyComponent } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  let msg2send = `By clicking on the \`Enter EA Connect email\` button below you will be allowing a discord bot\nto login to your Star Wars Galaxy of Heroes Account on your behalf for allyCode ${obj.data?.options?.allyCode}\n`
  msg2send += 'This may be in violation of EA Terms of Service (TOS)'
  await replyComponent(obj, { flags: 64, content: msg2send, components: [{ type: 1, components: [
    {
      type: 2,
      label: 'EA Terms of Service',
      style: 5,
      url: eaTOSUrl
    },
    {
      type: 2,
      label: 'Enter EA Connect email',
      style: 3,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, request: 'email', cmd: 'ea_connect' })
    },
    {
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    }
  ]}] }, 'POST')
  return
}
