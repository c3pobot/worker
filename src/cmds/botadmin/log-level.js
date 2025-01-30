'use strict'
const exchange = require('src/exchanges')
module.exports = async(obj = {}, opt = {})=>{
  let logLevel = opt.log_level?.value
  if(!logLevel) return { content: `error with provided data` }

  await exchange.send(null, { logLevel: logLevel})

  return { content: `Set logLevel to **${logLevel}**` }
}
