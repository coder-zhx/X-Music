<script setup lang="ts">
import { Comment } from '@renderer/common/types/music'

defineProps({
  list: {
    type: Array<Comment>,
    default: () => [],
  },
})
</script>

<template>
  <div v-for="item in list" :key="item.commentId" class="comment-item">
    <div class="user-info">
      <img class="avatar" :src="item.user.avatarUrl + '?param=50y50'" alt="" />
      <div>
        <div class="user-name">{{ item.user.nickname }}</div>
        <div class="time">
          {{ $dateFormat(item.time) }}
          <span class="ip">来自{{ item.ipLocation.location }}</span>
        </div>
      </div>
    </div>
    <div v-if="item.beReplied?.length" class="sub-comment-box">
      <div v-for="sub in item.beReplied" :key="sub.id" class="sub">
        <span class="sub-user-info"> @{{ sub.user.nickname }}： </span>
        <span class="content">{{ sub.content }}</span>
      </div>
    </div>
    <div class="comment">{{ item.content }}</div>
  </div>
</template>

<style lang="scss" scoped>
.comment-item {
  margin-bottom: 20px;
  line-height: normal;
}
.user-info {
  display: flex;
  gap: 10px;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: $bg-card;
  }

  .user-name {
    font-size: 14px;
  }

  .time {
    font-size: 12px;
    opacity: 0.6;
    font-weight: 400;
    margin-top: 5px;

    .ip {
      margin-left: 10px;
    }
  }
}
.comment {
  margin-top: 10px;
  margin-left: 50px;
}
.sub-comment-box {
  position: relative;
  margin-top: 10px;
  margin-left: 50px;
  padding: 10px;

  &::before {
    position: absolute;
    content: '';
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    border-radius: 4px;
    background-color: $bg-card;
    transition-duration: 0.5s;
    transition-property: background;
    opacity: 0.6;
  }

  .sub {
    position: relative;
    z-index: 1;
  }

  .sub-user-info {
    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }
  }
}
</style>
