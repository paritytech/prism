contract Chickenvest
{
	event Deposit(address indexed who, uint amount);
	event Withdraw(address indexed who, uint amount, uint returned);
	
	function() {
		if (now < finish) {
			deposits += msg.value;
			balance[msg.sender] += msg.value;

			Deposit(msg.sender, msg.value);
		}
	}
	
	function withdraw(uint _amount) {
		if (_amount > balance[msg.sender])
			_amount = balance[msg.sender];
		
		var ret = _amount;
		if (now < finish) {
			// time limit not up - early-exit punishment
			ret *= swing / 100;
		} else {
			// time limit up - they get 100% back unless they're in the latter portion of withdrawals equal to the amount withdrawn at a loss.
			if (lossy == uint(-1)) {
				// initialise the pot
				lost = withdraws;
			}
			if (withdraws >= deposits - lossy) {
				ret *= (100 + swing) / 100;
			}
		}

		balance[msg.sender] -= _amount;
		withdraws += _amount;
		msg.sender.send(ret);
		
		Withdraw(msg.sender, _amount, ret);
	}
	
	uint public constant swing = 10;
	mapping (address => uint) public balance;
	uint public withdraws = 0;
	uint public lossy = uint(-1);
	uint public deposits = 0;
	uint public finish = now + 1 years;
}
