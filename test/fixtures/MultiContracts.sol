// SPDX-License-Identifier: MIT
// NOTE: Intentionally no `pragma` to allow compilation with different solc versions.

/**
 * @title Alpha
 * @notice Alpha contract for multi-contract generator test.
 */
contract Alpha {
    uint256 public value;

    constructor(uint256 initialValue) {
        value = initialValue;
    }

    /// @notice Set a new value in Alpha.
    function set(uint256 newValue) public {
        value = newValue;
    }
}

/**
 * @title Beta
 * @notice Beta contract for multi-contract generator test.
 */
contract Beta {
    uint256 public value;

    constructor(uint256 initialValue) {
        value = initialValue;
    }

    /// @notice Set a new value in Beta.
    function set(uint256 newValue) public {
        value = newValue;
    }
}

