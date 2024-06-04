'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const fetch = require('./fetch')
const { v5: uuidv5 } = require('uuid')

module.exports = async(obj = {}, opt = {}, allyCode, email, authCode)=>{
  if(!authCode || !allyCode || !email) return { content: 'no authcode or allycode provided' }

  let cache = (await mongo.find('codeAuthCache', { _id: allyCode?.toString() }))[0]
  mongo.del('codeAuthCache', {_id: allyCode?.toString() })
  if(!cache?.authId || !cache?.authToken) return { content: 'command timed out.' }

  let tempAuth = await fetch('auth/code_check', { code: authCode?.toString(), email: email, rememberMe: true }, { 'X-Rpc-Auth-Id': cache.authId, 'Cookie': `authToken=${cache.authToken}` })
  if(!tempAuth?.authId || !tempAuth?.authToken || !tempAuth?.refreshToken) return { content: 'error getting auth from code' }

  tempAuth.deviceId = uuidv5(tempAuth.authId, uuidv5.URL)
  if(!tempAuth.deviceId) return { content: 'error generating a UUID' }

  let identity = {
    auth: {
      authId: tempAuth.authId,
      authToken: tempAuth.authToken,
    },
    deviceId: tempAuth.deviceId,
    androidId: tempAuth.deviceId,
    platform: 'Android'
  }
  let pObj = await swgohClient.oauthPost('getInitialData', {}, identity)
  if(!pObj?.player?.allyCode) return { content: 'error trying to get player data' }
  if(pObj.player.allyCode.toString() !== allyCode.toString()){
    log.error(`ea connect error: Requested: ${allyCode} From game: ${pObj.player.allyCode}`)
    return { content: `the allyCode from the game did not match ${allyCode}. Make sure you are using the correct allyCode and email` }
  }
  let encryptedToken = await swgohClient.Google.Encrypt(tempAuth.refreshToken)
  await mongo.set('identity', { _id: identity.deviceId }, identity)
  await mongo.set('tokens', { _id: identity.deviceId }, { refreshToken: encryptedToken })
  await mongo.set('discordId', { _id: obj.member?.user?.id, 'allyCodes.allyCode': +allyCode }, { 'allyCodes.$.uId': tempAuth.deviceId, 'allyCodes.$.type': 'codeAuth' })
  return { content: `Successfully linked EA Connect auth for ${allyCode}` }
}
