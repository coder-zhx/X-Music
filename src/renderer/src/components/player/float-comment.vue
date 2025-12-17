<script setup lang="ts">
import { getSongComment } from '@renderer/api'
import { ref, computed, onUnmounted, watch } from 'vue'
import { uniqBy } from 'lodash-es'
import { Comment } from '@renderer/common/types/music'
import playService from '@renderer/service/playService'

const comments = ref<Comment[]>([])
const currentIndex = ref(-1)
let timer
let timer2

const currentComment = computed(() => {
  if (comments.value.length === 0) return null
  return comments.value[currentIndex.value]
})

watch(
  () => playService.state.value.curSong,
  async (curSong) => {
    if (curSong) {
      stopAnimation()
      comments.value = []
      currentIndex.value = -1
      await getCommentList(curSong.id)
      timer2 = setTimeout(() => {
        currentIndex.value = 0
        startAnimation()
      }, 3000)
    }
  },
  { immediate: true },
)

async function getCommentList(id) {
  const res = await getSongComment({
    id: id,
    pageNum: 1,
    pageSize: 100,
  })
  comments.value = uniqBy(res?.comments || [], 'content')
}

function startAnimation() {
  if (timer) clearInterval(timer)

  timer = window.setInterval(() => {
    if (comments.value.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % comments.value.length
    }
  }, 3000)
}

function stopAnimation() {
  if (timer) {
    clearInterval(timer)
  }
}

onUnmounted(() => {
  stopAnimation()
  if (timer2) {
    clearTimeout(timer2)
  }
})
</script>

<template>
  <div class="floating-comments" @mouseenter="stopAnimation" @mouseleave="startAnimation">
    <transition name="comment-fade" mode="out-in">
      <div v-if="currentComment" :key="currentComment.commentId" class="comment-item">
        <div class="comment-content">
          <img
            v-if="currentComment.user?.avatarUrl"
            class="avatar"
            :src="currentComment.user.avatarUrl + '?param=50y50'"
          />
          <span class="text">{{ currentComment.content }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.floating-comments {
  position: fixed;
  bottom: 20vh;
  left: 20px;
  z-index: 100;
  max-width: 50vw;
  transform: translateY(50%);

  .comment-item {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 16px;
    margin: 0 auto;
    animation-duration: 0.5s;
  }

  .comment-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .text {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }
  }
}

.comment-fade-enter-active {
  animation: fadeInUp 0.5s ease-out forwards;
}

.comment-fade-leave-active {
  animation: fadeOutUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutUp {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
