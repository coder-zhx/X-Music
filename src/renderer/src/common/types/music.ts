export interface Playlist {
  id: number
  type: number
  name: string
  picUrl: string
  canDislike: boolean
  trackNumberUpdateTime: number
  playCount: number
  trackCount: number
  highQuality: boolean
  alg: string
}

export interface PlaylistDetail {
  id: number
  name: string
  tags: string[]
  coverImgUrl: string
  description: string
  createTime: number
  creator: {
    nickname: string
    avatarUrl: string
    signature: string
  }
  playCount: number
  shareCount: number
  subscribedCount: number
  trackCount: number
  tracks: Song[]
  commentCount: number
  commentThreadId: string
}

export interface Song {
  id: number
  name: string
  al: {
    id: number
    name: string
    picUrl: string
  }
  ar: {
    id: number
    name: string
  }[]
  dt: number
  publishTime: number
  mv: number
  h: SongQuality
  l: SongQuality
  m: SongQuality
  sq: SongQuality
}

export interface Singer {
  id: number
  name: string
  alias?: string[]
  cover?: string
  picUrl?: string
  musicSize?: number
  albumSize?: number
  img1v1Url?: string
  desc?: string
  description?: string
  songList: Song[]
}

interface SongQuality {
  br: number
  size: number
  vd: number
  sr: number
}

export interface Toplist {
  id: number | string
  name: string
  coverImgUrl: string
  updateFrequency: string
  tracks: Array<{ first: string; second: string }>
}

export interface User {
  locationInfo: any
  liveInfo: any
  anonym: number
  highlight: boolean
  commonIdentity: any
  avatarDetail: any
  userType: number
  avatarUrl: string
  followed: boolean
  mutual: boolean
  remarkName: string
  socialUserId: number
  nickname: string
  authStatus: number
  userId: number
}

export interface Comment {
  user: User
  beReplied: any[]
  showFloorComment: {
    replyCount: number
    comments: Comment[]
    showReplyCount: boolean
  }
  status: number
  commentId: number
  content: string
  richContent: string
  time: number
  timeStr: string
  needDisplayTime: boolean
  likedCount: number
  expressionUrl: null
  commentLocationType: number
  parentCommentId: number
  decoration: { [key: string]: any }
  ipLocation: { ip: null; location: string; userId: null }
  owner: boolean
  liked: boolean
}

export interface MvDetail {
  id: number
  name: string
  artistId: number
  artistName: string
  briefDesc: string
  desc: string
  cover: string
  coverId_str: string
  imgurl: string
  imgurl16v9: string
  coverId: number
  playCount: number
  subCount: number
  shareCount: number
  commentCount: number
  duration: number
  nType: number
  publishTime: string
  price: null
  brs: { size: number; br: number; point: number }[]
  artists: { id: number; name: string; img1v1Url: null; followed: boolean }[]
  commentThreadId: string
  videoGroup: any[]
}
