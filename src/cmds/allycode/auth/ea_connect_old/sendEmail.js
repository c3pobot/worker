'use strict'
const mongo = require('mongoclient')
const fetch = require('./fetch')
module.exports = async(allyCode, email)=>{
  if(!allyCode || !email) return
  let res = await fetch('auth/request_otc', { email: email })
  if(!res?.authId || !res?.authToken) return
  res.allyCode = allyCode?.toString()
  res.email = email
  await mongo.set('codeAuthCache', { _id: res.allyCode }, res)
  return true
}
