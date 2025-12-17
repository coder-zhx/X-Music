import { Playlist, Singer, Toplist } from '@renderer/common/types/music'
import { urlEncode } from '@renderer/utils/common'
import http from '@renderer/utils/http'
import { sampleSize } from 'lodash-es'
import storeService from '@renderer/service/storeService'

let baseUrl = ''
storeService.get('apiServerPort').then((port) => {
  baseUrl = `http://localhost:${port}`
})

interface Res {
  code: number
  [key: string]: any
}

/**
 * 首页推荐数据
 */
export async function getRecommendData() {
  const results = await Promise.all([getRecommendPlaylist(), getRecommendSinger(), getToplist()])
  return {
    recommendPlaylist: results[0],
    recommendSinger: results[1],
    recommendToplist: results[2].slice(0, 4),
  }
}

/**
 * 获取推荐歌单
 */
export async function getRecommendPlaylist(): Promise<Playlist[]> {
  const res: Res = await http.get(`${baseUrl}/personalized?limit=60`)
  if (res.code === 200) {
    return sampleSize(res.result, 12)
  }
  return []
}

/**
 * 获取推荐歌手
 */
export async function getRecommendSinger(): Promise<Singer[]> {
  const res: Res = await http.get(`${baseUrl}/top/artists?offset=0&limit=60`)
  if (res.code === 200) {
    return sampleSize(res.artists, 6)
  }
  return []
}

/**
 * 获取歌手列表
 */
export async function getSingerList(param: {
  pageNum: number
  pageSize: number
  type?: number
  area?: number
  initial?: number
}): Promise<any> {
  const limit = param.pageSize
  const offset = (param.pageNum - 1) * param.pageSize

  const params = {
    limit,
    offset,
    type: param.type ?? -1,
    area: param.area ?? -1,
    initial: param.initial,
  }
  return await http.get(`${baseUrl}/artist/list`, { params })
}

/**
 * 获取歌单列表
 */
export async function getPlaylist(param: { pageNum: number; pageSize: number; cat: string }) {
  const params = {
    limit: param.pageSize,
    offset: (param.pageNum - 1) * param.pageSize,
    cat: param.cat,
  }
  return await http.get(`${baseUrl}/top/playlist`, { params })
}

/**
 * 获取歌单详情
 */
export async function getPlaylistDetail(id: number) {
  const res: Res = await http.get(`${baseUrl}/playlist/detail?id=${id}`)
  if (res.code === 200) {
    const ids = res.playlist.trackIds.map((t) => t.id).join()
    const res2: Res = await http.get(`${baseUrl}/song/detail?ids=${ids}`)
    if (res2.code === 200) {
      res.playlist.tracks = res2.songs
    }
  }
  return res
}

/**
 * 获取评论列表
 */
export async function getCommentList(param: {
  threadId: string
  pageNum: number
  pageSize: number
  cursor: string
}): Promise<any> {
  const body = window.asrsea({
    rid: param.threadId,
    threadId: param.threadId,
    pageNo: param.pageNum,
    pageSize: param.pageSize,
    cursor: param.cursor,
    offset: '0',
    orderType: '1',
    csrf_token: '',
  })
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  return await http.post('https://music.163.com/weapi/comment/resource/comments/get', body, config)
}

/**
 * 获取歌曲详情
 */
export async function getSongDetail(id: number): Promise<any> {
  const res: Res = await http.get(`${baseUrl}/song/detail`, { params: { ids: id } })
  if (res.code === 200) {
    return res.songs[0]
  }
}

/**
 * 获取歌曲音质详情
 */
export async function getSongMusicDetail(id: number): Promise<any> {
  const res: Res = await http.get(`${baseUrl}/song/music/detail`, { params: { id } })
  if (res.code === 200) {
    return res.data
  }
}

/**
 * 获取歌曲url
 */
export async function getSongUrl(id: number, br: number): Promise<any> {
  const body = new URLSearchParams()
  body.append('types', 'url')
  body.append('id', String(id))
  body.append('source', 'netease')
  body.append('br', String(br || 320))
  body.append('s', window.crc32(urlEncode(String(id))))
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  return await http.post('https://music.gdstudio.org/api.php', body, config)
}

/**
 * 获取歌词
 */
export async function getLyric(id: number): Promise<any> {
  return await http.get(`${baseUrl}/lyric?id=${id}`)
}

/**
 * 搜索建议
 */
export async function getSuggest(keyword: string): Promise<any> {
  const body = window.asrsea({ s: keyword })
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  return await http.post(
    'https://interface.music.163.com/weapi/search/suggest/keyword',
    body,
    config,
  )
}

/**
 * 搜索歌单、歌手、专辑
 */
export async function getSuggestMultimatch(keyword: string): Promise<any> {
  const body = window.asrsea({ s: keyword })
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  return await http.post(
    'https://interface.music.163.com/weapi/search/suggest/multimatch',
    body,
    config,
  )
}

/**
 * 搜索歌曲
 */
export async function searchSongs(param: {
  keyword: string
  pageNum: number
  pageSize: number
}): Promise<any> {
  const limit = param.pageSize
  const offset = (param.pageNum - 1) * param.pageSize
  const body = window.asrsea({
    s: param.keyword,
    limit: limit,
    offset: offset,
    type: 1,
    strategy: 5,
    queryCorrect: true,
  })
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  return await http.post('https://interface.music.163.com/weapi/search/get', body, config)
}

/**
 * 获取某歌手的热门歌曲
 */
export async function getTopSongsOfSinger(param: { id: number; top: number }): Promise<any> {
  const body = window.asrsea(param)
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  return await http.post('https://interface.music.163.com/weapi/artist/top/song', body, config)
}

/**
 * 获取榜单列表
 */
export async function getToplist(): Promise<Toplist[]> {
  const res: Res = await http.get(`${baseUrl}/toplist/detail`)
  if (res.code === 200) {
    return res.list
  }
  return []
}

/**
 * 获取相似MV列表
 */
export async function getSimiMvList(id: number): Promise<Res> {
  return await http.get(`${baseUrl}/simi/mv?mvid=${id}`)
}

/**
 * 获取MV排行
 */
export async function getTopMvList(param: {
  pageSize: number
  pageNum: number
  area?: string
}): Promise<Res> {
  const params = {
    ...param,
    limit: param.pageSize,
    offset: (param.pageNum - 1) * param.pageSize,
  }
  return await http.get(`${baseUrl}/top/mv`, { params })
}

/**
 * 获取歌手的MV
 */
export async function getSongerMvList(id: number): Promise<Res> {
  return await http.get(`${baseUrl}/artist/mv?id=${id}`)
}

/**
 * 获取MV详情
 */
export async function getMvDetail(id: number): Promise<Res> {
  return await http.get(`${baseUrl}/mv/detail?mvid=${id}`)
}

/**
 * 获取MV播放地址
 */
export async function getMvUrl(id: number): Promise<Res> {
  return await http.get(`${baseUrl}/mv/url?id=${id}`)
}

/**
 * 获取MV评论
 */
export async function getMvComment(param: {
  id: number
  pageSize: number
  pageNum: number
  before?: number
}): Promise<Res> {
  const params = {
    ...param,
    limit: param.pageSize,
    offset: (param.pageNum - 1) * param.pageSize,
  }
  return await http.get(`${baseUrl}/comment/mv`, { params })
}

/**
 * 获取歌曲评论
 */
export async function getSongComment(param: {
  id: number
  pageSize: number
  pageNum: number
  before?: number
}): Promise<Res> {
  const params = {
    ...param,
    limit: param.pageSize,
    offset: (param.pageNum - 1) * param.pageSize,
  }
  return await http.get(`${baseUrl}/comment/music`, { params })
}
