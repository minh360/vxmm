<template>
  <header-panel>
    <div class="clickable" @click="router.push('/sign-in')">Sign In</div>
  </header-panel>
  <SignPanel @check-error="checkError" style="height: 100vh">
    <div style="color: black">Username</div>
    <input type="text" v-model="username" @focusout="checkError"/>
    <div style="color: black">Password</div>
    <input type="password" v-model="password" @focusout="checkError"/>
    <div>{{message}}</div>
    <button @click="addNewUser" class="clickable">Sign up</button>
    <hr style="width: 100%"/>
    <div>Already signed up? <span style="text-decoration: underline" class="clickable" @click="router.push('/sign-in')">Go to login</span></div>
  </SignPanel>

</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from "vue-router";
import SignPanel from "@/components/SignPanel";
import HeaderPanel from "@/components/layouts/HeaderPanel";
import {checkExist,addNewAccount} from "../../../../back_end/api";
import {socket} from "@/main";

const router = useRouter();
const username = ref('')
const password = ref('')
const message = ref('')
const checkError = () =>{
  let regex = /^[a-zA-Z\d]+$/
  if(username.value === '')
    message.value = 'Vui lòng nhập Username!!!'
  else if(username.value.length < 6 || username.value.length >10 )
    message.value = 'Độ dài Username phải từ 6 đến 10 kí tự'
  else if(password.value === '')
    message.value = 'Vui lòng nhập Password!!!'
  else if(!regex.test(username.value))
    message.value = 'Username phải có kí tự chữ, số và không có dấu, kí tự đặc biệt!!!'
  else message.value = ''
}
const addNewUser = async () => {
  checkError()
  if(message.value === ''){
    let user_exits
    await checkExist(username.value)
        .then(message => {
          user_exits = message.data
        })
        .catch(err =>
            console.log(err.response.data)
        );
    message.value = user_exits ? 'Username đã được đăng ký' : ''
    if(!user_exits){
      socket.emit('encodePassword',password.value)
    }
  }
}
const clearUser = () =>{
  username.value =''
  password.value = ''
}
socket.on('getPassword', password => {
    addNewAccount(username.value,password)
        .then(() => {
          clearUser()
          message.value = 'Đăng ký thành công'
          setTimeout(()=>{
            router.push('/sign-in');
            message.value = ''
          },1000)
        })
        .catch(err =>
            console.log(err.response.data)
        );
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