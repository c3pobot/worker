'use strict'
const fetch = require('node-fetch')

module.exports = async(obj = {}, opt = [])=>{
  await fetch('http://data-sync:3000/updateData', {method: 'GET', timeout: 30000})
  return {content: 'Data Update Request Sent'}
}
