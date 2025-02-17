import type Vue from 'vue'
import { VueConstructor } from 'vue'
import { Directive } from '../component/directives'
import { getVueConstructor } from '../runtimeContext'
import { warn } from '../utils'

// Has a generic to match Vue 3 API and be type compatible
export interface App<T = any> {
  config: VueConstructor['config']
  use: VueConstructor['use']
  mixin: VueConstructor['mixin']
  component: VueConstructor['component']
  directive(name: string): Directive | undefined
  directive(name: string, directive: Directive): this
  mount: Vue['$mount']
  unmount: Vue['$destroy']
}

export function createApp(rootComponent: any, rootProps: any = undefined): App {
  const V = getVueConstructor()!

  let mountedVM: Vue | undefined = undefined

  const app: App = {
    config: V.config,
    use: V.use.bind(V),
    mixin: V.mixin.bind(V),
    component: V.component.bind(V),
    directive(name: string, dir?: Directive | undefined): any {
      if (dir) {
        V.directive(name, dir as any)
        return app
      } else {
        return V.directive(name)
      }
    },
    mount: (el, hydrating) => {
      if (!mountedVM) {
        mountedVM = new V({ propsData: rootProps, ...rootComponent })
        mountedVM.$mount(el, hydrating)
        return mountedVM
      } else {
        if (__DEV__) {
          warn(
            `App has already been mounted.\n` +
              `If you want to remount the same app, move your app creation logic ` +
              `into a factory function and create fresh app instances for each ` +
              `mount - e.g. \`const createMyApp = () => createApp(App)\``
          )
        }
        return mountedVM
      }
    },
    unmount: () => {
      if (mountedVM) {
        mountedVM.$destroy()
        mountedVM = undefined
      } else if (__DEV__) {
        warn(`Cannot unmount an app that is not mounted.`)
      }
    },
  }
  return app
}
