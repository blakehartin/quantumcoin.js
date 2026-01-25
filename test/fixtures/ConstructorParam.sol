// SPDX-License-Identifier: MIT
// NOTE: Intentionally no `pragma` to allow compilation with different solc versions.

/**
 * @title ConstructorParam
 * @notice Example contract used by generator E2E tests.
 */
contract ConstructorParam {
    uint256 public value;

    event ValueChanged(uint256 newValue);

    constructor(uint256 initialValue) {
        value = initialValue;
    }

    /// @notice Set a new stored value.
    function set(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }
}

