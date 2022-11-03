use anchor_lang::error_code;

#[error_code]
pub enum OrbError {
    #[msg("Given msol mint does not match the one in the marinade state")]
    InvalidMSolMint,
    #[msg("Given orb PDA does not match the real one")]
    InvalidPDA,

    #[msg("Calculation failure")]
    CalculationFailure,

    #[msg("Invalid address")]
    InvalidAddress,

    #[msg("Already taken fee for this epoch")]
    EpochNotOver,

    #[msg("Not enough funds")]
    InsufficientFunds,
}
