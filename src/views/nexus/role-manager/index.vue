<template>
  <div class="placeholder-page p-4">
    <a-card :bordered="false">
      <a-result status="info" title="角色管理" sub-title="此页面功能正在开发中，敬请期待">
        <template #icon>
          <Icon icon="ant-design:team-outlined" :size="72" style="color: #1890ff" />
        </template>
        <template #extra>
          <a-space>
            <a-button type="primary" @click="$router.push('/nexus/dashboard')"> 返回首页 </a-button>
          </a-space>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { Icon } from '/@/components/Icon'
</script>

<style scoped>
  .placeholder-page {
    padding: 0;
  }
</style>
