'use strict'
const { replyComponent } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  await replyComponent(obj, { content: `Please click button below to input the EA Connect email for ${obj.data?.options?.allyCode}\nYou can also go the website and link`, components: [{ type: 1, components: [
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
  ]}] })
  return
}
