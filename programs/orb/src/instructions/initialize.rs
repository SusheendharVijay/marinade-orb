use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use marinade_cpi::State;

use crate::{
    error::OrbError,
    state::{OrbState, Pool},
    ORB_SEED,
};
pub fn initialize(
    ctx: Context<Initialize>,
    public_goods_treasury: Pubkey,
    fee_rate: u8,
) -> Result<()> {
    let (pda, _bump) = Pubkey::find_program_address(&[ORB_SEED], ctx.program_id);

    require_keys_eq!(pda, ctx.accounts.orb_pda.key(), OrbError::InvalidPDA);
    ctx.accounts.sol_pool_pda.bump = *ctx.bumps.get("sol_pool_pda").unwrap();
    let state = &mut ctx.accounts.state;
    state.psol_mint = ctx.accounts.psol_mint.key();
    state.msol_account = ctx.accounts.msol_account.key();
    state.bump = *ctx.bumps.get("state").unwrap();
    state.public_goods_treasury = public_goods_treasury;
    state.fee_rate = fee_rate;
    state.current_epoch = 0;
    state.current_epoch_msol = 0;
    state.current_msol_price = 0;
    state.new_epoch_msol = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The program's sol pool pda
    #[account(init, seeds=[b"sol_pool"], bump, payer=payer, space= 8 + Pool::MAX_SIZE)]
    pub sol_pool_pda: Account<'info, Pool>,
    // The program's msol token account
    #[account(init,payer=payer, associated_token::mint=msol_mint, associated_token::authority=orb_pda)]
    pub msol_account: Box<Account<'info, TokenAccount>>,
    #[account(init, payer=payer, mint::decimals=9, mint::authority=orb_pda.key())]
    pub psol_mint: Box<Account<'info, Mint>>,
    /// State of the marinade program
    #[account(init, payer=payer, seeds=[b"orb_state"], bump, space= 8 + OrbState::MAX_SIZE)]
    pub state: Box<Account<'info, OrbState>>,
    pub marinade_state: Account<'info, State>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Checking inside the initialize function
    pub orb_pda: AccountInfo<'info>,
    #[account(address = marinade_state.msol_mint)]
    pub msol_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}
