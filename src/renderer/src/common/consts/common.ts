import { FileNameFormat } from '../enums/common'

export const SongBrOptions = [
  {
    label: '无损',
    value: 999,
  },
  {
    label: '极高',
    value: 320,
  },
  {
    label: '较高',
    value: 172,
  },
  {
    label: '标准',
    value: 128,
  },
]

export const FileNameFormatOptions = [
  {
    label: '歌曲名',
    value: FileNameFormat.songName,
  },
  {
    label: '歌曲名-歌手',
    value: FileNameFormat.songName_singerName,
  },
  {
    label: '歌手-歌曲名',
    value: FileNameFormat.singerName_songName,
  },
]
