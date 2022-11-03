use anchor_lang::prelude::*;
mod calc;
mod error;
mod instructions;
mod marinade_state_utils;
mod state;
mod token;
use instructions::*;

pub const ORB_SEED: &[u8] = b"orb_pda";

declare_id!("FtoHTcr7Khzp7DcYSEDw5QN2pFYbMipohBsGcNjrqRZ7");

#[program]
pub mod orb {

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        public_goods_treasury: Pubkey,
        fee_rate: u8,
    ) -> Result<()> {
        instructions::initialize(ctx, public_goods_treasury, fee_rate)
    }

    pub fn deposit_user(ctx: Context<DepositUser>, lamports: u64) -> Result<()> {
        instructions::deposit_user(ctx, lamports)
    }

    pub fn take_fee(ctx: Context<TakeFee>, new_price: u64) -> Result<()> {
        instructions::take_fee(ctx, new_price)
    }

    pub fn defund(ctx: Context<Defund>, lamports: u64) -> Result<()> {
        instructions::defund(ctx, lamports)
    }
}
