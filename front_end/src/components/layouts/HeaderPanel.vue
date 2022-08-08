<script setup>
import {useRouter} from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="header">
    <span style="text-transform: uppercase" class="clickable mobile" @click="router.push('/')">Vòng quay may mắn</span>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.header{
  height: 50px;
  background-color: brown;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  color: white;
  font-weight: 700
}
@media screen and (max-width: 450px){
  .header{
    justify-content: flex-end;
    .mobile{
      display: none;
    }
  }
}
</style>