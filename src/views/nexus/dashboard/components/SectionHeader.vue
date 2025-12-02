<template>
  <div class="section-header">
    <div class="section-left">
      <div :class="['section-bar', `section-bar-${color}`]"></div>
      <h3 class="section-title">{{ title }}</h3>
      <span v-if="count !== undefined" class="section-count">{{ count }}</span>
    </div>
    <button class="section-more" @click="$emit('click-more')">
      查看全部
      <Icon icon="ant-design:arrow-right-outlined" :size="16" />
    </button>
  </div>
</template>

<script lang="ts" setup>
  import { Icon } from '/@/components/Icon'

  interface Props {
    title: string
    count?: number
    color: 'indigo' | 'blue'
  }

  defineProps<Props>()
  defineEmits<{
    (e: 'click-more'): void
  }>()
</script>

<style scoped>
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;
  }

  .section-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-bar {
    width: 4px;
    height: 24px;
    border-radius: 2px;
  }

  .section-bar-indigo {
    background: #6366f1;
  }

  .section-bar-blue {
    background: #3b82f6;
  }

  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .section-count {
    padding: 2px 8px;
    background: #f3f4f6;
    color: #374151;
    font-size: 12px;
    border-radius: 12px;
    font-weight: 500;
  }

  .section-more {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #6366f1;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .section-more:hover {
    color: #4f46e5;
    background: #f5f7ff;
  }

  .section-more:hover :deep(svg) {
    transform: translateX(2px);
  }

  .section-more :deep(svg) {
    transition: transform 0.2s;
  }
</style>
