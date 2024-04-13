'use strict'
const log = require('logger')
const fetch = require('../fetch')
const CLIENT_URL = process.env.CLIENT_URL

module.exports = async()=>{
  try{
    let opts = { method: 'GET', timeout: 30000, compress: true }
    let data = await fetch(`${CLIENT_URL}/enums`, opts)
    if(data?.body) return data.body
  }catch(e){
    throw(e);
  }
}
