<template>
	<view class="content">
		<view class="info">
			<image :src="avator" mode=""></image>
		</view>
		<view class="info">
			<text>
				{{nickname}}
			</text>
		</view>
		<view class="info">
			<button type="default" @click="lpost">POst</button>
		</view>
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
			return {
				title: 'Hello',
				avator: '',
				nickname: ''
			}
		},
		onLoad() {
			console.log('微信小程序登录状态', this.hasWxLogin);
			console.log('字节登录状态', this.hasZjLogin);
			var that = this;
			// 判断是否登录 （第一个参数是登录成功后的回调函数）
			that.isLogin(function() {
				//#ifdef MP-WEIXIN
				that.avator = that.$store.state.wxUserInfo.avator;
				that.nickname = that.$store.state.wxUserInfo.name;
				//#endif

				//#ifdef MP-TOUTIAO
				that.avator = that.$store.state.zjUserInfo.avatarUrl;
				that.nickname = that.$store.state.zjUserInfo.nickName
				//#endif
			})
		},
		computed: {
			...mapState(['hasWxLogin', 'hasZjLogin'])
		},
		methods: {
			...mapMutations(['isLogin']),

			lpost: function() {
				vphp.server_url = 'http://wiki.cn/api/uni';
				vphp.request({
					url: 'auth',
					data: {
						'name': 'ych',
						'age': 23,
					},
					success: function(res) {
						console.log(res);
					}
				})

			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.info image {
		height: 100px;
		width: 100px;
		margin-top: 40%;
		border-radius: 50%;
	}

	.info text {
		margin-top: 20px;
	}
</style>
