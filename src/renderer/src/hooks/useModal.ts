import Modal from '@renderer/components/modal.vue'
import { createVNode, getCurrentInstance, render } from 'vue'

export default function useModal() {
  const appContext = getCurrentInstance()?.appContext

  const create = (props: any) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const destroy = () => {
      setTimeout(() => {
        render(null, container)
        document.body.removeChild(container)
      }, 300)
    }

    const vnode = createVNode(Modal, {
      ...props,
      onClosed: () => {
        destroy()
      },
    })
    vnode.appContext = appContext!
    render(vnode, container)

    const close = () => {
      vnode.component?.exposed?.close()
      destroy()
    }

    return {
      close,
    }
  }

  return {
    create,
  }
}
