<script setup>
import HeaderPanel from "@/components/layouts/HeaderPanel";
import {useRouter} from 'vue-router'
import {onActivated, ref} from "vue";
import {socket} from "@/main";
import axios from "axios";
const router = useRouter()
const online = ref(0)
const watch = ref(0)
const coinUser = ref(0)
const idUser = ref()
const logOut = () => {
  sessionStorage.removeItem('id_user')
  location.reload()
}
const updateWatch = () => {
  socket.on('reportWatch', amount => {
    watch.value = amount
  })
}
const updateOnline = () => {
  socket.on('reportOnline', amount => {
    console.log(amount,1)
    online.value = amount
  })
}
const format = number => {
  let result = ''
  const len = number.toString().length
  for (let i = 1; i <= len; i++ ) {
    result = number.toString()[len - i] + result
    if (i % 3 === 0 && i !== 0) {
      result = ',' + result
    }
  }
  return result
}
const updateCoin = async () => {
  if(idUser.value){
    await axios.request({
      method: "POST",
      url: "http://localhost:3000/auth/get_coin/" + idUser.value,
      headers: {
        'Authorization': 'token'
      },
      timeout: 3000
    })
        .then((coin) => {
          coinUser.value = coin.data
        })
  }
}
socket.on('connect', () => {
  updateOnline()
  updateWatch()
  console.log('Connect successful')
  socket.on('disconnected', () => {
      socket.emit('disconnectPlay');
      socket.emit('disconnectWatch')
  })
})
onActivated(()=>{
  if(sessionStorage.getItem('id_user')){
    idUser.value = sessionStorage.getItem('id_user')
    socket.emit('signIn')
    updateCoin()
  }
})
</script>

<template>
  <header-panel>
    <div v-if="!idUser">
      <div style="display: flex;gap: 20px">
        <button class="clickable" @click="router.push('/sign-in')">Sign In</button>
        <button class="clickable" @click="router.push('/sign-up')">Sign Up</button>
      </div>
    </div>
    <div v-else>
      <div style="display: flex;gap: 20px">
        <span>Số coin: {{format(coinUser)}}</span>
        <button class="clickable" @click="logOut">Log out</button>
      </div>
    </div>
  </header-panel>
  <div class="content">
    <div style="display: flex;justify-content: center; gap:20px;margin-top:20px;font-weight: 700">
      <span>Số người đang online: {{online}}</span>
      <span>Khách đang xem: {{watch}}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
button{
  height: 25px ;
  border-radius: 10px;
  background-color: bisque;
  color: darkred;
  font-weight: 700;
}
</style>