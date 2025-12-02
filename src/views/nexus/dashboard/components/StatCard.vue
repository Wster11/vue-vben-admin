<template>
  <div class="stat-card">
    <div class="stat-header">
      <div :class="['stat-icon', `stat-icon-${color}`]">
        <Icon :icon="iconMap[icon]" :size="24" />
      </div>
      <span v-if="subText" class="stat-sub-text">{{ subText }}</span>
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <div class="stat-value-row">
        <span class="stat-value">{{ value }}</span>
        <span class="stat-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Icon } from '/@/components/Icon'

  interface Props {
    icon: string
    label: string
    value: number | string
    unit: string
    color: 'slate' | 'blue' | 'indigo' | 'emerald'
    subText?: string
  }

  defineProps<Props>()

  const iconMap = {
    HardDrive: 'ant-design:hdd-outlined',
    FileText: 'ant-design:file-text-outlined',
    Link2: 'ant-design:link-outlined',
    QrCode: 'ant-design:qrcode-outlined',
  }
</script>

<style scoped>
  .stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
  }

  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .stat-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon-slate {
    background: #f1f5f9;
    color: #475569;
  }

  .stat-icon-blue {
    background: #dbeafe;
    color: #2563eb;
  }

  .stat-icon-indigo {
    background: #e0e7ff;
    color: #6366f1;
  }

  .stat-icon-emerald {
    background: #d1fae5;
    color: #059669;
  }

  .stat-sub-text {
    font-size: 12px;
    font-weight: 500;
    color: #9ca3af;
    background: #f9fafb;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .stat-label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    margin: 0 0 8px 0;
  }

  .stat-value-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
  }

  .stat-unit {
    font-size: 14px;
    font-weight: 500;
    color: #9ca3af;
  }
</style>
