var vphp = {};

/**
 * 服务器接口
 */
vphp.server_url = null;

var toast_queue = [];
var toast_show = false;

// 弹出提示框
vphp.toast = function (v, callback) {
    if (toast_show) {
        for (var k in toast_queue) {
            if (toast_queue[k][1] == v && toast_queue[k][2] == callback) {
                return;
            }
        }
        toast_queue.push([vphp.time(), v, callback]);
    } else {
        toast_show = true;
        var show = function (vv) {
            uni.showToast({
                title: vv,
                icon: 'none',
                duration: 1500,
            });
            setTimeout(function () {
                if (callback) {
                    callback();
                }
            }, 1500);
            setTimeout(function () {
                var v = toast_queue.shift();
                if (v === undefined) {
                    toast_show = false;
                } else {
                    show(v[1], v[2]);
                }
            }, 1600);
        };
        show(v, callback);
    }
};

// 关闭弹出框
vphp.toast.hide = function (wait) {
    var time = vphp.time();
    var _toast_queue = [];
    for (var k in toast_queue) {
        if (toast_queue[k][0] > time) {
            _toast_queue.push(toast_queue[k]);
        }
    }
    toast_queue = _toast_queue;
    if (!wait) {
        uni.hideToast();
    }
};

// 弹出确认框
vphp.confirm = function (title, content, success, cancel) {
    if ('function' == typeof (content) || 'object' == typeof (content)) {
        cancel = success;
        success = content;
        content = title;
        title = null;
    } else if (undefined === content) {
        content = title;
        title = null;
    }
    var confirmText;
    if (success instanceof Array) {
        confirmText = success[0];
        success = success[1];
    }
    var cancelText;
    if (cancel instanceof Array) {
        cancelText = cancel[0];
        cancel = cancel[1];
    }

    var params = {
        content: content,
        success: function (res) {
            if (res.confirm) {
                if (success) {
                    success();
                }
            } else if (res.cancel) {
                if (cancel) {
                    cancel();
                }
            }
        }
    };
    if (confirmText) {
        params.confirmText = confirmText;
    }
    if (cancelText) {
        params.cancelText = cancelText;
    }
    if (title) {
        params.title = title;
    }
    uni.showModal(params);
};

// 弹出对话框
var _alert_last = {
    content: null,
    title: null,
    time: null,
    num: 0,
};

vphp.alert = function (title, content, success) {
    if ('function' == typeof (content) || 'object' == typeof (content)) {
        success = content;
        content = title;
        title = null;
    } else if (undefined === content) {
        content = title;
        title = null;
    }
    var confirmText;
    if (success instanceof Array) {
        confirmText = success[0];
        success = success[1];
    }
    var params = {
        content: content,
        showCancel: false,
        success: function (res) {
            if (res.confirm) {
                if (success) {
                    success();
                }
            }
        }
    };
    if (confirmText) {
        params.confirmText = confirmText;
    }
    if (title) {
        params.title = title;
    }

    if (_alert_last.title == title && _alert_last.content == content) {
        _alert_last.num++;
    }

    if (_alert_last.num >= 4) { // 同样的错误提示，出现5次时返回首页
        _alert_last.num = 0;
        params.confirmText = '返回';
        params.success = function (res) {
            if (res.confirm) {
                uni.navigateBack({
                    delta: 1,
                    fail: function () {
                        uni.reLaunch({
                            url: '/pages/index/index'
                        });
                    }
                });
            }
        };
    }

    _alert_last.title = title;
    _alert_last.content = content;
    _alert_last.time = vphp.time();

    uni.showModal(params);
};

// 当前时间戳
vphp.time = function () {
    return Date.now();
};

// 格式化金额9.90为9.9
vphp.money = function (num) {
    return parseFloat(parseFloat(num).toFixed(2));
};

// 验证手机号码格式
vphp.is_phone = function (phone) {
    return (/^1[34578]\d{9}$/.test(phone));
};

/*
将字符串按长度分割
*/
vphp.str_split = function (s, len, space) {
    if (!s) {
        return;
    }
    if (space === undefined) {
        space = ' ';
    }
    var str = s + "";
    var arr = [];
    var size = Math.ceil(str.length / len);
    for (var i = 0; i < size; i++) {
        arr.push(str.substring(len * i, len * i + len));
    }
    return arr.join(space);
};

/**
 * 时间戳转化为年 月 日 时 分 秒
 * time: 时间戳(秒)
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
 */
vphp.date = function (format, time) {
    var formateArr = ['Y', 'm', 'd', 'H', 'i', 's'];
    var returnArr = [];
    var date;
    if (time) {
        date = new Date(time * 1000);
    } else {
        date = new Date();
    }

    returnArr.push(date.getFullYear());
    returnArr.push(formatNumber(date.getMonth() + 1));
    returnArr.push(formatNumber(date.getDate()));
    returnArr.push(formatNumber(date.getHours()));
    returnArr.push(formatNumber(date.getMinutes()));
    returnArr.push(formatNumber(date.getSeconds()));

    for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
};

// url操作
vphp.url = {
    build: function (url, params) {
        if (!params) {
            return url;
        }
        for (var k in params) {
            if (url.indexOf('?') === -1) {
                url += '?';
            } else {
                url += '&';
            }
            url += k + '=' + encodeURIComponent(params[k]).trim();
        }
        return url;
    },
    parse: function (params) {
        if (!params) {
            return params;
        }
        for (var k in params) {
            params[k] = decodeURIComponent(params[k]);
        }
        return params;
    },
    encode: function (r) {
        return encodeURIComponent(r);
    },
    decode: function (r) {
        return decodeURIComponent(r);
    },
};

/**
 * Cookie操作
 */
vphp.cookie = {
    data: undefined,
    _init: function () {
        if (this.data !== undefined) {
            return;
        }
        this.data = uni.getStorageSync('vphp.cookie');
        if (!this.data) {
            this.data = {};
        }
    },
    _save: function () {
        if (this.data === undefined) {
            return;
        }
        uni.setStorageSync('vphp.cookie', this.data);
    },
    /**
     * 读取Cookie
     * @param {string} key 
     */
    get: function (key) {
        this._init();
        if (this.data[key] === undefined) {
            return null;
        }
        var value = this.data[key].value;
        var expiry = this.data[key].expiry;
        if (expiry && expiry <= time) {
            delete this.data[key];
            return null;
        }
        return value;
    },
    /**
     * 设置Cookie
     * @param {string} key 
     * @param {string|int} value 
     * @param {int} [expiry] 有效时间（单位：毫秒）
     */
    set: function (key, value, expiry) {
        this._init();
        if (value === undefined || value === null || value === '' || expiry && expiry <= vphp.time()) {
            delete this.data[key];
        } else {
            this.data[key] = {
                value: value,
                expiry: expiry,
            };
        }
        this._save();
    },
    /**
     * 返回所有cookie
     * @returns {object}
     */
    all: function () {
        this._init();
        var time = vphp.time();
        var res = {};
        for (var key in this.data) {
            var value = this.data[key].value;
            var expiry = this.data[key].expiry;
            if (expiry && expiry <= time) {
                delete this.data[key];
                continue;
            }
            res[key] = value;
        }
        return res;
    },
    /**
     * 删除Cookie
     * @param {string} key 
     */
    delete: function (key) {
        this._init();
        delete this.data[key];
        this._save();
    },
    /**
     * 清空Cookie
     */
    clear: function () {
        uni.removeStorageSync('vphp.cookie');
        this.data = {};
    },
    /**
     * 解析Http-Header-Cookie
     * @param {string} cookie 
     */
    parse: function (cookie) {
        var nodes;
        if (cookie.indexOf(';')) {
            nodes = cookie.split(';');
        } else {
            nodes = [cookie];
        }
        var key_value = nodes[0].split('=', 2);
        var key = decodeURIComponent(('' + key_value[0]).trim());
        var value = decodeURIComponent(('' + key_value[1]).trim());
        var expiry = null;

        for (var k in nodes) {
            if (k == 0) {
                continue;
            }
            var v = nodes[k].trim();
            if (v.startsWith('expires=')) {
                expiry = Date.parse(new Date(v.substring(8)));
                break;
            }
        }

        this.set(key, value, expiry);
    },
    /**
     * 生成Http-Header-Cookie
     */
    build: function () {
        var builder = [];
        var cookies = this.all();
        for (var k in cookies) {
            builder.push(
                encodeURIComponent(k) + '=' + encodeURIComponent(cookies[k])
            );
        }

        return builder.join('; ');
    }
};

/**
 * 组装post所需的数据
 * （微信uni.request并不能自动构建数组post，所以才需要该方法进行处理）
 * 
 * @param {object} data
 * @param {string} [prefix] 键名前缀
 * @returns {object}
 */
vphp.params = function (data, prefix) {
    var res = {};
    for (var k in data) {
        if (typeof data[k] == 'object') {
            var _prefix;
            if (prefix === undefined) {
                _prefix = k;
            } else {
                _prefix = prefix + "[" + k + "]";
            }
            var _res = vphp.params(data[k], _prefix);
            for (var j in _res) {
                res[j] = _res[j];
            }
        } else {
            if (prefix === undefined) {
                res[k] = data[k];
            } else {
                res[prefix + "[" + k + "]"] = data[k];
            }
        }
    }
    return res;
};

// // test
// console.log(vphp.params({
//     xxx: 1111,
//     zzz1: [1, 2, 3],
//     zzz2: [1, 2, 3],
//     vvvv1: { a: 1, b: 2, c: [1, 2, 3], d: { e: { f: 1 } } },
//     vvvv2: { a: 1, b: 2, c: [1, 2, 3], d: { e: { f: 1 } } },
// }));

/**
 * 快捷请求数据
 * 
 * @param {string} url 请求地址
 * @param {object} [data] 请求数据
 * @param {function} success 成功后回调 
 * @param {function} fail 失败后回调
 * @returns {object}
 */
vphp.post = function (url, data, success, fail) {
    if (typeof (data) == 'function') { // url, success, fail
        fail = success;
        success = data;
        data = {};
    }
    return this.request({
        url: url,
        data: data,
        success: success,
        fail: fail,
    });
};

/**
 * 请求数据
 * 
 * @param {object} options 
 * @returns {object}
 */
vphp.request = function (options) {
    return this.api(options).start();
};

/**
 * 创建请求
 * 
 * @param {object} options 
 * @returns {object}
 */
vphp.api = function (options) {
    return new this._api(options);
};

/**
 * 请求类
 * 
 * @param {object} options 
 * 
 * @property {string} url 请求地址
 * @property {object} data 发送数据
 * @property {int} timeout 超时实际
 * @property {function} success 成功时回调
 * @property {function} fail 失败时回调
 * @property {function} before 发送请求之前回调
 * @property {function} after 发送请求之后回调
 * @property {function} complete 发送请求之后回调
 * @property {function} abort 请求取消时回调
 * 
 * @function abort() 取消请求
 * @function start() 开始请求 
 * 
 * @returns {object}
 */
vphp._api = function (options) {
    if (!options) {
        options = {};
    }
    var the = this;
    the.success = options.success;
    the.fail = options.fail;
    the.before = options.before;
    the.after = options.after;
    the.complete = options.complete;
    the.abort = options.abort;
    the.url = options.url;
    the.data = options.data ? options.data : {};
    the.timeout = options.timeout ? options.timeout : 60000;
    the.request = null;

    var event = {
        success: function (data, extras) {
            if (the.success) {
                var args = [];
                args.push(data);
                if (extras) {
                    for (var k in extras) {
                        args.push(extras[k]);
                    }
                }
                the.success.apply(the, args);
            }
        },
        fail: function (msg, extras) {
            var args = [];
            args.push(msg);
            if (extras) {
                for (var k in extras) {
                    args.push(extras[k]);
                }
            }
            if (the.fail) {
                the.fail.apply(the, args);
            } else {
                vphp.toast(msg);
            }
        },
        before: function () {
            if (the.before) {
                return the.before.apply(the);
            }
        },
        complete: function () {
            if (the.after) {
                the.after.apply(the);
            }
            if (the.end) {
                the.end.apply(the);
            }
            if (the.complete) {
                the.complete.apply(the);
            }
        },
        abort: function () {
            if (the.abort) {
                the.abort.apply(the);
            }
        },
    };

    the.abort = function () {
        if (the.request) {
            the.request.abort();
            the.request = null;
        }
        event.abort();
        return the;
    };
    the.start = function () {
        if (!vphp.server_url) {
            throw new Error('缺少配置vphp.server_url');
        }
        event.before();
        the.request = uni.request({
            url: vphp.server_url + '/' + the.url,
            data: vphp.params(the.data),
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': vphp.cookie.build(),
            },
            timeout: the.timeout,
            success: function (info) {
                for (var k in info.cookies) {
                    vphp.cookie.parse(info.cookies[k]);
                }

                if (info.data.status === undefined) {
                    console.error('服务器接口异常', info, info.data);
                    event.fail('服务器接口异常');
                } else if (info.data.status) {
                    event.success(info.data.data, info.data.extras);
                } else {
                    event.fail(info.data.data, info.data.extras);
                }
            },
            fail: function (info) {
                if (info.errMsg === 'request:fail abort') {
                    return;
                }
                event.fail(info.errMsg);
            },
            complete: function (info) {
                if (info.errMsg === 'request:fail abort') {
                    return;
                }
                event.complete();
            }
        });
        return the;
    };
    return the;
};

/**
 * 快捷上传
 * 
 * @param {string} key 文件key
 * @param {string} file 文件路径(小程序内)
 * @param {function} success 成功后回调
 * @param {function} fail 失败后回调
 * @returns {object}
 */
vphp.upload = function (key, file, success, fail) {
    return (new this._upload({
        key: key,
        file: file,
        success: success,
        fail: fail,
    })).start();
};

/**
 * 上传类
 * 
 * @param {object} options 
 * 
 * @property {object} data 发送数据
 * @property {int} timeout 超时实际
 * @property {string} key 上传key
 * @property {boolean} tmp 是否上传至临时目录
 * @property {string} file 待上传文件的小程序文件地址
 * @property {function} success 成功时回调
 * @property {function} fail 失败时回调
 * @property {function} before 发送请求之前回调
 * @property {function} after 发送请求之后回调
 * @property {function} complete 发送请求之后回调
 * @property {function} abort 请求取消时回调
 * 
 * @function abort() 取消请求
 * @function start() 开始请求 
 * @returns {object}
 */
vphp._upload = function (options) {
    if (!options) {
        options = {};
    }
    var the = this;
    the.key = options.key;
    the.tmp = options.tmp;
    the.file = options.file;
    the.success = options.success;
    the.fail = options.fail;
    the.before = options.before;
    the.after = options.after;
    the.complete = options.complete;
    the.abort = options.abort;
    the.data = options.data ? options.data : {};
    the.timeout = options.timeout ? options.timeout : 120000;
    the.request = null;

    var event = {
        success: function (data, extras) {
            if (the.success) {
                var args = [];
                args.push(data);
                if (extras) {
                    for (var k in extras) {
                        args.push(extras[k]);
                    }
                }
                the.success.apply(this, args);
            }
        },
        fail: function (msg, extras) {
            var args = [];
            args.push(msg);
            if (extras) {
                for (var k in extras) {
                    args.push(extras[k]);
                }
            }
            if (the.fail) {
                the.fail.apply(this, args);
            } else {
                vphp.toast(msg);
            }
        },
        before: function () {
            if (the.before) {
                return the.before.apply(this);
            }
        },
        complete: function () {
            if (the.after) {
                the.after.apply(this);
            }
            if (the.end) {
                the.end.apply(this);
            }
            if (the.complete) {
                the.complete.apply(this);
            }
        },
        abort: function () {
            if (the.abort) {
                the.abort.apply(this);
            }
        },
    };

    the.abort = function () {
        if (the.request) {
            the.request.abort();
            the.request = null;
        }
        event.abort();
        return the;
    };
    the.start = function () {
        if (!vphp.server_url) {
            throw new Error('缺少配置vphp.server_url');
        }
        if (the.tmp === undefined || the.tmp) {
            the.data._upload_tmp = 1;
        } else {
            the.data._upload_tmp = 0;
        }
        the.data._upload_key = the.key;

        event.before();
        the.request = uni.uploadFile({
            url: vphp.server_url + '/@upload',
            filePath: the.file,
            name: '_upload_file',
            header: {
                "Content-Type": "multipart/form-data",
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': vphp.cookie.build(),
            },
            formData: vphp.params(the.data),
            timeout: the.timeout,
            success: function (info) {
                for (var k in info.cookies) {
                    vphp.cookie.parse(info.cookies[k]);
                }

                if (typeof info.data === 'string') {
                    try {
                        info.data = JSON.parse(info.data);
                    } catch (error) { }
                }

                if (info.data.status === undefined) {
                    console.error('服务器接口异常', info, info.data);
                    event.fail('服务器接口异常');
                } else if (info.data.status) {
                    event.success(info.data.data, info.data.extras);
                } else {
                    event.fail(info.data.data, info.data.extras);
                }
            },
            fail: function (info) {
                if (info.errMsg === 'request:fail abort') {
                    return;
                }
                event.fail(info.errMsg);
            },
            complete: function (info) {
                if (info.errMsg === 'request:fail abort') {
                    return;
                }
                event.complete();
            }
        });
        return the;
    };
    return the;
};

/**
 * 简化并模拟Promise
 * 
 * @property {...array|...function} then 
 */
vphp.process = function () {
    var process = new vphp._process();
    if (arguments.length) {
        process.then.apply(this, arguments);
    }
    return process;
};
vphp._process = function () {
    var the = this;

    // 队列
    the.queue = [];

    // 最后的状态
    the.last_status = undefined;

    // 最后的结果
    the.result = undefined;

    // 是否正在运行
    the.running = false;

    var run = function (what) {
        if (what == 'success') {
            the.last_status = what;
            the.running = false;
        } else if (what == 'fail') {
            the.last_status = what;
            the.running = false;
        } else {
            what = the.last_status;
        }
        if (the.running) {
            return;
        }

        the.running = true;

        var item = the.queue.shift();
        if (!item) {
            the.running = false;
            return;
        }

        if (what == 'fail' && item.type != 'fail') {
            return;
        }

        var k;
        var r;
        var last_result = the.result;
        var stop = false;
        var success;
        var fail;

        if (item.type == 'then') {
            r = item.list[0](
                function (res) {
                    the.result = res;
                    run('success');
                },
                function (res) {
                    the.result = res;
                    run('fail');
                },
                last_result
            );
            if (r === the) {
                throw new Error('请不要返回同一个process!');
            } else if (r instanceof vphp._process) {
                if (r.last_status === 'success' || r.last_status === 'fail') {
                    the.result = r.result;
                    run(r.last_status);
                }
            }
        } else if (item.type == 'all') {
            var res = [];
            success = function (r) {
                if (stop) {
                    return;
                }
                res.push(r);
                if (res.length == item.list.length) {
                    the.result = res;
                    run('success');
                }
            };
            fail = function (res) {
                the.result = res;
                stop = true;
                run('fail');
            };
            for (k in item.list) {
                if (stop) {
                    break;
                }
                r = item.list[k](success, fail, last_result);
                if (r === the) {
                    throw new Error('请不要返回同一个process!');
                } else if (r instanceof vphp._process) {
                    if (stop) {
                        return;
                    } else if (r.last_status === 'success' || r.last_status === 'fail') {
                        the.result = r.result;
                        run(r.last_status);
                    }
                }
            }
        } else if (item.type == 'any') {
            success = function (res) {
                if (stop) {
                    return;
                }
                the.result = res;
                stop = true;
                run('success');
            };
            fail = function (res) {
                if (stop) {
                    return;
                }
                the.result = res;
                run('fail');
            };
            for (k in item.list) {
                if (stop) {
                    break;
                }
                r = item.list[k](success, fail, last_result);
                if (r === the) {
                    throw new Error('请不要返回同一个process!');
                } else if (r instanceof vphp._process) {
                    if (stop) {
                        return;
                    } else if (r.last_status === 'success') {
                        the.result = r.result;
                        stop = true;
                        run('success');
                    } else if (r.last_status === 'fail') {
                        the.result = r.result;
                        run('fail');
                    }
                }
            }
        } else if (item.type == 'race') {
            success = function (res) {
                if (stop) {
                    return;
                }
                the.result = res;
                stop = true;
                run('success');
            };
            fail = function (res) {
                if (stop) {
                    return;
                }
                the.result = res;
                stop = true;
                run('fail');
            };
            for (k in item.list) {
                if (stop) {
                    break;
                }
                r = item.list[k](success, fail, last_result);
                if (r === the) {
                    throw new Error('请不要返回同一个process!');
                } else if (r instanceof vphp._process) {
                    if (stop) {
                        return;
                    } else if (r.last_status === 'success' || r.last_status === 'fail') {
                        the.result = r.result;
                        stop = true;
                        run(r.last_status);
                    }
                }
            }
        } else if (item.type == 'fail') {
            success = function (res) {
                if (stop) {
                    return;
                }
                the.result = res;
                stop = true;
                run('success');
            };
            fail = function (res) {
                if (stop) {
                    return;
                }
                the.result = res;
                run('fail');
            };
            for (k in item.list) {
                if (stop) {
                    break;
                }
                r = item.list[k](success, fail, last_result);
                if (r === the) {
                    throw new Error('请不要返回同一个process!');
                } else if (r instanceof vphp._process) {
                    if (stop) {
                        return;
                    } else if (r.last_status === 'success') {
                        the.result = r.result;
                        stop = true;
                        run('success');
                    } else if (r.last_status === 'fail') {
                        the.result = r.result;
                        run('fail');
                    }
                }
            }
        } else {
            throw new Error('不支持的type: ' + item.type);
        }
    };
    the.then = function () {
        if (arguments.length == 0) {
            return the;
        }
        for (var i in arguments) {
            if (typeof arguments[i] == 'function') {
                the.queue.push({
                    type: 'then',
                    list: [arguments[i]],
                });
            } else {
                for (var j in arguments[i]) {
                    the.queue.push({
                        type: 'then',
                        list: [arguments[i][j]],
                    });
                }
            }
        }
        run();
        return the;
    };
    the.all = function () {
        if (arguments.length == 0) {
            return the;
        }
        var list = [];
        for (var i in arguments) {
            if (typeof arguments[i] == 'function') {
                list.push(arguments[i]);
            } else {
                for (var j in arguments[i]) {
                    list.push(arguments[i][j]);
                }
            }
        }
        the.queue.push({
            type: 'all',
            list: list,
        });
        run();
        return the;
    };
    the.any = function () {
        if (arguments.length == 0) {
            return the;
        }
        var list = [];
        for (var i in arguments) {
            if (typeof arguments[i] == 'function') {
                list.push(arguments[i]);
            } else {
                for (var j in arguments[i]) {
                    list.push(arguments[i][j]);
                }
            }
        }
        the.queue.push({
            type: 'any',
            list: list,
        });
        run();
        return the;
    };
    the.race = function () {
        if (arguments.length == 0) {
            return the;
        }
        var list = [];
        for (var i in arguments) {
            if (typeof arguments[i] == 'function') {
                list.push(arguments[i]);
            } else {
                for (var j in arguments[i]) {
                    list.push(arguments[i][j]);
                }
            }
        }
        the.queue.push({
            type: 'race',
            list: list,
        });
        run();
        return the;
    };
    the.fail = function () {
        if (arguments.length == 0) {
            return the;
        }
        var list = [];
        for (var i in arguments) {
            if (typeof arguments[i] == 'function') {
                list.push(arguments[i]);
            } else {
                for (var j in arguments[i]) {
                    list.push(arguments[i][j]);
                }
            }
        }
        the.queue.push({
            type: 'fail',
            list: list,
        });
        run();
        return the;
    };
    the.debug = function () {
        console.log(the.queue);
    };

    if (arguments.length) {
        the.then.apply(this, arguments);
    }
};


module.exports = vphp;