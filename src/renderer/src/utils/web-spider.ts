import { getTopSongsOfSinger } from '@renderer/api'
import { Song, Toplist } from '@renderer/common/types/music'

/**
 * 获取推荐歌单
 */
export async function getRecommendPlaylist() {
  const total = 12
  const list: Array<{ picUrl: string; name: string; id: string; playCount: string }> = []

  while (list.length < total) {
    const html = await (await fetch('https://music.163.com/discover')).text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const arr = Array.from(doc.querySelectorAll('.m-cvrlst.f-cb li'))
    arr.forEach((li) => {
      if (list.length >= total) return
      const href = (li.querySelector('.dec a') as HTMLAnchorElement)?.href
      // 排除掉电台项目
      if (href?.includes('/dj')) return
      const id = href?.match(/id=(\d+)/)?.[1] || ''
      const picUrl = (li.querySelector('.u-cover img') as HTMLImageElement)?.src?.replace(
        /\?.*$/,
        '',
      )
      const name = (li.querySelector('.dec a') as HTMLAnchorElement)?.title || ''
      const playCount = (li.querySelector('.u-cover .nb') as HTMLAnchorElement)?.innerText || ''
      if (list.find((t) => t.id === id)) return
      list.push({ picUrl, name, id, playCount })
    })
  }
  return list
}

/**
 * 获取推荐榜单
 */
export async function getRecommendToplist() {
  const list: Array<{ cover: string; name: string; id: string; desc: string }> = []

  const html = await (await fetch('https://music.163.com/discover/toplist')).text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const arr = Array.from(doc.querySelectorAll('.n-minelst .f-cb:nth-child(2) li'))
  arr.forEach((li) => {
    const href = (li.querySelector('.left a') as HTMLAnchorElement)?.href
    const id = href?.match(/id=(\d+)/)?.[1] || ''
    const cover = (li.querySelector('.left img') as HTMLImageElement)?.src?.replace(/\?.*$/, '')
    const name = (li.querySelector('.name a') as HTMLAnchorElement)?.innerText || ''
    const desc = (li.querySelector('.s-fc4') as HTMLAnchorElement)?.innerText || ''
    list.push({ cover, name, id, desc })
  })
  return list
}

/**
 * 获取歌单列表
 */
export async function getPlaylist(param: { pageNum: number; pageSize: number; cat: string }) {
  const limit = param.pageSize
  const offset = (param.pageNum - 1) * param.pageSize

  const html = await (
    await fetch(
      `https://music.163.com/discover/playlist?limit=${limit}&offset=${offset}&cat=${param.cat}`,
    )
  ).text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const list: Array<{ cover: string; name: string; id: string; playCount: string }> = []
  const arr = Array.from(doc.querySelectorAll('.m-cvrlst li'))
  arr.forEach((li) => {
    const href = (li.querySelector('.dec a') as HTMLAnchorElement)?.href
    const id = href?.match(/id=(\d+)/)?.[1] || ''
    const cover = (li.querySelector('.u-cover img') as HTMLImageElement)?.src?.replace(/\?.*$/, '')
    const name = (li.querySelector('.dec a') as HTMLAnchorElement)?.title || ''
    const playCount = (li.querySelector('.u-cover .nb') as HTMLAnchorElement)?.innerText || ''
    list.push({ cover, name, id, playCount })
  })
  const totalPage = Number(
    (doc.querySelector('.u-page a:nth-last-of-type(2)') as HTMLAnchorElement)?.innerText,
  )
  return {
    list,
    totalPage,
  }
}

/**
 * 获取歌手详情
 */
export async function getSingerDetail(id: number) {
  const html = await (await fetch(`https://music.163.com/artist/desc?id=${id}`)).text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const name = (doc.querySelector('#artist-name') as HTMLElement)?.innerText
  const alias = (doc.querySelector('#artist-alias') as HTMLElement)?.innerText
    ?.replaceAll('\n', '')
    ?.split(';')
    .filter((str) => str)
  const cover = (doc.querySelector('.n-artist img') as HTMLImageElement)?.src?.replace(/\?.*$/, '')
  const desc = (doc.querySelector('meta[name=description]') as HTMLMetaElement).content
  const description = (doc.querySelector('.n-artdesc') as HTMLElement)?.innerHTML
  const songList: Song[] = (await getTopSongsOfSinger({ id, top: 100 }))?.songs || []
  return {
    id,
    name,
    alias,
    cover,
    desc: desc ? desc + '...' : '',
    description,
    songList,
  }
}

/**
 * 获取歌单分类
 */
export async function getPlaylistCategory() {
  const html = await (await fetch(`https://music.163.com/discover/playlist/`)).text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const list = Array.from(doc.querySelectorAll('dl.f-cb') as NodeList)
  return list.map((dl) => {
    const title = ((dl as HTMLElement).querySelector('dt') as HTMLElement)?.innerText
    const sublist = Array.from((dl as HTMLElement).querySelectorAll('a') as NodeList)
    const children = sublist.map((a) => (a as HTMLElement).innerText)
    return {
      title,
      children,
    }
  })
}

export async function getToplist(): Promise<Toplist[]> {
  const list: Toplist[] = []

  const html = await (await fetch('https://music.163.com/discover/toplist')).text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const arr = Array.from(doc.querySelectorAll('.n-minelst .f-cb li'))
  arr.forEach((li) => {
    const href = (li.querySelector('.left a') as HTMLAnchorElement)?.href
    const id = href?.match(/id=(\d+)/)?.[1] || ''
    const coverImgUrl = (li.querySelector('.left img') as HTMLImageElement)?.src?.replace(
      /\?.*$/,
      '',
    )
    const name = (li.querySelector('.name a') as HTMLAnchorElement)?.innerText || ''
    const updateFrequency = (li.querySelector('.s-fc4') as HTMLAnchorElement)?.innerText || ''
    list.push({ id, name, coverImgUrl, updateFrequency, tracks: [] })
  })
  return list
}
