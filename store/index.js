import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	state: {

	},
	mutations: {

	},
	state: { // 全局变量定义处
		hasWxLogin: false, // 是否登录
		wxUserInfo: {}, // 微信用户数据

		hasZjLogin: false, // 是否登录
		zjUserInfo: {}, // 微信用户数据

	},
	mutations: { // 全局方法定义处
		// 微信授权登录
		wxLogin(state, provider) {
			state.hasWxLogin = true;
			state.wxUserInfo = provider;
			uni.setStorage({
				key: 'wxUserInfo',
				data: provider
			});
		},
		// 退出微信登录
		wxLoginOut(state, provider) {
			state.hasWxLogin = false;
			state.wxUserInfo = {};
			uni.removeStorage({
				key: 'wxUserInfo'
			});
			console.log('退出登录成功');
		},
		// 是否登录
		isLogin(state, callback) {
			//#ifdef MP-WEIXIN
			if (state.hasWxLogin == true) {
				if (callback) {
					callback();
				}
			} else {
				uni.redirectTo({
					url: '/pages/wx-login/wx-login'
				});
			}
			//#endif

			//#ifdef MP-TOUTIAO
			if (state.hasZjLogin == true) {
				if (callback) {
					callback();
				}
			} else {
				uni.redirectTo({
					url: '/pages/zj-login/zj-login'
				});
			}
			//#endif
		},


		// 字节跳动授权登录
		zjLogin(state, provider) {
			state.hasZjLogin = true;
			state.zjUserInfo = provider;
			uni.setStorage({
				key: 'zjUserInfo',
				data: provider
			});
		},
		// 退出字节跳动登录
		zjLoginOut(state, provider) {
			state.hasZjLogin = false;
			state.zjUserInfo = {};
			uni.removeStorage({
				key: 'zjUserInfo'
			});
			console.log('退出登录成功');
		},
	},
	actions: {},
})

export default store
