<script setup>
import HeaderPanel from "@/components/layouts/HeaderPanel";
import {useRouter} from 'vue-router'
import {computed, onActivated, ref} from "vue";
import {socket} from "@/main";
import {getCoin, checkSeasonPlaying, getUsername, checkLastSeason, joinSeason} from "../../../back_end/api";
import GuidePanel from "@/components/GuidePanel";
import dayjs from "dayjs"
import AdminClient from '@/components/AdminClient'
const router = useRouter()
const onlineUser = ref(0)
const watchUser = ref(0)
const message = ref('')
const showClientAdmin = ref(false)
const seasonAfter = ref('')

const coinInput = ref('')
const coinUser = ref(0)
const countUserJoin = ref(0)
const totalCoins = ref(0)
const coinJoin = ref(0)
const lastUserWin = ref('Chưa có thông tin')
const lastCoinWin = ref(0)
const lastCoinJoin = ref(0)

const idUser = ref('')
const username = ref('')

const timeCountDownMilli = ref(0)

const minute = computed(()=>{
  const minute = Math.floor(timeCountDownMilli.value / 1000 / 60 % 60)
  return minute < 10 ? '0' + minute : minute
})
const second = computed(()=>{
  const second = Math.floor(timeCountDownMilli.value / 1000 % 60)
  return second < 10 ? '0' + second : second
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
  let countDown
  timeCountDownMilli.value = dayjs(timeBegin).add(2, 'minute') - dayjs(new Date())
  if(timeCountDownMilli.value > 0){
    countDown = setInterval(() => {
      if(timeCountDownMilli.value <= 0){
        timeCountDownMilli.value = 0
        clearInterval(countDown)
      }
      else if(second.value % 5 === 0){
        clearInterval(countDown)
        checkSeasonGoing()
      }
      else
        timeCountDownMilli.value = dayjs(timeBegin).add(2, 'minute') - dayjs(new Date())
    }, 0)
  }
}
const updateCoinUser = async () => {
  if(idUser.value)
    await getCoin(idUser.value).then(coin => {
      coinUser.value = coin.data
    })
}
const percent = ref(0)
const stylePercent = computed(() =>{
  return {
    'backgroundColor': 'red',
    'width': percent.value + '%',
    'height': "25px",
    'borderRadius': percent.value === 100? '25px' : '25px 0 0 25px',
    'position': 'relative',
    'transition': 'width 1s'
  }
})
const checkLastSeasonDone = async () => {
  let selectedSeason = seasonAfter.value - 1
  await checkLastSeason(selectedSeason)
      .then(season => {
        lastCoinJoin.value = season.data.coinJoin
        lastUserWin.value = season.data.nameWin
        lastCoinWin.value = season.data.coinWin
      })
}
const checkSeasonGoing = async () => {
  await checkSeasonPlaying ()
      .then(season => {
        if(typeof season.data === "number" ){
          timeCountDownMilli.value = 1000 * 60 * 2
          seasonAfter.value = season.data
          coinJoin.value = 0
        }
        else{
          timeCountDownMilli.value = season.data.timeBegin ? season.data.timeBegin : 1000 * 60 * 2
          coinJoin.value = 0
          for (const userJoin of season.data.listJoin) {
              if(username.value === userJoin.username){
                coinJoin.value += userJoin.coin
              }
          }
          seasonAfter.value = season.data.season
          if(season.data.timeBegin) updateTimeClient(season.data.timeBegin)
        }
      })
}
const joinSeasonClient = async () => {
  let regex = /^\d+$/
  if(timeCountDownMilli.value <= 9000)
    alert('Vxmm đã được khóa lúc 10s')
  else if (coinUser.value - coinJoin.value - coinInput.value < 0)
    alert('Số coin không đủ chơi')
  else if(!regex.test(coinInput.value))
    alert('Vui lòng nhập số đàng hoàng :)))')
  else if((coinJoin.value + coinInput.value) > 10000)
    alert('Vui lòng đặt theo quy định từ 1.000 coin đến 10.000 coin')
  else{
    const data = {
      idUser: idUser.value,
      season: seasonAfter.value,
      username: username.value,
      coinBefore: coinUser.value,
      coinUsed: '-'+coinInput.value,
      coinAfter: coinUser.value - coinInput.value
    }
    await joinSeason (data)
        .then(()=> {
          updateCoinUser()
          socket.emit('join',({coin: coinInput.value,username: username.value, season: seasonAfter.value, idUser: idUser.value}))
          coinJoin.value = Number(coinInput.value)
        })
  }
  coinInput.value = ''
  showInput(false)
}
const getUsernameClient = async () => {
  await getUsername(idUser.value)
      .then(user => {
        username.value = user.data.username
        if (username.value === 'ADMIN'){
          showClientAdmin.value = true
        }
      })
}
socket.on('connect', () => {
  updateOnline()
  updateWatch()
  socket.on('seasonSelect',data => {
    countUserJoin.value = data.countUserJoin
    percent.value = typeof data.percent !== 'number' ? 0 : data.percent
    totalCoins.value = data.totalCoins
    coinJoin.value = data.coinJoin
    checkSeasonGoing()
  })
  socket.on('reload',()=>{
    socket.emit('update')
  })
  socket.on('updateCoin',async ()=>{
    await updateCoinUser()
  })
  socket.on('sendMessage',data => {
    message.value = 'Chúc mừng '+ data.nameWin.toUpperCase() +' đã chiến thắng vxmm với số coin thắng là ' + format(data.coinWin)
  })
  socket.on('anotherLoginIsYou' , () => {
    alert('Có người đã đăng nhập vào tài khoản ở thiết bị khác')
    sessionStorage.removeItem('id_user')
    location.reload()
  })
  socket.on('anotherLogin' ,idClient => {
    socket.emit('who',idClient)
  })
  socket.on('checkLastSeason',async ()=>{
    percent.value = 0
    countUserJoin.value = 0
    totalCoins.value = 0
    await checkSeasonGoing()
    await checkLastSeasonDone()
  })
  socket.on('disconnected', () => {
      socket.emit('disconnectPlay');
      socket.emit('disconnectWatch')
  })
})
onActivated(async ()=>{
  message.value = 'Chào mừng cô bác đến với trò giải trí này :)))'
  await checkSeasonGoing()
  if (seasonAfter.value > 0){
    await checkLastSeasonDone()
  }
  if(sessionStorage.getItem('id_user')){
    idUser.value = sessionStorage.getItem('id_user')
    await updateCoinUser()
    await getUsernameClient()
    socket.emit('signIn',{id: idUser.value,username: username.value})
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
        <span v-if="!showClientAdmin"> Chào {{username.toUpperCase()}}, coin của bạn: {{format(coinUser)}} coin</span>
        <span v-else>Chào sếp, chúc sếp ngày tốt lành!!!</span>
        <button class="clickable" @click="logOut">Log out</button>
      </div>
    </div>
  </header-panel>
  <div class="content" v-if="!showClientAdmin">
    <div class="marquee">
      <p>{{message}}</p>
    </div>
    <div style="display:flex; gap:20px; margin:10px 0; justify-content: center">
      <span>Số người đang online: {{onlineUser}}</span>
      <span>Khách đang xem: {{watchUser}}</span>
    </div>
    <div style="display: flex;gap: 10px; flex-direction: column">
      <div style="color: darkred; font-size: 30px; text-transform: uppercase" class="no-mobile">Vòng quay may mắn</div>
      <div>Season: {{seasonAfter}}</div>
      <div style="color: orange; font-size: 50px"><span v-show="minute > 0">{{minute}}:</span><span>{{second}}<span v-show="minute <= 0">s</span></span></div>
      <div>Tỉ lệ thắng</div>
      <div class="percent-wrapper">
        <div :style="stylePercent"></div>
        <div style="position: absolute;display: flex;justify-content: center;margin-top: -20px;color: yellow;width: 100%">{{percent}} %</div>
      </div>
      <div>{{format(totalCoins)}} coin</div>
      <div>Số người tham gia: {{countUserJoin}}</div>
      <div>Bạn đã tham gia: {{format(coinJoin)}}</div>
      <div></div>
      <div style="color: blue;display: flex; gap: 10px; flex-direction: column">
        <div>Người vừa chiến thắng: {{lastUserWin}}</div>
        <div>Số coin thắng: {{format(lastCoinWin)}}</div>
        <div>Số coin tham gia: {{format(lastCoinJoin)}}</div>
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
  <div v-else>
    <admin-client />
  </div>
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
.marquee {
  color: black;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
}
.marquee p {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 15s linear infinite;
}
@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }
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