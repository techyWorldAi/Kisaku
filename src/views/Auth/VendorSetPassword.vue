<script setup lang="ts">
import { computed,ref } from 'vue';import {useRoute,useRouter} from 'vue-router';import {authPasswordAPI} from '../../services/api';
const route=useRoute(),router=useRouter();
const token=computed(()=>{
  const queryNames=['token','reset_token','invite_token'];
  for(const name of queryNames){
    if(typeof route.query[name]==='string'&&route.query[name]) return route.query[name] as string;
  }
  const hash=new URLSearchParams(window.location.hash.replace(/^#/,'').replace(/^\?/,''));
  for(const name of queryNames){const value=hash.get(name);if(value)return value}
  return '';
});
const password=ref(''),loading=ref(false),error=ref('');
async function submit(){if(!token.value){error.value='This set-password link is missing a token. Ask Kisaku to resend the vendor invite.';return}if(password.value.length<8||password.value.length>72){error.value='Password must be 8 to 72 characters.';return}loading.value=true;error.value='';try{await authPasswordAPI.resetPassword(token.value,password.value);await router.push('/login')}catch(e:any){error.value=e.response?.status===400?(e.response?.data?.error||'This set-password link is invalid, used or expired.'): (e.response?.data?.error||'Could not set password.')}finally{loading.value=false}}
</script><template><main class="auth-simple"><section><h1>Create your vendor password</h1><p>Choose a password for your Kisaku vendor account.</p><div v-if="error" class="error">{{error}} <router-link to="/login">Go to sign in</router-link></div><form @submit.prevent="submit"><label>New password<input v-model="password" type="password" minlength="8" maxlength="72" required :disabled="loading" /><small>Use 8 to 72 characters.</small></label><button :disabled="loading">{{loading?'Creating password...':'Create password'}}</button></form></section></main></template><style scoped>.auth-simple{min-height:78vh;display:grid;place-items:center;padding:20px}.auth-simple section{width:min(420px,100%);padding:28px;border:1px solid #e4e9ef;border-radius:8px}.auth-simple h1{margin:0 0 8px}.auth-simple p{color:#64748b}.auth-simple form{display:flex;flex-direction:column;gap:12px;margin-top:16px}.auth-simple label{display:flex;flex-direction:column;gap:7px;font-weight:700}.auth-simple input{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:6px}.auth-simple label small{color:#64748b;font-weight:500}.auth-simple button{height:44px;border:0;border-radius:6px;background:#075397;color:#fff;font-weight:800}.error{padding:10px;margin-bottom:12px;border-radius:6px;background:#feeaea;color:#b42318}.error a{display:block;margin-top:6px}</style>