use std::ops::Deref;

use crate::{
    error::OrbError,
    marinade_state_utils::calc_msol_from_lamports,
    state::{OrbState, Pool},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    token::{mint_to, MintTo},
    token::{Mint, Token, TokenAccount},
};
use marinade_cpi::{
    cpi::{accounts::Deposit, deposit},
    State,
};

pub const ORB_SEED: &[u8] = b"orb_pda";
pub fn deposit_user(ctx: Context<DepositUser>, lamports: u64) -> Result<()> {
    let (pda, bump) = Pubkey::find_program_address(&[ORB_SEED], ctx.program_id);

    require_keys_eq!(pda, ctx.accounts.orb_pda.key(), OrbError::InvalidPDA);

    let seeds = &[ORB_SEED, &[bump]];
    let signer_seeds = &[&seeds[..]];

    deposit(ctx.accounts.into_deposit_context(), lamports)?;

    msg!("Successfully deposited into marinade!");

    let msol_amt = calc_msol_from_lamports(ctx.accounts.marinade_state.deref(), lamports)?;

    msg!(
        "Minting {} msol to {}",
        msol_amt,
        ctx.accounts.msol_account.key()
    );

    mint_to(
        ctx.accounts.into_mint_context().with_signer(signer_seeds),
        msol_amt,
    )?;

    ctx.accounts.state.update_epoch_msol(
        ctx.accounts.clock.epoch,
        msol_amt,
        ctx.accounts.marinade_state.msol_price,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct DepositUser<'info> {
    #[account(mut, seeds=[b"orb_state"], bump= state.bump)]
    pub state: Box<Account<'info, OrbState>>,

    #[account(mut, seeds=[b"sol_pool"], bump=sol_pool_pda.bump)]
    pub sol_pool_pda: Box<Account<'info, Pool>>,

    #[account(mut, associated_token::mint=msol_mint, associated_token::authority=orb_pda)]
    pub msol_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, address = state.psol_mint)]
    pub psol_mint: Box<Account<'info, Mint>>,

    /// CHECK: Checking validity inside deposit_user
    pub orb_pda: AccountInfo<'info>,

    #[account(mut, address = marinade_state.msol_mint.key())]
    pub msol_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub marinade_state: Box<Account<'info, State>>,

    #[account(mut)]
    /// CHECK: the neccessary checks are done in the Marinade program
    pub liq_pool_sol_leg_pda: AccountInfo<'info>,

    #[account(mut)]
    pub liq_pool_msol_leg: Account<'info, TokenAccount>,
    /// CHECK: the neccessary checks are done in the Marinade program
    pub liq_pool_msol_leg_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: the neccessary checks are done in the Marinade program
    pub reserve_pda: AccountInfo<'info>,

    #[account(mut)]
    pub transfer_from: Signer<'info>,

    /// User's psol account
    #[account(mut, associated_token::mint = psol_mint, associated_token::authority = transfer_from)]
    pub user_psol_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: the neccessary checks are done in the Marinade program
    pub msol_mint_authority: AccountInfo<'info>,

    pub clock: Sysvar<'info, Clock>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub marinade_program: Program<'info, marinade_cpi::program::MarinadeFinance>,
}
impl<'info> DepositUser<'info> {
    fn into_deposit_context(&mut self) -> CpiContext<'_, '_, '_, 'info, Deposit<'info>> {
        let cpi_accounts = Deposit {
            state: self.marinade_state.to_account_info().clone(),
            msol_mint: self.msol_mint.to_account_info().clone(),
            liq_pool_msol_leg: self.liq_pool_msol_leg.to_account_info().clone(),
            liq_pool_sol_leg_pda: self.liq_pool_sol_leg_pda.to_account_info().clone(),
            liq_pool_msol_leg_authority: self.liq_pool_msol_leg_authority.to_account_info().clone(),
            reserve_pda: self.reserve_pda.to_account_info().clone(),
            transfer_from: self.transfer_from.to_account_info().clone(),
            mint_to: self.msol_account.to_account_info().clone(),
            msol_mint_authority: self.msol_mint_authority.to_account_info().clone(),
            system_program: self.system_program.to_account_info().clone(),
            token_program: self.token_program.to_account_info().clone(),
        };

        let cpi_program = self.marinade_program.to_account_info().clone();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    fn into_mint_context(&mut self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.psol_mint.to_account_info().clone(),
            to: self.user_psol_account.to_account_info().clone(),
            authority: self.orb_pda.clone(),
        };

        let cpi_program = self.token_program.to_account_info().clone();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
