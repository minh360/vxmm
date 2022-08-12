<script setup>
import {defineEmits} from "vue";
const emits = defineEmits(['showGuide'])
</script>
<template>
  <div class="clickable guide-wrapper" @click="emits('showGuide',false)">
    <div style="text-align: center;text-transform: uppercase; color: brown">Hướng dẫn chơi game</div>
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
<style lang="scss" scoped>
.guide-wrapper{
  backdrop-filter: blur(8px);
  position: absolute;
  z-index: 10;
  top: 0;
  padding: 20px;
  font-weight: 700;
  font-size: 25px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center
}
</style>