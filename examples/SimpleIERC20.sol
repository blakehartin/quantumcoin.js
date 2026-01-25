// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

/// @title IERC20
/// @notice Minimal ERC-20 interface (standard ABI surface).
interface IERC20 {
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  function totalSupply() external view returns (uint256);
  function balanceOf(address account) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);

  function transfer(address to, uint256 value) external returns (bool);
  function approve(address spender, uint256 value) external returns (bool);
  function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @title SimpleERC20
/// @notice A small deployable ERC-20 implementation for generator examples.
contract SimpleERC20 is IERC20 {
  string public name;
  string public symbol;
  uint8 public constant decimals = 18;

  uint256 public override totalSupply;
  mapping(address => uint256) public override balanceOf;
  mapping(address => mapping(address => uint256)) public override allowance;

  constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
    name = _name;
    symbol = _symbol;
    _mint(msg.sender, _initialSupply);
  }

  function transfer(address to, uint256 value) external override returns (bool) {
    _transfer(msg.sender, to, value);
    return true;
  }

  function approve(address spender, uint256 value) external override returns (bool) {
    allowance[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) external override returns (bool) {
    uint256 allowed = allowance[from][msg.sender];
    require(allowed >= value, "ALLOWANCE");
    if (allowed != uint256(-1)) {
      allowance[from][msg.sender] = allowed - value;
      emit Approval(from, msg.sender, allowance[from][msg.sender]);
    }
    _transfer(from, to, value);
    return true;
  }

  function _transfer(address from, address to, uint256 value) internal {
    require(to != address(0), "TO_ZERO");
    uint256 bal = balanceOf[from];
    require(bal >= value, "BALANCE");
    balanceOf[from] = bal - value;
    balanceOf[to] += value;
    emit Transfer(from, to, value);
  }

  function _mint(address to, uint256 value) internal {
    require(to != address(0), "MINT_TO_ZERO");
    totalSupply += value;
    balanceOf[to] += value;
    emit Transfer(address(0), to, value);
  }
}

