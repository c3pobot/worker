'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const fetch = require('./fetch')
const getIdentity = require('./getIdentity')
const { v5: uuidv5 } = require('uuid')

module.exports = async(obj = {}, opt = {}, allyCode, email, authCode, googleId)=>{
  let msgContent = '{0}\nThis could be caused by the updated terms and conditions on the webstore. Try going to the webstore and going thru authorization there, including getting a new code, than come back and try this command again.'
  if(!authCode || !allyCode || !email) return { flags: 64, content: 'no authcode or allycode provided' }

  let cache = (await mongo.find('eaconnectCache', { _id: allyCode?.toString() }))[0]
  //mongo.del('eaconnectCache', {_id: allyCode?.toString() })
  if(!cache || !cache?.initref || !cache?.executionId || !cache?.fId || !cache?.JSESSIONID) return { flags: 64, content: 'command timed out.' }

  let data = await getIdentity(cache, authCode)
  if(!data?.auth || !data?.remid || !data._nx_mpcid || !data?.auth?.authToken || !data?.auth?.authId) return { flags: 64, content: msgContent.replace('{0}', 'error getting auth from code') }

  data.deviceId = uuidv5(data.auth.authId, uuidv5.URL)
  if(!data.deviceId) return { flags: 64, content: 'error generating a UUID' }

  let identity = {
    auth: data.auth,
    deviceId: data.deviceId,
    androidId: data.deviceId,
    platform: 'Android'
  }
  let pObj = await swgohClient.oauthPost('getInitialData', {}, identity)
  if(!pObj?.player?.allyCode) return { flags: 64, content: 'error trying to get player data' }
  if(pObj.player.allyCode.toString() !== allyCode.toString()){
    log.error(`ea connect error: Requested: ${allyCode} From game: ${pObj.player.allyCode}`)
    return { flags: 64, content: `the allyCode from the game did not match ${allyCode}. Make sure you are using the correct allyCode and email` }
  }
  let encryptedToken = await swgohClient.Google.Encrypt(data.remid)
  await mongo.set('identity', { _id: identity.deviceId }, identity)
  await mongo.del('tokens', { _id: identity.deviceId})
  if(googleId){
    await mongo.del('tokens', { _id: googleId })
    await mongo.del('identity', { _id: googleId })
  }
  await mongo.set('eaconnectTokens', { _id: identity.deviceId }, { _nx_mpcid: data._nx_mpcid, remid: encryptedToken })
  await mongo.set('discordId', { _id: obj.member?.user?.id, 'allyCodes.allyCode': +allyCode }, { 'allyCodes.$.uId': data.deviceId, 'allyCodes.$.type': 'eaconnect' })
  return { flags: 64, content: `Successfully linked EA Connect auth for ${allyCode}` }
}
