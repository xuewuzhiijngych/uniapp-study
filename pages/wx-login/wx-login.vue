<template>
	<view class="content">
		<button type="primary" open-type="getUserInfo" @getuserinfo="appLoginWx">小程序登录授权</button>
		<button type="default" open-type="getPhoneNumber" @getphonenumber="getPhone">获取手机号</button>
		<button type="warn" @click="loginOut">退出登录</button>
	</view>
</template>

<script>
	import vphp from "../../utils/vphp.js"

	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		data() {
			return {}
		},
		onLoad(options) {},
		computed: {
			...mapState(['hasWxLogin', 'wxUserInfo'])
		},
		methods: {
			...mapMutations(['wxLogin', 'wxLoginOut']),
			// 微信登录
			appLoginWx: function() {
				var that = this;
				uni.getProvider({
					service: 'oauth',
					success: function(res) {
						if (~res.provider.indexOf('weixin')) {
							uni.login({
								provider: 'weixin',
								success: (res2) => {
									uni.getUserInfo({
										provider: 'weixin',
										success: (info) => {
											var data = {
												"code": res2.code,
												"user_data": JSON.stringify(info),
											};
											that.user_login(data);
										},
										fail: () => {
											vphp.toast('微信登录授权失败');
										}
									})
								},
								fail: () => {
									vphp.toast('微信登录授权失败');
								}
							})
						} else {
							vphp.toast('请先安装微信或升级版本');
						}
					}
				});
			},

			// 联网请求获取openid
			user_login: function(data) {
				var that = this;
				// vphp
				vphp.request({
					url: 'user/user_login',
					data: data,
					success: function(res) {
						that.openid = res.openid;
						that.session_key = res.session_key;
						that.wxLogin(res);
						vphp.toast('微信授权登录成功', function() {
							// that.check_phone(res)
							that.success_call()
						});
					}
				});

				// larvrel
				// vphp.server_url = 'http://wiki.cn/api/uni';
				// vphp.request({
				// 	url: 'auth',
				// 	data: data,
				// 	success: function(res) {
				// 		console.log(res);
				// 	}
				// })
				
			},

			// 检测是否获取了手机号
			check_phone: function(data) {
				var that = this;
				vphp.request({
					url: 'user/check_phone',
					data: data,
					success: function(res) {
						that.success_call()
					},
					fail: function() {
						vphp.toast('再点击获取手机号');
					}
				});
			},

			// 获取手机号
			getPhone: function(e) {
				if (!this.hasWxLogin) {
					vphp.toast('请先授权登录~');
					return false;
				}
				if (e.detail.errMsg == "getPhoneNumber:ok") {
					var UserInfo = uni.getStorageSync('wxUserInfo');
					var openid = UserInfo.openid;
					var session_key = UserInfo.session_key;
					vphp.request({
						url: 'user/get_phone',
						data: {
							encryptedData: e.detail.encryptedData,
							iv: e.detail.iv,
							session_key: session_key,
							openid: openid,
						},
						success: function(res) {
							vphp.toast('手机号获取成功', function() {
								that.success_call(res)
							});
						},
					})
				} else if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
					vphp.toast('用户拒绝');
				}
			},

			// 退出登录
			loginOut: function() {
				this.wxLoginOut()
			},

			// 成功跳转
			success_call() {
				if (getCurrentPages().length == 1) {
					uni.reLaunch({
						url: '/pages/index/index',
					})
				} else {
					uni.navigateBack({
						delta: 1,
						complete: complete
					});
				}
			},
		}
	}
</script>

<style>
	.content {}

	.content button {
		margin: 20px;
	}
</style>
