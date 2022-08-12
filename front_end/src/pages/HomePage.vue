<script setup>
import HeaderPanel from "@/components/layouts/HeaderPanel";
import {useRouter} from 'vue-router'
import {computed, onActivated, ref, watch} from "vue";
import {socket} from "@/main";
import {joinSeason, updateCoin, checkSeasonPlaying, getUserName} from "../../../back_end/api";
import GuidePanel from "@/components/GuidePanel";
import dayjs from "dayjs"
const router = useRouter()
const onlineUser = ref(0)
const watchUser = ref(0)
const message = ref('')

let seasonAfter

const coinInput = ref('')
const coinUser = ref(0)
const countUserJoin = ref(0)
const coinWin = ref(0)
const coinJoin = ref(0)
const lastUserWin = ref('')
const lastCoinWin = ref(0)
const lastCoinJoin = ref(0)

const idUser = ref('')
const userName = ref('')

let countDown
const timeCountDownMilli = ref(0)

const minute = computed(()=>{
  const minute = Math.floor(timeCountDownMilli.value / 1000 / 60 % 60)
  return minute < 9 ? '0' + minute : minute
})
const second = computed(()=>{
  const second = Math.floor(timeCountDownMilli.value / 1000 % 60)
  return second < 9 ? '0' + second : second
})
const logOut = () => {
  sessionStorage.removeItem('id_user')
  location.reload()
}
const updateWatch = () => {
  socket.on('reportWatch', amount => {
    watchUser.value = amount
  })
}
const updateOnline = () => {
  socket.on('reportOnline', amount => {
    onlineUser.value = amount
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
    if (i % 3 === 0 && i !== len) {
      result = ',' + result
    }
  }
  return result
}
const updateTimeClient = async timeBegin => {
  timeCountDownMilli.value = dayjs(new Date()) - dayjs(timeBegin).add(2, 'minute')
  console.log(timeCountDownMilli.value)
  countDown = setInterval(() => timeCountDownMilli.value - 1000, 1000)
}
watch(timeCountDownMilli,  (newValue) => {
  if(newValue <= 0){
    clearInterval(countDown)
  }
  else if(newValue % 5 === 0){
    clearInterval(countDown)
    checkSeasonGoing()
  }
})
const updateCoinUser = async () => {
  if(idUser.value)
    await updateCoin(idUser.value).then(coin => {
      coinUser.value = coin.data
    })
}
const percentWin = ref(100)
const stylePercent = computed(() =>{
  return {
    'backgroundColor': 'red',
    'width': percentWin.value + '%',
    'height': "25px",
    'borderRadius': percentWin.value === 100? '25px' : '25px 0 0 25px',
    'position': 'relative',
    'transition': 'width 1s'
  }
})

const checkSeasonGoing = async () => {
  await checkSeasonPlaying ()
      .then(season => {
        if(typeof season.data === "number" ){
          timeCountDownMilli.value = 1000 * 60 * 2
          seasonAfter = season.data
        }
        else
          updateTimeClient(season.data.timeBegin)
      })
}
const joinSeasonClient = async () => {
  console.log(userName.value)
  const data = {
    idUser: idUser.value,
    season: seasonAfter,
    userName: userName.value,
    coinBefore: coinUser.value,
    coinUsed: coinInput.value,
    coinAfter: coinUser.value - coinInput.value
  }
  await joinSeason (data)
      .then(()=> {
        updateCoinUser()
        // socket.emit('join',coinInput)
      })
}
socket.on('connect', () => {
  updateOnline()
  updateWatch()
  socket.on('disconnected', () => {
      socket.emit('disconnectPlay');
      socket.emit('disconnectWatch')
  })
})
const getUserNameClient = async () => {
  await getUserName(idUser.value)
      .then(user => {
        userName.value = user.data.userName
      })
}
onActivated(()=>{
  message.value = 'Chào mừng cô bác đến với trò giải trí này :)))'
  checkSeasonGoing()
  if(sessionStorage.getItem('id_user')){
    idUser.value = sessionStorage.getItem('id_user')
    getUserNameClient()
    socket.emit('signIn',idUser.value)
    updateCoinUser()
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
      <span>Số người đang online: {{onlineUser}}</span>
      <span>Khách đang xem: {{watchUser}}</span>
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

      <input type="number" v-show="input" style="margin: 0 30%; height: 25px; border-radius: 25px; padding: 0 10px" v-model="coinInput"/>

      <button v-if="idUser && !input" style="margin: 0 30%; height: 30px;" class="clickable" @click="showInput(true)">Tham gia</button>
      <div v-if="idUser && input" style="display: flex; gap: 20px;justify-content: center;margin: 20px 0">
        <button style="height: 30px;width: 20%" class="clickable" @click="joinSeasonClient">Tham gia</button>
        <button style="height: 30px;width: 20%" @click="showInput(false)">Đóng</button>
      </div>

      <button v-if="!idUser" style="margin: 0 30%;height: 30px" class="clickable" @click="showGuide(true)">Hướng dẫn</button>
    </div>
  </div>
  <template v-if="!idUser && guide">
    <guide-panel @show-guide="showGuide"/>
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