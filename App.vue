<script>
	import {
		mapMutations
	} from 'vuex';

	export default {
		methods: {
			...mapMutations(['wxLogin', 'zjLogin'])
		},
		onLaunch: function() {
			//#ifdef MP-WEIXIN
			let wxUserInfo = uni.getStorageSync('wxUserInfo') || '';
			if (wxUserInfo.openid) {
				// 更新本地微信用户信息
				uni.getStorage({
					key: 'wxUserInfo',
					success: (res) => {
						this.wxLogin(res.data)
					}
				})
			}
			//#endif

			//#ifdef MP-TOUTIAO
			let zjUserInfo = uni.getStorageSync('zjUserInfo') || '';
			if (zjUserInfo.nickName) {
				// 更新本地字节用户信息
				uni.getStorage({
					key: 'zjUserInfo',
					success: (res) => {
						this.zjLogin(res.data)
					}
				})
			}
			//#endif
		},
		onShow: function() {},
		onHide: function() {}
	}
</script>

<style>
	/*每个页面公共css */
</style>
