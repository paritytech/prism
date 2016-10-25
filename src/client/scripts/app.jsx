import styles from "../style.css";
import React from 'react';
import BigNumber from 'bignumber.js';
import {render} from 'react-dom';
import {web3} from './web3plus.jsx';
import {HexDump, Balance, InputBalance, TokenContractBalance, Account, AccountBalance} from './react-web3.jsx';
import {InteractionConsole} from './react-prism.jsx';
import {Log} from './react-events.jsx';
import {showVMTrace, processTrace, processVMTrace} from './react-vmtrace.jsx';

export var Prism = web3.eth.contract([{"constant":true,"inputs":[],"name":"forked","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"transferETC","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"transferETH","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"}]);


export class App extends React.Component {
	constructor() {
		super();
		this.state = {
			userAccount: web3.eth.defaultAccount
		};
		setInterval(this.checkUserAddresses.bind(this), 500);
	}

	checkUserAddresses() {
		var a = web3.eth.defaultAccount;
		if (a != this.state.userAccount) {
			this.setState({
				userAccount: a
			});
		}
	}

	render() {
		var thePrism = Prism.at(this.props.prism);

		window.thePrism = thePrism;

		var userAccount = this.state.userAccount;
		return <div id="app">
			<div id="youhave">You have <AccountBalance address={userAccount} contract={thePrism} /> to be split</div>
			<InteractionConsole account={userAccount} prism={thePrism}/>
			<div id="extrainfo"><span>Prism contract address: <Account addr={this.props.prism} /></span></div>
		</div>;
	}
}

// for debug console happiness.
window.web3 = web3;
window.Prism = Prism;
window.showVMTrace = showVMTrace;
window.processVMTrace = processVMTrace;
window.processTrace = processTrace;
window.showCallTrace = function(options) { showVMTrace(processVMTrace(web3.eth.traceCall(options, ['vmTrace']).vmTrace)) };
window.showReplayTrace = function(options) { showVMTrace(processVMTrace(web3.eth.traceReplayTransaction(options, ['vmTrace']).vmTrace)) };
