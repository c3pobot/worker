'use strict'
const { add } = require('src/rabbitmq')
module.exports = async(obj = {}, opt = {})=>{
  let logLevel = opt.log_level?.value
  if(!logLevel) return { content: `error with provided data` }

  //await exchange.send(null, { logLevel: logLevel})

  return { content: `Set logLevel to **${logLevel}**` }
}
