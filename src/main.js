import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import axios from 'axios'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import { setToken } from '@/utils/auth'

import i18n from './lang' // Internationalization
import './icons' // icon
import './permission' // permission control
import './utils/errorLog' // error log

import * as filters from './filters' // global filters

import { mockXHR } from '../mock' // simulation data

console.log('NODE_ENV: ' + process.env.NODE_ENV)
// mock api in github pages site build
if (process.env.NODE_ENV === 'production') { mockXHR() }

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

function tokenInterceptor() {
  axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${Vue.prototype.$keycloak.token}`
    return config
  }, error => {
    return Promise.reject(error)
  })
}

Vue.use(VueKeyCloak, {
  config: {
    url: 'http://39.106.139.221:8080/auth',
    realm: 'hkrsoft',
    clientId: 'ett-ui'
  },
  onReady: (keycloak) => {
    console.log(`I wonder what Keycloak returns: ${JSON.stringify(keycloak)}`)
    store.commit('user/SET_TOKEN', keycloak.token)
    // const { roles } = keycloak.realmAccess
    // store.commit('user/SET_ROLES', roles)
    store.commit('user/SET_NAME', keycloak.tokenParsed.preferred_username)
    store.commit('user/SET_AVATAR', keycloak.tokenParsed.avatar)
    // store.commit('SET_INTRODUCTION', introduction)
    setToken(keycloak.token)
    tokenInterceptor()
    new Vue({
      el: '#app',
      router,
      store,
      i18n,
      render: h => h(App)
    })
  }
})
