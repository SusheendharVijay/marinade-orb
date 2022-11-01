use anchor_lang::error_code;

#[error_code]
pub enum OrbError {
    #[msg("Given msol mint does not match the one in the marinade state")]
    InvalidMSolMint,
}
