import Vue from 'vue'
import App from './App'
const vphp = require('./utils/vphp.js');
vphp.server_url = 'http://uniserver.cn/wxapp';


import store from './store' //引入vuex
Vue.prototype.$store = store //把vuex定义成全局组件
Vue.config.productionTip = false

App.mpType = 'app'
App.debug = 'true'

const app = new Vue({
	...App,
	store
})
app.$mount()
