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
    <button @click="signInClient" class="clickable">Sign In</button>
    <hr style="width: 100%">
    <div>Don’t have an account? <span style="text-decoration: underline" class="clickable" @click="router.push('/sign-up')">Sign up</span></div>
  </SignPanel>

</template>

<script setup>
import { ref } from 'vue'
import {useRouter} from "vue-router";
import SignPanel from "@/components/SignPanel";
import HeaderPanel from "@/components/layouts/HeaderPanel";
import {checkExist} from "../../../../back_end/api";
import {socket} from "@/main";
const router = useRouter();
const username = ref('')
const password = ref('')
const message = ref('')
let idUser
const checkError = () =>{
  if(username.value === '')
    message.value = 'Vui lòng nhập Username!!!'
  else if(password.value === '')
    message.value = 'Vui lòng nhập Password!!!'
  else message.value = ''
}
const signInClient = async () => {
  checkError()
  if(message.value === ''){
    await checkExist(username.value)
        .then(user => {
          socket.emit('comparePassword', {passwordData: user.data.password, passwordEnter: password.value})
          idUser = user.data._id
        })
  }
}
const clearUser = () =>{
  username.value =''
  password.value = ''
}
socket.on('sendResult',result => {
  message.value = result ? 'Đăng nhập thành công' : 'Đăng nhập thất bại!!! Vui lòng thử lại'
  if(result){
    sessionStorage.setItem('id_user',idUser)
    setTimeout(() => {
      router.push({name: 'home'})
      message.value = ''
    },1000)
  }
  clearUser()
})
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