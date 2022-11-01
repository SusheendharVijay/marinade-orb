use anchor_lang::prelude::*;

#[account]
pub struct Pool {
    pub bump: u8,
}

impl Pool {
    pub const MAX_SIZE: usize = std::mem::size_of::<Self>();
}

#[account]
pub struct OrbState {
    pub msol_mint: Pubkey,
    // Current supply of psol in circulation
    pub psol_supply: u64,
    pub msol_token_account: Pubkey,
    pub bump: u8,
}

impl OrbState {
    pub const MAX_SIZE: usize = std::mem::size_of::<Self>();
}
