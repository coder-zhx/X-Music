/// <reference types="vite/client" />
interface Window {
  asrsea: (obj: object) => { encText: string; encSecKey: string }
  crc32: (str: string) => string
  aplus_queue: any
}
