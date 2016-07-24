import React from 'react';
import {render} from 'react-dom';
import TimeAgo from 'react-timeago'
import {web3} from './web3plus.jsx';

var ConfirmingEvent = React.createClass({
  render: function() {
    return (
      <div className="confirmingEvent card">
     	<div className="progress"><span style={{paddingLeft: (this.props.confirmations / 12 * 100) + '%'}}></span></div>
      	<div className={'card-body ' + this.props.cardClass}>
	      	<div style={{float: 'right'}}>{this.props.confirmations} confirmations</div>
   	    	{this.props.children}
   	    </div>
      </div>
    );
  }
});

var PendingEvent = React.createClass({
  render: function() {
    return (
      <div className="pendingEvent card">
      	<div className={'card-body ' + this.props.cardClass}>
	      	<div style={{float: 'right'}}>Pending!</div>
   	    	{this.props.children}
   	    </div>
      </div>
    );
  }
});

var ConfirmedEvent = React.createClass({
  render: function() {
    return (
      <div className="confirmedEvent card-part">
      	<div className={'card-body ' + this.props.cardClass}>
	      	<div className="card-datestamp"><TimeAgo date={this.props.timestamp} /></div>
   	    	{this.props.children}
   	    </div>
      </div>
    );
  }
});

export class ConfirmEvent extends React.Component {
	render() {
		if (this.props.confirmed > 1000)
			return (<ConfirmedEvent timestamp={this.props.confirmed} cardClass={this.props.cardClass}>{this.props.children}</ConfirmedEvent>);
		else if (typeof this.props.confirmed == "number")
			return (<ConfirmingEvent confirmations={this.props.confirmed} cardClass={this.props.cardClass}>{this.props.children}</ConfirmingEvent>);
		else
			return (<PendingEvent cardClass={this.props.cardClass}>{this.props.children}</PendingEvent>);
	}
}

export class Log extends React.Component {
	constructor() {
		super();
		this.recentLogCount = 0;
		this.deferredUpdate = null;
		this.watches = [];
		this.state = {logs: []};
		this.log = [];
	}

	componentWillMount() { this.setupFilters(this.props.who, this.props.events, this.props.contract); }
	componentWillUnmount() { this.takeDownFilters(); }

	takeDownFilters() {
		this.watches.forEach(w => w.stopWatching());
		this.watches = [];
		this.setState({logs: []});
		this.log = [];
		this.recentLogCount = 0;
		this.deferredUpdate = null;
		this.noteLogChanged();
	}

	setupFilters(who, events, contract) {
		var t = this;
		for (var e in events) {
			var f = contract[e]({who: who}, {fromBlock: '0', toBlock: 'pending'});
			f.watch((error, l) => { t.pushLog(l); });
			this.watches.push(f);
		}
		var f = web3.eth.filter("latest");
		f.watch((error, latestHash) => { t.onNewBlock(latestHash); })
		this.watches.push(f);
	}

	componentWillReceiveProps(nextProps) {
		// TODO ...or events keys...
		if (nextProps.who !== this.props.who || nextProps.contract.address !== this.props.contract.address) {
			this.takeDownFilters();
			this.setupFilters(nextProps.who, nextProps.events, nextProps.contract);
		}
	}

	onNewBlock() {
		if (this.recentLogCount > 0)
			this.updateState();
	}

	pushLog(e) {
//		console.log(Date.now() + ": New log: " + JSON.stringify(e));
		e.order = (e.blockNumber || 1000000000) * 1000 + (e.transactionIndex || 0);
		var updated = false;
		for (var i = 0; i < this.log.length; ++i)
			if (this.log[i].transactionHash == e.transactionHash) {
				this.log[i] = e;
				updated = true;
			}
		if (!updated)
			this.log.push(e);
		this.log.sort(function (a, b) { return a.order - b.order; });
		this.noteLogChanged();
	}

	noteLogChanged() {
		if (this.deferredUpdate !== null)
			clearTimeout(this.deferredUpdate);
		var t = this;
		this.deferredUpdate = setTimeout(function(){ t.updateState() }, 100);	
	}

	// TODO: move logic into logitem - have them watch for new blocks and update as required.
	updateState() {
		var current = web3.eth.blockNumber;
		this.recentLogCount = 0;
		var logs = [];
		for (var i = this.log.length - 1; i >= 0; --i) {
			var e = this.log[i];
			var item;
			var status = '';
			var confirmed;
			if (e.type == "pending") {
				this.recentLogCount++;
				confirmed = null;
			} else if (e.type == "mined" && current < e.blockNumber + 12) {
				this.recentLogCount++;
				confirmed = current - e.blockNumber + 1;
			} else if (e.type == "mined") {
				confirmed = new Date(web3.eth.getBlock(e.blockNumber).timestamp * 1000);
			}
			logs.push({event: e.event, key: e.transactionHash, 'confirmed': confirmed, args: e.args});
		}
		this.setState({
			logs: logs 
		});
	}

	render () {
		return (<div className="log">
			{this.state.logs.map(l =>
				React.createElement(this.props.events[l.event], {key: l.key, confirmed: l.confirmed, args: l.args})
			)}
		</div>);
	}
}
