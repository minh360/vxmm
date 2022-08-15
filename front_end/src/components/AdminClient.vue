<script setup>
import {onActivated, ref} from "vue";
import {changeCoin, checkExist, checkLastSeason, getLogs} from "../../../back_end/api";
import dayjs from "dayjs";
const STATE = {
  CHECK_LOG_USER: 0,
  LOG_SEASON: 1,
  CHANGE_COIN: 2
}
const state = ref(STATE.CHECK_LOG_USER)

const coinsUsed = ref(0)
const coinsReceived = ref(0)
const coinsCheat = ref(0)
const selectedUser = ref('')
const selectedSeason = ref('')
const allLogs = ref([])
const coinAdd = ref('')
const message = ref('')
const coinNow = ref('')
const idUser = ref('')
const getCoinUser = async () => {
  return await checkExist(selectedUser.value)
      .then(async user => {
        if (user.data) {
          coinNow.value = user.data.coin
          idUser.value = user.data._id
        }
        else {
          message.value = 'Không có tài khoản này !!!'
          coinNow.value = ''
        }
      })
}
const getAllLogsUser = async () => {
  coinsReceived.value = 0
  coinsUsed.value = 0
  coinsCheat.value = 0
  if(selectedUser.value !== ''){
    await getCoinUser()
    if(typeof coinNow.value === 'number'){
      await getLogs(selectedUser.value)
          .then(logs => {
            allLogs.value = logs.data
            if(allLogs.value[0]){
              if(typeof selectedSeason.value === 'number'){
                let seasonLogUser = allLogs.value.filter(log => log.season === selectedSeason.value)
                if(seasonLogUser.length >= 1){
                  allLogs.value = seasonLogUser
                  updateCheckLogUser()
                }
                else{
                  message.value = 'Tài khoản không có log nào season '+selectedSeason.value
                }
              }
              else{
                updateCheckLogUser()
              }
            }
            else {
              message.value = 'Tài khoản chưa tham gia trò chơi nào'
            }
          })
    }
  }
}
const updateCheckLogUser = () => {
  let logFirst = allLogs.value[0]
  let coinBegin = logFirst.coinBefore
  for (let log of allLogs.value){
    let coinUsed = Number(log.coinUsed)
    if(coinUsed > 0)
      coinsReceived.value += coinUsed
    else
      coinsUsed.value += coinUsed
    coinBegin += coinUsed
    coinsCheat.value += (log.coinAfter - coinBegin)
  }
  message.value = ''
}
const getAllLogsSeason = async () => {
  await checkLastSeason(selectedSeason.value)
      .then(season => {
        if(typeof season.data === 'number')
          message.value = 'Hiện tại chỉ có ' + season.data + ' season'
        else{
          let result = [season.data]
          let remakeList = []
          let listName = []
          let listCoin = []
          for( let obj of result[0].listJoin){
            let selectedName = obj.username
            let selectedCoin = obj.coin
            if(listName !== []){
              let flag = false
              for( let i = 0; i < listName.length;i++){
                if (selectedName === listName[i]){
                  listCoin[i] += selectedCoin
                  flag = true
                }
              }
              if(!flag) {
                listName.push(selectedName)
                listCoin.push(selectedCoin)
              }
            }
            else{
              listName.push(selectedName)
              listCoin.push(selectedCoin)
            }
          }
          for (let index = 0; index < listName.length; index++){
            remakeList.push({username: listName[index],coin: listCoin[index]})
          }
          result[0].listJoin = remakeList
          allLogs.value = result
          message.value = ''
        }
      })
}
const plusCoinUser = async () => {
  await getCoinUser()
  if(typeof coinNow.value === 'number') {
    const data = {
      id: idUser.value,
      coin: coinAdd.value,
      season: 99999,
      username: selectedUser.value,
      coinBefore: coinNow.value,
    }
    await changeCoin(data)
        .then(()=>{
          message.value = 'Plus '+coinAdd.value+ 'coin successful for '+selectedUser.value
          coinAdd.value = ''
          selectedUser.value = ''
        })
  }
}
const minusCoinUser = async () => {
  await getCoinUser()
  if(typeof coinNow.value === 'number') {
    const data = {
      id: idUser.value,
      coin: -coinAdd.value,
      season: 99999,
      username: selectedUser.value,
      coinBefore: coinNow.value,
    }
    await changeCoin(data)
        .then(()=>{
          message.value = 'Minus '+coinAdd.value+ 'coin successful for '+ selectedUser.value.toUpperCase()
          coinAdd.value = ''
          selectedUser.value = ''
        })
  }
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
const changeState = condition =>{
  state.value = condition
  allLogs.value = []
  selectedSeason.value = ''
  selectedUser.value = ''
  message.value = ''
}
onActivated(()=>{
  message.value = ''
  coinsUsed.value = 0
  coinsReceived.value = 0
  coinsCheat.value = 0
  selectedUser.value = ''
  selectedSeason.value = ''
  allLogs.value = []
  coinAdd.value = ''
  message.value = ''
  coinNow.value = ''
})
</script>

<template>
  <div class="wrapper">
    <section class="col-1">
      <ul>
        <li @click="changeState(STATE.CHECK_LOG_USER)" :class="{active: state === STATE.CHECK_LOG_USER}">Check Log User</li>
        <li @click="changeState(STATE.LOG_SEASON)" :class="{active: state === STATE.LOG_SEASON}">Log Season</li>
        <li @click="changeState(STATE.CHANGE_COIN)" :class="{active: state === STATE.CHANGE_COIN}">Change coin</li>
      </ul>
    </section>
    <div class="col-2">
      <div v-if="state === STATE.CHECK_LOG_USER">
        <div style="margin: 5px 0 10px 0;">
          <p>
            <span>Suspicious account:</span>
            <input placeholder="Enter account name" type="text" v-model="selectedUser">
            <input placeholder="Enter season" type="number" v-model="selectedSeason">
            <button @click="getAllLogsUser">Search</button>
          </p>
        </div>
        <div style="text-align: center">{{selectedUser.toUpperCase()}}</div>
        <p style="display: flex;flex-direction: row;justify-content: space-between"><span>Result</span><span>Coin Now: {{format(coinNow)}} coin</span></p>
        <div style="display: flex;justify-content: space-between;margin: 20px 0; align-content: baseline" v-if="message === ''">
          <div><span style="color: crimson">&darr;&darr;&darr;</span> Used: {{format(coinsUsed)}} coin</div>
          <div style="border-left: 1px solid black" />
          <div><span style="color: green">&uarr;&uarr;&uarr;</span> Received: {{format(coinsReceived)}} coin</div>
          <div style="border-left: 1px solid black" />
          <div><span style="color: red">XXX</span> Cheat: {{format(coinsCheat)}} coin</div>
        </div>
        <div v-else>
          <p style="color: brown">{{message}}</p>
        </div>
        <div v-for="log in allLogs" :key="log._id" style="padding: 10px 0; border-bottom: 1px solid black">
          <div><span style="color: olivedrab">Season: </span>{{log.season}}</div>
          <div><span style="color: olivedrab">Coin Before: </span>{{format(log.coinBefore)}}</div>
          <div><span style="color: olivedrab">Coin After: </span>{{format(log.coinAfter)}}</div>
          <div><span style="color: olivedrab">Coin Used: </span>{{format(log.coinUsed)}}</div>
        </div>
      </div>
      <div v-if="state === STATE.LOG_SEASON">
        <p>
          <span>Season to check: </span>
          <input placeholder="Enter season" type="number" v-model="selectedSeason">
          <button @click="getAllLogsSeason">Search</button>
        </p>
        <div>
          <p>Result</p>
          <div v-for="log in allLogs" :key="log._id">
            <div><span style="color: olivedrab">Season: </span>{{log.season}}</div>
            <div><span style="color: olivedrab">Start time: </span>{{dayjs(log.timeBegin)}}</div>
            <div><span style="color: olivedrab">State: </span>{{log.state}}</div>
            <div><span style="color: olivedrab">Coin Win: </span>{{log.coinWin ? format(log.coinWin) : '...'}}</div>
            <div><span style="color: olivedrab">Name Win: </span>{{log.nameWin ? log.nameWin : '...'}}</div>
            <div><span style="color: olivedrab">Coin Join: </span>{{log.coinJoin ? format(log.coinJoin) : '...'}}</div>
            <p>Participant list</p>
            <div v-for="obj in log.listJoin" :key="obj" style="border-bottom: 1px solid black;display: grid;grid-template-columns: 1fr 1fr;grid-gap: 10px">
              <div>{{obj.username.toUpperCase()}}</div>
              <div>{{format(obj.coin)}} coin</div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="state === STATE.CHANGE_COIN">
        <p>
          <span>Account:</span>
          <input placeholder="Enter account name" type="text" v-model="selectedUser">
          <input placeholder="Enter coin" type="number" v-model="coinAdd">
          <button @click="plusCoinUser">Plus</button>
          <button @click="minusCoinUser">Minus</button>
        </p>
        <div v-show="message !== ''">
          Result:
          <p style="color: green">{{message}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper{
  display: grid;
  grid-template-columns: 2fr 6fr;
  height: 100vh;
  font-size: 20px;
  font-weight: 700;
  .col-1{
    background-color: rosybrown;
    ul{
      list-style-type: none;
      margin: 0;
      padding: 0;
      li{
          min-height: 25px;
          border-bottom: 2px solid black;
          padding: 10px 0;
          text-transform: uppercase;
        &:hover{
          padding-left: 10px;
          cursor: pointer;
          color: white;
        }
        &.active{
          color: green;
        }
      }
    }
  }
  .col-2{
    padding: 10px;
    button{
      min-width: 50px;
      background-color: rosybrown;
      margin: 0 10px;
      height: 50px;
      border-radius: 10px;
      &:hover{
        background-color: brown;
        cursor: pointer;
      }
    }
    input{
      height: 25px;
      padding: 10px;
      border-radius: 10px;
      margin: 0 10px;
    }
  }
}
</style>