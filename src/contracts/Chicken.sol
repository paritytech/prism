contract Chicken
{
	event Deposit(address indexed who, uint amount);
	event Withdraw(address indexed who, uint amount, uint returned);
	
	function() {
		deposits += msg.value;
		balance[msg.sender] += msg.value;
		
		Deposit(msg.sender, msg.value);
	}
	
	function withdraw(uint _amount) {
		if (_amount > balance[msg.sender])
			_amount = balance[msg.sender];
		
		var ret = _amount * (withdraws >= deposits / 2 ? (100 + swing) : (100 - swing)) / 100;
		balance[msg.sender] -= _amount;
		withdraws += _amount;
		msg.sender.send(ret);

		Withdraw(msg.sender, _amount, ret);
	}
	
	uint public constant swing = 10;
	mapping (address => uint) public balance;
	uint public withdraws = 0;
	uint public deposits = 0;
}
