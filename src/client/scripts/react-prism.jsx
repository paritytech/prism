import React from 'react';
import {render} from 'react-dom';
import BigNumber from 'bignumber.js';
import {InputBalance, Balance} from './react-web3.jsx';
import {ConfirmEvent} from './react-events.jsx';
import {Account} from 'dapps-react-ui';

/*export class Withdraw extends React.Component {
	render() {
		return (
			<ConfirmEvent confirmed={this.props.confirmed} cardClass="withdraw">
				<div className="card-label">withdraw</div>
				<Balance value={this.props.args.amount} /> (returned <Balance value={this.props.args.returned} />)
			</ConfirmEvent>
		);
	}
}*/

// TODO
/*
	componentWillMount() {
		this.filter = this.props.dao.allEvents({fromBlock: 'latest', toBlock: 'pending'});
		this.filter.watch(this.updateState.bind(this));
		// TODO: this should get called anyway.
		this.updateState();
	}

	componentWillUnmount() {
		this.filter.stopWatching();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.dao.address !== this.props.dao.address) {
			this.componentWillUnmount();
			this.componentWillMount();
		}
	}
*/

export class InteractionConsole extends React.Component {
	constructor() {
		super();
		this.split = this.split.bind(this);
	}

	split() {
		var b = web3.eth.getBalance(this.props.account);
		var dest = document.getElementById('dest').value;
		var val = +document.getElementById('amount').value * 1000000000000000000;
		this.props.prism.transferETC(dest, {from: this.props.account, value: val, gas: 100000}, (e, r) => {
			if (e) {
				alert("ERROR!\n" + e);
			} else {
				alert("All good!\n" + r);
			}
		});
	}

	render () {
		let b = web3.eth.getBalance(this.props.account);
		return <div>
			<div style={{paddingTop: "2em"}}>
				<div>Amount: <input id="amount" defaultValue={b / 1000000000000000000}/></div>
				<div>Destination: <input id="dest"/></div>
			</div>
			<a href="#" className="button" onClick={this.split}><span><img src="freemoney.jpg" alt="Split!" /></span></a>
		</div>;
	}
}
