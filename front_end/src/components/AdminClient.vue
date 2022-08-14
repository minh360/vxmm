<script setup>
import {ref} from "vue";
import {checkExist, getLogs} from "../../../back_end/api";

const STATE = {
  CHECK_LOG_USER: 0,
  LOG_SEASON: 1,
  ADD_COIN: 2
}
const state = ref(STATE.CHECK_LOG_USER)

const coinsUsed = ref(0)
const coinsReceived = ref(0)
const coinsCheat = ref(0)
const selectedUser = ref('')
const selectedSeason = ref('')
const allLogs = ref([])
const getAllLogs = async () => {
  coinsReceived.value = 0
  coinsUsed.value = 0
  coinsCheat.value = 0
  if(selectedUser.value !== ''){
    let coinNow = 0
    await checkExist(selectedUser.value)
        .then(async user => {
              if(user.data){
                coinNow = user.data.coin
                await getLogs(selectedUser.value)
                    .then(logs => {
                      allLogs.value = logs.data
                      if(allLogs.value[0]){
                        if(typeof selectedSeason.value === 'number'){
                          allLogs.value = allLogs.value.filter(log => log.season === selectedSeason.value)
                        }
                        else{
                          let logFirst = allLogs.value[0]
                          let coinBegin = logFirst.coinBefore
                          for (let log of allLogs.value){
                            let coinUsed = Number(log.coinUsed)
                            if(coinUsed > 0)
                              coinsReceived.value += coinUsed
                            else
                              coinsUsed.value += coinUsed
                            coinBegin += coinUsed
                          }
                          coinsCheat.value = coinNow - coinBegin
                        }
                      }
                      else {
                        alert('Tài khoản chưa tham gia trò chơi nào')
                      }
                    })
              }
              else {
                alert('Không có tài khoản này !!!')
              }
            }
        )
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
}
</script>

<template>
  <div class="wrapper">
    <section class="col-1">
      <ul>
        <li @click="changeState(STATE.CHECK_LOG_USER)" :class="{active: state === STATE.CHECK_LOG_USER}">Check Log User</li>
        <li @click="changeState(STATE.LOG_SEASON)" :class="{active: state === STATE.LOG_SEASON}">Log Season</li>
        <li @click="changeState(STATE.ADD_COIN)" :class="{active: state === STATE.ADD_COIN}">Add coin for user</li>
      </ul>
    </section>
    <div class="col-2">
      <div v-if="state === STATE.CHECK_LOG_USER">
        <div style="margin: 5px 0 10px 0;">
          <p>
            Suspicious account:
            <input placeholder="Enter account name" type="text" v-model="selectedUser">
            <input placeholder="Enter season" type="number" v-model="selectedSeason">
            <button @click="getAllLogs">Search</button>
          </p>
        </div>
        Result
        <div style="display: flex;justify-content: space-between;margin: 20px 0; align-content: baseline" v-show="selectedSeason === ''">
          <div><span style="color: crimson">&darr;&darr;&darr;</span> Used: {{format(coinsUsed)}} coin</div>
          <div style="border-left: 1px solid black" />
          <div><span style="color: green">&uarr;&uarr;&uarr;</span> Received: {{format(coinsReceived)}} coin</div>
          <div style="border-left: 1px solid black" />
          <div><span style="color: red">XXX</span> Cheat: {{format(coinsCheat)}} coin</div>
        </div>
        <div v-for="log in allLogs" :key="log._id" style="padding: 10px 0; border-bottom: 1px solid black">
          <div><span style="color: olivedrab">Season: </span>{{log.season}}</div>
          <div><span style="color: olivedrab">Coin Before: </span>{{format(log.coinBefore)}}</div>
          <div><span style="color: olivedrab">Coin After: </span>{{format(log.coinAfter)}}</div>
          <div><span style="color: olivedrab">Coin Used: </span>{{format(log.coinUsed)}}</div>
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
      background-color: rosybrown;
      margin: 0 10px;
      height: 50px;
      &:hover{
        background-color: brown;
        cursor: pointer;
      }
    }
    input{
      height: 25px;
      padding: 10px;
      border-radius: 10px;
    }
  }
}
</style>