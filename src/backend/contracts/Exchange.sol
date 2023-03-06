// // SPDX-License-Identifier: UNLICENSED

// pragma solidity ^0.8.0;

// import "hardhat/console.sol";


// contract Exchange {

// 	// Track Fee Account
// 	address public feeAccount;
// 	uint256 public feePercent = 10;
// 	// token address mapped to user address => balance
// 	mapping(address => mapping(address => uint256)) public tokens;
// 	mapping(uint256 => _Order) public orders;
// 	mapping(uint256 => bool) public orderCancelled;
// 	mapping(uint256 => bool) public orderFilled;

// 	uint256 public ordersCount;

// 	event Deposit(
// 		address token, 
// 		address user, 
// 		uint256 amount, 
// 		uint256 balance
// 	);

// 	event Withdraw(
// 		address token, 
// 		address user, 
// 		uint256 amount, 
// 		uint256 balance
// 	);

// 	event Order(
// 		uint256 _id, 
// 		address _user, 
// 		address _tokenGet, 
// 		uint256 _amountGet,
// 		address _tokenGive,
// 		uint256 _amountGive,
// 		uint256 _timestamp
// 	);

// 	event Cancel(
// 		uint256 _id, 
// 		address _user, 
// 		address _tokenGet, 
// 		uint256 _amountGet,
// 		address _tokenGive,
// 		uint256 _amountGive,
// 		uint256 _timestamp
// 	);

// 	event Trade(
// 		uint256 _id, 
// 		address _user, 
// 		address _tokenGet, 
// 		uint256 _amountGet,
// 		address _tokenGive,
// 		uint256 _amountGive,
// 		address _creator,
// 		uint256 _timestamp
// 	);

// 	struct _Order {
// 		uint256 _id;
// 		address _user; // user who made order
// 		address _tokenGet;
// 		uint256 _amountGet;
// 		address _tokenGive;
// 		uint256 _amountGive;
// 		uint256 timestamp;
// 	}

// 	// Constructor
// 	constructor(address _feeAccount, uint256 _feePercent)
// 	{
// 		feeAccount = _feeAccount;
// 		feePercent = _feePercent;
// 	}

// 	// Deposit Tokens
// 	function depositToken(address _token, uint256 _amount) public {

// 		// Transfer tokens to exchange
// 		require(Token(_token).transferFrom(msg.sender, address(this), _amount));

// 		// Update user balance
// 		tokens[_token][msg.sender] += _amount;

// 		// Emit an event
// 		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);

// 	}

// 	// Withdraw Tokens
// 	function withdrawToken(address _token, uint256 _amount) public {

// 		// Ensure user has enough tokens to withdraw
// 		require(tokens[_token][msg.sender] >= _amount, "Reason A");

// 		// Transfer tokens to the user
// 		Token(_token).transfer(msg.sender, _amount);

// 		// Update user balance
// 		tokens[_token][msg.sender] -= _amount;

// 		// Emit a Withdrawal event
// 		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
// 	}

// 	// Check Balances
// 	function balanceOf(address _token, address _user)
// 		public
// 		view
// 		returns (uint256)
// 	{
// 		return tokens[_token][_user];
// 	}	

// 	// Make Orders


// 	// Token Give (the token they want to spend) - which token, and how much?
// 	// Token Get (the token they want to get) - which token, and how much?

// 	function makeOrder(
// 		address _tokenGet, 
// 		uint256 _amountGet,
// 		address _tokenGive, 
// 		uint256 _amountGive) 
// 		public 
// 	{
// 		require(balanceOf(_tokenGive, msg.sender) >= _amountGive, 'what the hell is going on here');

// 		ordersCount += 1;
// 		orders[ordersCount] =_Order(

// 			ordersCount, 
// 			msg.sender, 
// 			_tokenGet, 
// 			_amountGet, 
// 			_tokenGive, 
// 			_amountGive, 
// 			block.timestamp);

// 		emit Order(
// 			ordersCount,
// 			msg.sender,
// 			_tokenGet,
// 			_amountGet,
// 			_tokenGive,
// 			_amountGive,
// 			block.timestamp
// 		);

// 	} 

// 	function cancelOrder(uint256 _id) public {

// 		_Order storage _order = orders[_id];

// 		orderCancelled[_id] = true;

// 		require(address(_order._user) == msg.sender, "Reason B");

// 		require(_order._id == _id, "Reason C");

// 		emit Cancel(
// 			_order._id,
// 			msg.sender,
// 			_order._tokenGet,
// 			_order._amountGet,
// 			_order._tokenGive,
// 			_order._amountGive,
// 			block.timestamp
// 		);

// 	}

// 	function fillOrder(uint256 _id) public {

// 		require(_id > 0 && _id <= ordersCount, "Order does not exist");
// 		require(!orderFilled[_id], "Reason 2");
// 		require(!orderCancelled[_id], "Reason 3");

// 		_Order storage _order = orders[_id];

// 		_trade(
// 			_order._id, 
// 			_order._user,
// 			_order._tokenGet,
// 			_order._amountGet,
// 			_order._tokenGive,
// 			_order._amountGive
// 		);

// 		orderFilled[_order._id] = true;

// 	}

// 	function _trade(
// 		uint256 _orderId, 
// 		address _user,
// 		address _tokenGet,
// 		uint256 _amountGet,
// 		address _tokenGive,
// 		uint256 _amountGive
// 	) 
// 		internal 
// 	{

// 		//fee is paid by user who filled user, user2 in this case
// 		uint256 _feeAmount = (_amountGet * feePercent) / 100;

// 		// user 2 is filling the order
// 		// user 2 is msg.sender
// 		// user 1 created listing offering _tokenGive for _tokenGet
// 		// if user2 if filling the order, user2 is losing _tokenGet
// 		// by the specified _amountGet in user1's listing
// 		// user1 is giving _tokenGive in _amountGive amount to user2
// 		tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount);
// 		tokens[_tokenGet][_user] += _amountGet;

// 		tokens[_tokenGet][feeAccount] += _feeAmount;
		
// 		tokens[_tokenGive][_user] -= _amountGive;
// 		tokens[_tokenGive][msg.sender] += _amountGive;
		
// 		emit Trade(
// 			_orderId,
// 			msg.sender,
// 			_tokenGet,
// 			_amountGet,
// 			_tokenGive,
// 			_amountGive,
// 			_user,
// 			block.timestamp
// 		);

// 		// orders[_orderId] = 0;


// 	}

// }