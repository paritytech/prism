import SolidityFunction from 'web3/lib/web3/function';
import Web3 from 'web3';

console.log(typeof(window.web3));

var isManaged = typeof(window.web3) == "object";
export var web3 = isManaged ? window.web3 : new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

if (web3.eth.accounts.indexOf(web3.eth.defaultAccount) == -1) {
	var best = 0;
	web3.eth.accounts.forEach(function(a) {
		var b = +web3.eth.getBalance(a);
		if (b > best) {
			web3.eth.defaultAccount = a;
			best = b;
		}
	});
	if (!isManaged && typeof(web3.eth.defaultAccount) != 'string') {
		web3.eth.defaultAccount = "0x4d6bb4ed029b33cf25d0810b029bd8b1a6bcab7b";
	}
	console.log("Default account was undefined or invalid. Now set to: " + web3.eth.defaultAccount);
}

// Usage example:
// web3.eth.traceCall({
//     to: theChicken.address,
//     data: theChicken.withdraw.getData(100000000000000000),
//     gas: 100000
//   },
//   `["trace", "vmTrace", "stateDiff"]
//  )
web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'traceCall',
			call: 'trace_call',
			params: 2,
			inputFormatter: [web3._extend.formatters.inputCallFormatter, null]
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'traceSendRawTransaction',
			call: 'trace_sendRawTransaction',
			params: 2,
			inputFormatter: [null, null]
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'gasPriceStatistics',
			call: 'ethcore_gasPriceStatistics',
			params: 0,
			outputFormatter: function(a) { return a.map(web3.toBigNumber); }
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'accountsInfo',
			call: 'personal_accountsInfo',
			outputFormatter: function(m) { Object.keys(m).forEach(k => {
				m[k].meta = JSON.parse(m[k].meta);
				m[k].meta.name = m[k].name;
				m[k].meta.uuid = m[k].uuid;
				m[k] = m[k].meta;
			}); return m; },
			params: 0
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'setAccountName',
			call: 'personal_setAccountName',
			params: 2,
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'setAccountMeta',
			call: 'personal_setAccountMeta',
			params: 2,
			inputFormatter: [a => a, JSON.stringify]
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'postTransaction',
			call: 'eth_postTransaction',
			params: 1,
			inputFormatter: [web3._extend.formatters.inputCallFormatter]
		})
	]
});

web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'checkTransaction',
			call: 'eth_checkTransaction',
			params: 1
		})
	]
});

{
	var postTransaction = web3.eth.postTransaction.bind(web3.eth);
	var sendTransaction = web3.eth.sendTransaction.bind(web3.eth);
	web3.eth.sendTransaction = function(options, f) {
		// No callback - do sync API.
		if (typeof f != "function")
			return sendTransaction(options);
		// Callback - use async API.
		var id = postTransaction(options);
		var timer_id = window.setInterval(check, 500);
		function check() {
			let r = web3.eth.checkTransaction(id);
			if (typeof r == 'string') {
				clearInterval(timer_id);
				if (r == "0x0000000000000000000000000000000000000000000000000000000000000000")
					f("Rejected", r);
				else
					f(null, r);
			}
		}
	}
}

web3.eth.installInterceptor = function(interceptor) {
	var oldSendTransaction = web3.eth.sendTransaction.bind(web3.eth);
	web3.eth.sendTransaction = function(options, f) {
		if (interceptor(options) == false)
			return "0x0000000000000000000000000000000000000000000000000000000000000000";
		return oldSendTransaction(options, f);
	};
}
