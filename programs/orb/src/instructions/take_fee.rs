use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};
use marinade_cpi::State;

use crate::{
    error::OrbError, marinade_state_utils::calc_msol_from_lamports, state::OrbState, ORB_SEED,
};

pub fn take_fee(ctx: Context<TakeFee>) -> Result<()> {
    require_gt!(
        ctx.accounts.clock.epoch,
        ctx.accounts.state.current_epoch,
        OrbError::EpochNotOver
    );

    let (pda, bump) = Pubkey::find_program_address(&[ORB_SEED], ctx.program_id);

    require_keys_eq!(pda, ctx.accounts.orb_pda.key(), OrbError::InvalidPDA);

    let seeds = &[ORB_SEED, &[bump]];
    let signer_seeds = &[&seeds[..]];

    msg!("Current price: {}", ctx.accounts.state.current_msol_price);

    let new_msol_price = ctx.accounts.marinade_state.msol_price;
    // TESTING
    // let new_msol_price = new_price;

    msg!("new price: {}", ctx.accounts.marinade_state.msol_price);

    let fee = ctx.accounts.state.calculate_fee(
        ctx.accounts.msol_account.amount,
        new_msol_price,
        ctx.accounts.state.fee_rate,
    )?;

    msg!("fee in sol: {}", fee);

    let fee_msol = calc_msol_from_lamports(&ctx.accounts.marinade_state, fee)?;

    msg!("fee in msol: {}", fee_msol);

    msg!("msol balance: {}", ctx.accounts.msol_account.amount);

    transfer(
        ctx.accounts.into_transfer_ctx().with_signer(signer_seeds),
        fee_msol,
    )?;

    msg!(
        "Transferred {} msol to {}",
        fee_msol,
        ctx.accounts.treasury_msol_account.key()
    );

    // Updating the epoch related state (current_epoch, epoch_msol, epoch_msol_price)
    ctx.accounts
        .state
        .update_epoch_state(ctx.accounts.clock.epoch, new_msol_price)?;

    Ok(())
}

#[derive(Accounts)]
pub struct TakeFee<'info> {
    #[account(mut)]
    pub state: Box<Account<'info, OrbState>>,
    #[account(mut)]
    pub marinade_state: Box<Account<'info, State>>,
    #[account(mut, associated_token::mint=msol_mint, associated_token::authority=orb_pda)]
    pub msol_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint=msol_mint, associated_token::authority=state.public_goods_treasury)]
    pub treasury_msol_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, address = marinade_state.msol_mint.key())]
    pub msol_mint: Box<Account<'info, Mint>>,
    /// CHECK: Checked in take_fee fn
    pub orb_pda: AccountInfo<'info>,
    #[account(mut, address = state.psol_mint)]
    pub psol_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

impl<'info> TakeFee<'info> {
    pub fn into_transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_call = Transfer {
            from: self.msol_account.to_account_info().clone(),
            to: self.treasury_msol_account.to_account_info().clone(),
            authority: self.orb_pda.clone(),
        };

        let cpi_program = self.token_program.to_account_info().clone();

        CpiContext::new(cpi_program, cpi_call)
    }
}
