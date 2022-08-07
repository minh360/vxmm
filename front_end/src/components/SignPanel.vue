<template>
  <div class="content">
    <div style="display: flex;flex-direction: column;justify-content: center;gap: 10px;min-width: 300px;width: auto">
      <div class="name">VXMM ACCOUNT</div>
      <slot />
    </div>
    <div style="display: flex;justify-content: center">
      <img src="../assets/banner.jpg" alt=""/>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.content{
  display: flex;
  justify-content: flex-end;
  flex-direction: column-reverse;
  min-height: 700px;
  padding: 0 10%;
  margin-bottom: 25px;
  font-weight: 700;
  gap: 25px;
  .name{
    font-weight: 700;
    font-size: 25px;
    color: darkred;
    font-style: italic;
    width: 190px;
  }
}
img{
  margin-top: 40px;
  max-height: 50%;
  max-width: 50%;
}
@media screen and (min-width: 800px){
  .content{
    flex-direction: row;
    gap: 5%;
    padding: 0 5%;
    justify-content: center;
    input, button{
      box-sizing: border-box;
      max-width: 500px;
    }
  }
  img{
    align-items: center;
    margin-top: 200px;
    max-height: 60%;
    max-width: 60%;
  }
}
</style>