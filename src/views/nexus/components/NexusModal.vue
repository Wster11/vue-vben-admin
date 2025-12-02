<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="nexus-modal-mask" @click="handleMaskClick">
        <div class="nexus-modal-wrapper">
          <div
            class="nexus-modal-container"
            :style="{ width: width || '600px', maxWidth: '95vw' }"
            @click.stop
          >
            <!-- Header -->
            <div class="nexus-modal-header">
              <h3 class="nexus-modal-title">{{ title }}</h3>
              <button class="nexus-modal-close" @click="handleClose" aria-label="关闭">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="nexus-modal-body">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="nexus-modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
  import { watch } from 'vue'

  interface Props {
    visible: boolean
    title?: string
    width?: string
    maskClosable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '提示',
    width: '600px',
    maskClosable: true,
  })

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'close'): void
  }>()

  const handleClose = () => {
    emit('update:visible', false)
    emit('close')
  }

  const handleMaskClick = () => {
    if (props.maskClosable) {
      handleClose()
    }
  }

  // 监听 visible 变化，控制 body 滚动
  watch(
    () => props.visible,
    (val) => {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
  )
</script>

<style scoped>
  .nexus-modal-mask {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;
  }

  .nexus-modal-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    width: 100%;
  }

  .nexus-modal-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    margin: auto;
  }

  .nexus-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .nexus-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .nexus-modal-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .nexus-modal-close:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  .nexus-modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .nexus-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
  }

  /* Transition */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-active .nexus-modal-container,
  .modal-leave-active .nexus-modal-container {
    transition: transform 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from .nexus-modal-container,
  .modal-leave-to .nexus-modal-container {
    transform: scale(0.9);
  }
</style>
