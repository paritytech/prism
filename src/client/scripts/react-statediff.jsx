import 'jquery';
import BigNumber from 'bignumber.js';
import React from 'react';
import {render} from 'react-dom';
import {paddedHex, HexDump, Balance, Account} from './react-web3.jsx';

class BalanceDiff extends React.Component {
	render() {
		if (this.props.diff['*']) {
			return <div><Balance signed={true} value={(new BigNumber(this.props.diff['*'].to)).sub(new BigNumber(this.props.diff['*'].from))}/>: <Balance value={this.props.diff['*'].from}/> -&gt; <Balance value={this.props.diff['*'].to}/></div>;
		} else if (this.props.diff['+']) {
			return <div><Balance signed={true} value={this.props.diff['+']}/></div>;
		} else if (this.props.diff['-']) {
			return <div><Balance value={(new BigNumber(this.props.diff['-'])).mul(-1)}/></div>;
		} else if (this.props.diff['=']) {
			return <div/>;
		}			
	}
}

class ChangedAccount extends React.Component {
	render() {
		return <BalanceDiff diff={this.props.diff.balance} />;
	}
}

class BornAccount extends React.Component {
	render() {
		return <span style={{color: "green"}}>{JSON.stringify(this.props.diff)}</span>;
	}
}

class DeadAccount extends React.Component {
	render() {
		return <span style={{color: "red"}}>---</span>;
	}
}

class AccountTitle extends React.Component {
	render() {
		return <div className={["title", this.props.type]}>
			{this.props.type == 'born' ? "+++" : this.props.type == 'died' ? "---" : ''}
			<Account addr={this.props.account}/>
		</div>;
	}
}

class AccountDiff extends React.Component {
	render () {
		var rest;
		var type;
		if (this.props.diff.balance['*'] || this.props.diff.balance['=']) {
			rest = <ChangedAccount diff={this.props.diff}/>;
			type = "alive";
		} else if (this.props.diff.balance['+']) {
			rest = <BornAccount diff={this.props.diff}/>;
			type = "born";
		} else if (this.props.diff.balance['-']) {
			rest = <DeadAccount diff={this.props.diff}/>;
			type = "died";
		}
		return (<div key={this.props.account} className={[type, "accountdiff"]}>
				<AccountTitle type={type} account={this.props.account}/>
				{rest}
			</div>);
	}
}

export class StateDiff extends React.Component {
	render () {
		var rows = [];
		for (var a in this.props.diff) {
			rows.push(<AccountDiff key={a} account={a} diff={this.props.diff[a]}/>)
		}
		return (<div>{rows}</div>);
	}
}
StateDiff.propTypes = { diff: React.PropTypes.object };

export function showStateDiff(diff) {
	var myWindow = window.open("", "MsgWindow", "width=600,height=800");
	myWindow.document.write('<div id="content"></div>');
	render(<StateDiff diff={diff} />, myWindow.document.getElementById('content'));
}
