import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import { message } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'video.js/dist/video-js.css'

import router from './router'
import '@renderer/styles/index.scss'

import DeskLyric from './components/desk-lyric.vue'
import Iconfont from './components/iconfont.vue'
import Loading from './components/loading.vue'
import InfiniteScroll from './components/infiniteScroll.vue'
import SongTable from './components/song-table.vue'
import CommentList from './components/comment-list.vue'
import Slider from './components/slider.vue'
import PlayingIcon from './components/playing-icon.vue'
import Scroller from './components/scroller.vue'

import global from './plugins/global'
import { getOS } from './utils/common'

message.config({
  top: `50%`,
  duration: 1,
  maxCount: 2,
})

// 给body添加一个代表当前os的class
document.body.classList.add(getOS())

let app = createApp(App)
if (location.search.includes('desk-lyric')) {
  app = createApp(DeskLyric)
}

const pinia = createPinia()

app.component('Iconfont', Iconfont)
app.component('Loading', Loading)
app.component('InfiniteScroll', InfiniteScroll)
app.component('SongTable', SongTable)
app.component('CommentList', CommentList)
app.component('Slider', Slider)
app.component('PlayingIcon', PlayingIcon)
app.component('Scroller', Scroller)

app.use(router)
app.use(pinia)
app.use(global)
app.use(Antd)
app.mount('#app')
