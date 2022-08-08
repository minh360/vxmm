<script setup>
import HeaderPanel from "@/components/layouts/HeaderPanel";
import {useRouter} from 'vue-router'
import {computed, onActivated, ref} from "vue";
import {socket} from "@/main";
import axios from "axios";
// import dayjs from "dayjs"
const router = useRouter()
const online = ref(0)
const watch = ref(0)
const message = ref('')

const coinUser = ref(0)
const countUserJoin = ref(0)
const coinWin = ref(0)
const coinJoin = ref(0)
const lastUserWin = ref('')
const lastCoinWin = ref(0)
const lastCoinJoin = ref(0)

const idUser = ref()

const timeCountDown = ref((1000 * 60) * 2 )
const minute = computed(()=>{
  const minute = Math.floor(timeCountDown.value / 1000 / 60 % 60)
  return minute < 9 ? '0' + minute : minute
})
const second = computed(()=>{
  const second = Math.floor(timeCountDown.value / 1000 % 60)
  return second < 9 ? '0' + second : second
})
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
    online.value = amount
  })
}
const input = ref(false)
const showInput = condition => {
  input.value = condition
}

const guide = ref(false)
const showGuide = condition =>{
  guide.value = condition
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
// const updateTime = async () => {
//   await axios.request({
//     method: "GET",
//     url: "http://localhost:3000/season/checking",
//     headers: {
//       'Authorization': 'token'
//     }
//   })
//       .then((season) => {
//         timeCountDown.value = dayjs(new Date()) - dayjs(season.data.begin)
//       })
// }
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
const percentWin = ref(25)
const stylePercent = computed(() =>{
  return {
    'backgroundColor': 'red',
    'width': percentWin.value + '%',
    'height': "25px",
    'borderRadius': '25px 0 0 25px',
    'position': 'relative',
    'transition': 'width 1s'
  }
})
socket.on('connect', () => {
  updateOnline()
  updateWatch()
  socket.on('disconnected', () => {
      socket.emit('disconnectPlay');
      socket.emit('disconnectWatch')
  })
})
onActivated(()=>{
  message.value = 'Chào mừng cô bác với trò giải trí này :)))'
  if(sessionStorage.getItem('id_user')){
    idUser.value = sessionStorage.getItem('id_user')
    socket.emit('signIn',idUser.value)
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
    <marquee>{{message}}</marquee>
    <div style="display:flex; gap:20px; margin:10px 0; justify-content: center">
      <span>Số người đang online: {{online}}</span>
      <span>Khách đang xem: {{watch}}</span>
    </div>
    <div style="display: flex;gap: 10px; flex-direction: column">
      <div style="color: darkred; font-size: 30px; text-transform: uppercase" class="no-mobile">Vòng quay may mắn</div>
      <div style="color: orange; font-size: 50px"><span v-if="minute > 0">{{minute}}:</span><span>{{second}}</span></div>
      <div>Tỉ lệ thắng</div>
      <div class="percent-wrapper">
        <div :style="stylePercent"></div>
        <div style="position: absolute;margin: -20px 49% 0;color: yellow">{{percentWin}}%</div>
      </div>
      <div>{{coinWin}} coin</div>
      <div>Số người tham gia: {{countUserJoin}}</div>
      <div>Bạn đã tham gia: {{coinJoin}}</div>
      <div></div>
      <div style="color: blue;display: flex; gap: 10px; flex-direction: column">
        <div>Người vừa chiến thắng: {{lastUserWin}}</div>
        <div>Số coin thắng: {{lastCoinWin}}</div>
        <div>Số coin tham gia: {{lastCoinJoin}}</div>
      </div>

      <div style="height: 2px"></div>

      <input type="number" v-show="input" style="margin: 0 30%; height: 25px; border-radius: 25px; padding: 0 10px"/>

      <button v-if="idUser && !input" style="margin: 0 30%; height: 30px;" class="clickable" @click="showInput(true)">Tham gia</button>
      <div v-if="idUser && input" style="display: flex; gap: 20px;justify-content: center;margin: 20px 0">
        <button style="height: 30px;width: 20%" class="clickable">Tham gia</button>
        <button style="height: 30px;width: 20%" @click="showInput(false)">Đóng</button>
      </div>

      <button v-if="!idUser" style="margin: 0 30%;height: 30px" class="clickable" @click="showGuide(true)">Hướng dẫn</button>
    </div>
  </div>
  <template v-if="!idUser && guide">
    <div class="clickable" style="backdrop-filter: blur(8px);position: absolute; z-index: 10;top: 0;padding: 20px;font-weight: 700;font-size: 25px;height: 100vh" @click="showGuide(false)">
      <div style="text-align: center;text-transform: uppercase">Hướng dẫn chơi game</div>
      <div>
        <ul>
          <li>Vòng quay sẽ diễn ra trong vòng 2 phút, khi có 2 người tham gia thờ gian sẽ đếm ngược, khi còn 10s thì người chơi
            mới sẽ không tham gia được vòng quay mà phải chờ vòng quay tiếp theo</li>
          <li>Số coin có thể đặt được là: 1,000 coin - 10,000 coin</li>
          <li>
            Người chơi chiến thắng sẽ nhận được tổng số coin đã được đặt cược tại vòng sau khi trừ đi phần trăm phí giao dịch ứng với số coin và người tham gia:
            <ul>
              <li>Dưới 10 người tham gia, phần trăm sẽ là số người chơi - 1%</li>
              <li>Trên 10 người tham gia thì phí giao dịch sẽ là 10%</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </template>
</template>

<style lang="scss" scoped>
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}
button{
  border-radius: 10px;
  background-color: bisque;
  color: darkred;
  font-weight: 700;
  padding: 0 10px;
  height: 25px;
}
.content{
  background-color: linen;
  text-align: center;
  font-weight: 700;
  height: 100vh;
  .no-mobile{
    display: none;
  }
  .percent-wrapper{
    border: 2px solid black;
    border-radius: 25px;
    height: 25px;
    width: 80%;
    margin: 0 auto;
    position: relative;
    background-color: black;
  }
}
@media screen and (max-width: 450px){
  .content{
    .no-mobile{
      display: block;
    }
  }
}
</style>