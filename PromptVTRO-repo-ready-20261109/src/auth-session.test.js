import test from 'node:test'
import assert from 'node:assert/strict'
import { startFreshSession } from './auth-session.js'

test('fresh document revokes the previous cookie without restoring the previous user',async()=>{
 const requests=[]
 await startFreshSession(async(url,options)=>{requests.push({url,options});return {ok:true}})
 assert.equal(requests.length,1)
 assert.equal(requests[0].url,'/api/auth/logout')
 assert.equal(requests[0].options.method,'POST')
 assert.equal(requests[0].options.credentials,'same-origin')
 assert.equal(requests[0].options.cache,'no-store')
})
test('failed revocation blocks login initialization and can be retried',async()=>{
 await assert.rejects(startFreshSession(async()=>({ok:false})))
 await assert.rejects(startFreshSession(async()=>{throw new Error('offline')}))
 await startFreshSession(async()=>({ok:true}))
})
