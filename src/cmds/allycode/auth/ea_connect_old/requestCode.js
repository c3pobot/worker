'use strict'
const sendEmail = require('./sendEmail')
const { replyComponent } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  let status = await sendEmail(obj.data?.options?.allyCode, obj.data?.options?.email)
  if(!status) return { content: 'Error sending email code' }
  await replyComponent(obj, { content: `Please click button below to input the EA Connect code emailed to you for ${obj.data?.options?.allyCode}\nYou can also go the website and link`, components: [{ type: 1, components: [
    {
      type: 2,
      label: 'Enter EA Connect Code',
      style: 3,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, request: 'code', cmd: 'ea_connect', email: obj.confirm.email })
    },
    {
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    }
  ]}] })
  return
}
