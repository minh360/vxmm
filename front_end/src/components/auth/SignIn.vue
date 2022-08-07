<template>
  <header-panel>
    <div class="clickable" @click="router.push('/sign-up')">Sign Up</div>
  </header-panel>
  <SignPanel @check-error="checkError" style="height: 100vh">
    <div style="color: black">Username</div>
    <input type="text"   v-model="username" @focusout="checkError"/>
    <div style="color: black">Password</div>
    <input type="password" v-model="password" @focusout="checkError"/>
    <div>{{message}}</div>
    <button @click="signIn" class="clickable">Sign In</button>
    <hr style="width: 100%">
    <div>Don’t have an account? <span style="text-decoration: underline" class="clickable" @click="router.push('/sign-up')">Sign up</span></div>
  </SignPanel>

</template>

<script setup>
import { ref } from 'vue'
import axios from "axios";
import {useRouter} from "vue-router";
import SignPanel from "@/components/SignPanel";
import HeaderPanel from "@/components/layouts/HeaderPanel";
const router = useRouter();
const username = ref('')
const password = ref('')
const message = ref('')
const checkError = () =>{
  if(username.value === '')
    message.value = 'Vui lòng nhập Username!!!'
  else if(password.value === '')
    message.value = 'Vui lòng nhập Password!!!'
  else message.value = ''
}
const signIn = async () => {
  if(message.value === ''){
    await axios.request({
      method: "POST",
      url: "http://localhost:3000/auth/sign_in",
      headers: {
        'Authorization': 'token'
      },
      data: {
        username: username.value,
        password: password.value
      },
      timeout: 3000
    })
        .then(user =>{
          clearUser()
          message.value = user.data ? 'Đăng nhập thành công' : 'Đăng nhập thất bại!!! Vui lòng thử lại'
          if(user.data){
            sessionStorage.setItem('id_user',user.data._id)
            setTimeout(() => router.push({name: 'home'}),1000)
          }
        })
        .catch((err) =>
           console.log(err.response.data)
        );
  }
}
const clearUser = () =>{
  username.value =''
  password.value = ''
}
</script>

<style lang="scss" scoped>
input{
  height: 50px;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  border-color: darkred
}
button{
  height: 50px;
  font-size:15px;
  border-radius: 16px;
  background-color: darkred;
  color: white;
  margin-top: 25px;
  text-align: center;
}
@media screen and (min-width: 800px){
  input, button{
    box-sizing: border-box;
    max-width: 500px;
  }
}
</style>