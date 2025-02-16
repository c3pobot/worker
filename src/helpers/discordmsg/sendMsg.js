'use strict'
const log = require('logger')
const discordFetch = require('./discordFetch')

module.exports = async(obj = {}, msg2send)=>{
  if(!obj.chId) return
  let uri = `/channels/${obj.chId}/messages`
  if(typeof content != 'object' && typeof content == 'string') msg2send = { content: msg2send }
  let res = await discordFetch(uri, 'POST', JSON.stringify(msg2send), { "Content-Type": "application/json" })
  if(res?.status === 200) return res?.body

}
