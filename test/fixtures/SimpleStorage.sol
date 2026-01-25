// SPDX-License-Identifier: MIT
// NOTE: Intentionally no `pragma` to allow compilation with different solc versions.

contract SimpleStorage {
    uint256 private storedValue;

    event ValueChanged(uint256 newValue);

    function set(uint256 value) public {
        storedValue = value;
        emit ValueChanged(value);
    }

    function get() public view returns (uint256) {
        return storedValue;
    }
}

