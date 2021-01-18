<template>
	<view>
		<button type="primary" @click="getUser">字节跳动授权</button>
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
			...mapState(['hasZjLogin', 'zjUserInfo'])
		},
		methods: {
			...mapMutations(['zjLogin', 'zjLoginOut']),
			// 字节跳动授权登录
			getUser: function() {
				var provider = 'toutiao';
				var that = this;
				uni.getProvider({
					service: 'oauth',
					success: function(res) {
						if (~res.provider.indexOf(provider)) {
							uni.login({
								provider: provider,
								success: function(loginRes) {

									vphp.request({
										url: 'user/zj_auth',
										data: {
											code: loginRes.code
										},
										success: function(res) {
											console.log(res);
										}
									});

									uni.getUserInfo({
										provider: provider,
										success: function(res) {
											that.zjLogin(res.userInfo)
											vphp.toast('字节登录成功', function() {
												that.success_call()
											});
										},
										fail: function(err) {
											console.log(err);
										}
									})

								}
							})
						}
					},
				})
			},
			// 字节退出登录
			loginOut: function() {
				this.zjLoginOut();
			},
			// 成功跳转
			success_call: function() {
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
			}
		}
	}
</script>

<style>
	.content {}

	.content button {
		margin: 20px;
	}
</style>
