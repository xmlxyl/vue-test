<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 路由页面自行控制全屏布局 */
#app {
  max-width: none;
  margin: 0;
  padding: 0;
}
</style>
