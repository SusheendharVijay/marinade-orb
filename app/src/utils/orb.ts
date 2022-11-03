export type Orb = {
  "version": "0.1.0",
  "name": "orb",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "solPoolPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The program's sol pool pda"
          ]
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "State of the marinade program"
          ]
        },
        {
          "name": "marinadeState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "publicGoodsTreasury",
          "type": "publicKey"
        },
        {
          "name": "feeRate",
          "type": "u8"
        }
      ]
    },
    {
      "name": "depositUser",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solPoolPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marinadeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqPoolSolLegPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqPoolMsolLeg",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqPoolMsolLegAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reservePda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transferFrom",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPsolAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "User's psol account"
          ]
        },
        {
          "name": "msolMintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marinadeProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "takeFee",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marinadeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryMsolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "defund",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userMsolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marinadeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPsolAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "User's psol account"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "orbState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "psolMint",
            "type": "publicKey"
          },
          {
            "name": "msolAccount",
            "type": "publicKey"
          },
          {
            "name": "currentEpochMsol",
            "type": "u64"
          },
          {
            "name": "newEpochMsol",
            "type": "u64"
          },
          {
            "name": "currentEpoch",
            "type": "u64"
          },
          {
            "name": "currentMsolPrice",
            "type": "u64"
          },
          {
            "name": "publicGoodsTreasury",
            "type": "publicKey"
          },
          {
            "name": "feeRate",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMSolMint",
      "msg": "Given msol mint does not match the one in the marinade state"
    },
    {
      "code": 6001,
      "name": "InvalidPDA",
      "msg": "Given orb PDA does not match the real one"
    },
    {
      "code": 6002,
      "name": "CalculationFailure",
      "msg": "Calculation failure"
    },
    {
      "code": 6003,
      "name": "InvalidAddress",
      "msg": "Invalid address"
    },
    {
      "code": 6004,
      "name": "EpochNotOver",
      "msg": "Already taken fee for this epoch"
    },
    {
      "code": 6005,
      "name": "InsufficientFunds",
      "msg": "Not enough funds"
    }
  ]
};

export const IDL: Orb = {
  "version": "0.1.0",
  "name": "orb",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "solPoolPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The program's sol pool pda"
          ]
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "State of the marinade program"
          ]
        },
        {
          "name": "marinadeState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "publicGoodsTreasury",
          "type": "publicKey"
        },
        {
          "name": "feeRate",
          "type": "u8"
        }
      ]
    },
    {
      "name": "depositUser",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solPoolPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marinadeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqPoolSolLegPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqPoolMsolLeg",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqPoolMsolLegAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reservePda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transferFrom",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPsolAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "User's psol account"
          ]
        },
        {
          "name": "msolMintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marinadeProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "takeFee",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marinadeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryMsolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "defund",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "msolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userMsolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "psolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orbPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "msolMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marinadeState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPsolAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "User's psol account"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "orbState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "psolMint",
            "type": "publicKey"
          },
          {
            "name": "msolAccount",
            "type": "publicKey"
          },
          {
            "name": "currentEpochMsol",
            "type": "u64"
          },
          {
            "name": "newEpochMsol",
            "type": "u64"
          },
          {
            "name": "currentEpoch",
            "type": "u64"
          },
          {
            "name": "currentMsolPrice",
            "type": "u64"
          },
          {
            "name": "publicGoodsTreasury",
            "type": "publicKey"
          },
          {
            "name": "feeRate",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMSolMint",
      "msg": "Given msol mint does not match the one in the marinade state"
    },
    {
      "code": 6001,
      "name": "InvalidPDA",
      "msg": "Given orb PDA does not match the real one"
    },
    {
      "code": 6002,
      "name": "CalculationFailure",
      "msg": "Calculation failure"
    },
    {
      "code": 6003,
      "name": "InvalidAddress",
      "msg": "Invalid address"
    },
    {
      "code": 6004,
      "name": "EpochNotOver",
      "msg": "Already taken fee for this epoch"
    },
    {
      "code": 6005,
      "name": "InsufficientFunds",
      "msg": "Not enough funds"
    }
  ]
};
