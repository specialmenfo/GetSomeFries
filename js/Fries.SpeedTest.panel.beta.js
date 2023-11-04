/*
README:https://github.com/VirgilClyne/GetSomeFries
*/

const $ = new Env("🍟 GetSomeFries: 🚄 SpeedTest v0.1.0(1).panel.beta");
const URL = new URLs();
const DataBase = {
	"Panel": {
		"Settings":{"Switch":true,"Title":"🚄 SpeedTest","Icon":"speedometer","IconColor":"#f48220","BackgroundColor":"#f6821f","Language":"auto"},
		"Configs": {
			"Request":{
				"IPv4":{"url":"https://ipv4-api.speedtest.net/getip","headers":{"referer":"https://www.speedtest.net/"}},
				"IPv4":{"url":"https://ipv6-api.speedtest.net/getip","headers":{"referer":"https://www.speedtest.net/"}},
				"Servers":{"url":"https://www.speedtest.net/api/js/servers?engine=js&limit=1&https_functional=true","headers":{"referer":"https://www.speedtest.net/"}},
				"Result":{"url":"https://www.speedtest.net/api/js/results?engine=js&https_functional=true","headers":{"referer":"https://www.speedtest.net/"}}
			},
			"i18n":{
				"zh-Hans":{"IPv4":"IPv4","IPv6":"IPv6","COLO":"托管中心","WARP_Level":"隐私保护","Account_Type":"账户类型","Data_Info":"流量信息","Unknown":"未知","Fail":"获取失败","WARP_Level_Off":"关闭","WARP_Level_On":"开启","WARP_Level_Plus":"增强","Account_Type_unlimited":"无限版","Account_Type_limited":"有限版","Account_Type_team":"团队版","Account_Type_plus":"WARP+","Account_Type_free":"免费版","Data_Info_Used":"已用","Data_Info_Residual":"剩余","Data_Info_Total":"总计","Data_Info_Unlimited":"无限"},
				"zh-Hant":{"IPv4":"IPv4","IPv6":"IPv6","COLO":"託管中心","WARP_Level":"隱私保護","Account_Type":"賬戶類型","Data_Info":"流量信息","Unknown":"未知","Fail":"獲取失敗","WARP_Level_Off":"關閉","WARP_Level_On":"開啟","WARP_Level_Plus":"增強","Account_Type_unlimited":"無限版","Account_Type_limited":"有限版","Account_Type_team":"團隊版","Account_Type_plus":"WARP+","Account_Type_free":"免費版","Data_Info_Used":"已用","Data_Info_Residual":"剩餘","Data_Info_Total":"總計","Data_Info_Unlimited":"無限"},
				"en":{"IPv4":"IPv4","IPv6":"IPv6","COLO":"Colo Center","WARP_Level":"WARP Level","Account_Type":"Account Type","Data_Info":"Data","Unknown":"Unknown","Fail":"Fail to Get","WARP_Level_Off":"OFF","WARP_Level_On":"ON","WARP_Level_Plus":"PLUS","Account_Type_unlimited":"Unlimited","Account_Type_limited":"Limited","Account_Type_team":"Team","Account_Type_plus":"WARP+","Account_Type_free":"Free","Data_Info_Used":"Used","Data_Info_Residual":"Remaining","Data_Info_Total":"Earned","Data_Info_Unlimited":"Unlimited"}
			}
		}
	}
};

/***************** Processing *****************/
(async () => {
	const { Settings, Configs, Caches } = setENV("GetSomeFries", "SpeedTest", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			const Language = (Settings?.Language == "auto") ? $environment?.language : Settings?.Language ?? "zh-Hans"
			const SessionGUID = "";
			// Step 1: 获取IP信息
			//const [Trace4, Trace6] = await Promise.allSettled([Cloudflare(Request, "trace4"), Cloudflare(Request, "trace6")]).then(results => results.map(result => formatTrace(result?.value, Language)));
			// Step 2: 获取服务器信息
			const Servers = await ReFetch(Configs.Request.Servers, Settings?.Proxy);
			$.log(`🚧 ${$.name}`, `Servers: ${JSON.stringify(Servers)}`, "");
			// Step 3: 下载测试
			//let DownloadUrl = `https://${Servers[0]?.cachefly ?? "cachefly"}.cdn.speedtest.net/mini/mini.zip`
			//let DownloadUrl = `https://${Servers[0]?.host}/download`
			const DownloadRequest = {
				"url": {
					"scheme": "https",
					"host": Servers[0]?.host,
					"path": "download",
					"query": {
						"size": 10000000,
						"nocache": randomUUID(),
						"guid": SessionGUID
					}
				},
				"headers": {
					"referer":"https://www.speedtest.net/"
				}
			};
			DownloadRequest.url = URL.stringify(DownloadRequest.url);
			let Download = await ReFetch(DownloadRequest, Settings?.Proxy);
			$.log(`🚧 ${$.name}`, `Download: ${JSON.stringify(Download)}`, "");
			// Step 4: 上传测试
			//let UploadUrl = `https://${Servers[0]?.host}/upload`
			const UploadRequest = {
				"url": {
					"scheme": "https",
					"host": Servers[0]?.host,
					"path": "upload",
					"query": {
						"nocache": randomUUID(),
						"guid": SessionGUID
					}
				},
				"headers": {
					"referer":"https://www.speedtest.net/",
					"content-type": "application/octet-stream",
				},
				"body": Download?.body,
			};
			UploadRequest.url = URL.stringify(UploadRequest.url);
			let Upload = await ReFetch(UploadRequest, Settings?.Proxy);
			$.log(`🚧 ${$.name}`, `Upload: ${JSON.stringify(Upload)}`, "");
			// Step 5: 获取结果信息
			Configs.Request.Result.body = {};
			const Result = await ReFetch(Configs.Request.Result, Settings?.Proxy);
			$.log(`🚧 ${$.name}`, `Result: ${JSON.stringify(Result)}`, "");
			// 构造面板信息
			let Panel = {};
			if ($.isStash()) Panel.title = Settings?.Title ?? "𝙒𝘼𝙍𝙋 𝙄𝙣𝙛𝙤"
			else Panel.title = Settings?.Title ?? "☁ 𝙒𝘼𝙍𝙋 𝙄𝙣𝙛𝙤"
			// 填充面板信息
			if ($.isLoon() || $.isQuanX()) {
				Panel.message = `${Configs.i18n[Language]?.IPv4 ?? "IPv4"}: ${Trace4?.ip ?? Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
					+ `${Configs.i18n[Language]?.IPv6 ?? "IPv6"}: ${Trace6?.ip ?? Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
					+ `${Configs.i18n[Language]?.COLO ?? "托管中心"}: ${Trace4?.loc ?? Trace6?.loc} | ${Trace4?.colo ?? Trace6?.colo | Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
					+ `${Configs.i18n[Language]?.WARP_Level ?? "隐私保护"}: ${Trace4?.warp?.toUpperCase() ?? Trace6?.warp?.toUpperCase() ?? Configs.i18n[Language]?.Fail ?? "获取失败"}`;
			} else if ($.isSurge() || $.isStash()) {
				if ($.isStash()) Panel.icon = Settings?.Icon ?? "https://raw.githubusercontent.com/shindgewongxj/WHATSINStash/main/icon/warp.png";
				else Panel.icon = Settings?.Icon ?? "lock.icloud.fill";
				Panel["icon-color"] = Settings?.IconColor ?? "#f48220";
				if ($.isStash()) Panel.backgroundColor = Settings?.BackgroundColor ?? "#f6821f";
				Panel.content = `${Configs.i18n[Language]?.IPv4 ?? "IPv4"}: ${Trace4?.ip ?? Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
					+ `${Configs.i18n[Language]?.IPv6 ?? "IPv6"}: ${Trace6?.ip ?? Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
					+ `${Configs.i18n[Language]?.COLO ?? "托管中心"}: ${Trace4?.loc ?? Trace6?.loc} | ${Trace4?.colo ?? Trace6?.colo | Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
					+ `${Configs.i18n[Language]?.WARP_Level ?? "隐私保护"}: ${Trace4?.warp?.toUpperCase() ?? Trace6?.warp?.toUpperCase() ?? Configs.i18n[Language]?.Fail ?? "获取失败"}`;
			};
			// 获取账户信息
			const Caches = $.getjson("@Cloudflare.1dot1dot1dot1.Caches", {});
			if (Caches?.url && Caches?.headers) {
				// 构造请求信息
				Request.url = Caches?.url;
				Request.headers = Caches?.headers ?? {};
				// 获取账户信息
				const Account = await Cloudflare(Request, "GET").then(result => formatAccount(result?.account ?? {}, Language));
				// 填充面板信息
				if ($.isLoon() || $.isQuanX()) {
					Panel.message += `\n`
						+ `${Configs.i18n[Language]?.Account_Type ?? "账户类型"}: ${Account?.data?.type ?? Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
						+ `${Configs.i18n[Language]?.Data_Info ?? "流量信息"}: ${Account?.data?.text ?? Configs.i18n[Language]?.Fail ?? "获取失败"}`;

				} else if ($.isSurge() || $.isStash()) {
					Panel.content += `\n`
						+ `${Configs.i18n[Language]?.Account_Type ?? "账户类型"}: ${Account?.data?.type ?? Configs.i18n[Language]?.Fail ?? "获取失败"}\n`
						+ `${Configs.i18n[Language]?.Data_Info ?? "流量信息"}: ${Account?.data?.text ?? Configs.i18n[Language]?.Fail ?? "获取失败"}`;
				};
			};
			// 输出面板信息
			$.done(Panel);
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done())

/***************** Function *****************/
/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {String} platform - Platform Name
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platform, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getENV(name, platform, database);
	/***************** Settings *****************/
	Settings.Switch = JSON.parse(Settings.Switch) // BoxJs字符串转Boolean
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`✅ ${$.name}, Set Environment Variables`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	return { Settings, Caches, Configs }
};

function formatTrace(trace, language = $environment?.language ?? "zh-Hans", i18n = DataBase.Panel.Configs.i18n) {
	switch (trace?.warp) {
		case "off":
			trace.warp += ` | ${i18n[language]?.WARP_Level_Off ?? "关闭"}`;
			break;
		case "on":
			trace.warp += ` | ${i18n[language]?.WARP_Level_On ?? "开启"}`;
			break;
		case "plus":
			trace.warp += ` | ${i18n[language]?.WARP_Level_Plus ?? "增强"}`;
			break;
		case undefined:
			break;
		default:
			trace.warp += ` | ${i18n[language]?.Unknown ?? "未知"}`;
			break;
	};
	return trace;
};

function formatAccount(account, language = $environment?.language ?? "zh-Hans", i18n = DataBase.Panel.Configs.i18n) {
	switch (account.account_type) {
		case "unlimited":
			account.data = {
				"type": `${account?.account_type?.toUpperCase()} | ${i18n[language]?.Account_Type_unlimited ?? "无限版"}`,
				"limited": false,
			}
			break;
		case "limited":
			account.data = {
				"type": `${account?.account_type?.toUpperCase()} | ${i18n[language]?.Account_Type_limited ?? "有限版"}`,
				"limited": true,
				"used": account.premium_data - account.quota,
				"flow": account.quota,
				"total": account.premium_data
			}
			break;
		case "team":
			account.data = {
				"type": `${account?.account_type?.toUpperCase()} | ${i18n[language]?.Account_Type_team ?? "团队版"}`,
				"limited": false,
			}
			break;
		case "plus":
			account.data = {
				"type": `${account?.account_type?.toUpperCase()} | ${i18n[language]?.Account_Type_plus ?? "WARP+"}`,
				"limited": false,
			}
			break;
		case "free":
			account.data = {
				"type": `${account?.account_type?.toUpperCase()} | ${i18n[language]?.Account_Type_free ?? "免费版"}`,
				"limited": true,
				"used": account.premium_data - account.quota,
				"flow": account.quota,
				"total": account.premium_data
			}
			break;
		default:
			account.data = {
				"type": `${account?.account_type} | ${i18n[language]?.Unknown ?? "未知"}`,
				"limited": undefined
			}
			break;
	};

	switch (account.data.limited) {
		case true:
			// 拼接文本
			account.data.text = `${i18n[language]?.Data_Info_Used ?? "已用"} | ${i18n[language]?.Data_Info_Residual ?? "剩余"} | ${i18n[language]?.Data_Info_Total ?? "总计"}`
				+ `\n${bytesToSize(account?.data?.used)} | ${bytesToSize(account?.data?.flow)} | ${bytesToSize(account?.data?.total)}`;
			break;
		case false:
			account.data.text = `♾️ | ${i18n[language]?.Data_Info_Unlimited ?? "无限"}`
			break;
		default:
			account.data.text = `UNKNOWN | ${i18n[language]?.Unknown ?? "未知"}`
			break;
	}
	return account;
};

/**
 * Construct Redirect Reqeusts
 * @author VirgilClyne
 * @param {Object} request - Original Request Content
 * @param {Object} proxyName - Proxies Name
 * @return {Object} Modify Request Content with Policy
 */
function ReReqeust(request = {}, proxyName = undefined) {
	$.log(`☑️ ${$.name}, Construct Redirect Reqeusts`, "");
	if (proxyName) {
		switch ($.getEnv()) {
			case "Loon":
				request.node = proxyName;
				break;
			case "Stash":
				request.headers["X-Stash-Selected-Proxy"] = encodeURI(proxyName);
				break;
			case "Surge":
				delete request.id;
				request.headers["X-Surge-Policy"] = proxyName;
				//break; // 无需break
			case "Shadowrocket":
				request.policy = proxyName;
				break;
			case "Quantumult X":
				delete request.method;
				delete request.scheme;
				delete request.sessionIndex;
				delete request.charset;
				//if (request.opts) request.opts.policy = proxyName;
				//else request.opts = { "policy": proxyName };
				$.lodash_set(request, "opts.policy", proxyName);
				break;
			default:
				break;
		};
	};
	delete request?.headers?.["Content-Length"];
	delete request?.headers?.["content-length"];
	if (ArrayBuffer.isView(request?.body)) request["binary-mode"] = true;
	//$.log(`🚧 ${$.name}, Construct Redirect Reqeusts`, `Request:${JSON.stringify(request)}`, "");
	$.log(`✅ ${$.name}, Construct Redirect Reqeusts`, "");
	return request;
};

/**
 * Fetch Ruled Reqeust
 * @author VirgilClyne
 * @param {Object} request - Original Request Content
 * @return {Promise<*>}
 */
async function Fetch(request = {}) {
	$.log(`☑️ ${$.name}, Fetch Ruled Reqeust`, "");
	const FORMAT = (request?.headers?.["Content-Type"] ?? request?.headers?.["content-type"])?.split(";")?.[0];
	$.log(`⚠ ${$.name}, Fetch Ruled Reqeust`, `FORMAT: ${FORMAT}`, "");
	if ($.isQuanX()) {
		switch (FORMAT) {
			case "application/json":
			case "text/xml":
			default:
				// 返回普通数据
				delete request.bodyBytes;
				break;
			case "application/x-protobuf":
			case "application/grpc":
				// 返回二进制数据
				delete request.body;
				if (ArrayBuffer.isView(request.bodyBytes)) request.bodyBytes = request.bodyBytes.buffer.slice(request.bodyBytes.byteOffset, request.bodyBytes.byteLength + request.bodyBytes.byteOffset);
				break;
			case undefined: // 视为无body
				// 返回普通数据
				break;
		};
	};
	let response = (request?.body ?? request?.bodyBytes)
		? await $.http.post(request)
		: await $.http.get(request);
	//$.log(`🚧 ${$.name}, Fetch Ruled Reqeust`, `Response:${JSON.stringify(response)}`, "");
	$.log(`✅ ${$.name}, Fetch Ruled Reqeust`, "");
	return response;
};

async function ReFetch(request = {}, Proxy = "") {
	switch ($.getEnv()) {
		case "Loon":
			Request = ReReqeust(Request, $environment?.params?.node);
			break;
		case "Quantumult X":
			Request = ReReqeust(Request, $environment?.params);
			break;
		case "Surge":
			Request.headers["x-surge-skip-scripting"] = "true";
			// break; // 无需break
		case "Shadowrocket":
		case "Stash":
			Request = ReReqeust(Request, Proxy);
			break;
	};
	return await Fetch(request);
};

function bytesToSize(bytes = 0, Precision = 4) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return (bytes / Math.pow(k, i)).toPrecision(Precision) + ' ' + sizes[i];
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t);break;case"Node.js":this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}

// https://github.com/VirgilClyne/GetSomeFries/blob/main/function/URL/URLs.embedded.min.js
function URLs(t){return new class{constructor(t=[]){this.name="URL v1.2.1",this.opts=t,this.json={scheme:"",host:"",path:"",type:"",query:{}}}parse(t){let s=t.match(/(?:(?<scheme>.+):\/\/(?<host>[^/]+))?\/?(?<path>[^?]+)?\??(?<query>[^/?]+)?/)?.groups??null;return s?.path?s.paths=s?.path?.split("/"):s.path="",s?.paths&&(s.type=s?.paths?.[s?.paths?.length-1]?.split(".")?.[1]),s?.query&&(s.query=Object.fromEntries(s.query.split("&").map((t=>t.split("="))))),s}stringify(t=this.json){let s="";return t?.scheme&&t?.host&&(s+=t.scheme+"://"+t.host),t?.path&&(s+=t?.host?"/"+t.path:t.path),t?.query&&(s+="?"+Object.entries(t.query).map((t=>t.join("="))).join("&")),s}}(t)}

/**
 * Get Environment Variables
 * @link https://github.com/VirgilClyne/GetSomeFries/blob/main/function/getENV/getENV.min.js
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
function getENV(key,names,database){let BoxJs=$.getjson(key,database),Argument={};if("undefined"!=typeof $argument&&Boolean($argument)){let arg=Object.fromEntries($argument.split("&").map((item=>item.split("="))));for(let item in arg)setPath(Argument,item,arg[item])}const Store={Settings:database?.Default?.Settings||{},Configs:database?.Default?.Configs||{},Caches:{}};Array.isArray(names)||(names=[names]);for(let name of names)Store.Settings={...Store.Settings,...database?.[name]?.Settings,...BoxJs?.[name]?.Settings,...Argument},Store.Configs={...Store.Configs,...database?.[name]?.Configs},BoxJs?.[name]?.Caches&&"string"==typeof BoxJs?.[name]?.Caches&&(BoxJs[name].Caches=JSON.parse(BoxJs?.[name]?.Caches)),Store.Caches={...Store.Caches,...BoxJs?.[name]?.Caches};return function traverseObject(o,c){for(var t in o){var n=o[t];o[t]="object"==typeof n&&null!==n?traverseObject(n,c):c(t,n)}return o}(Store.Settings,((key,value)=>("true"===value||"false"===value?value=JSON.parse(value):"string"==typeof value&&(value?.includes(",")?value=value.split(","):value&&!isNaN(value)&&(value=parseInt(value,10))),value))),Store;function setPath(object,path,value){path.split(".").reduce(((o,p,i)=>o[p]=path.split(".").length===++i?value:o[p]||{}),object)}}
