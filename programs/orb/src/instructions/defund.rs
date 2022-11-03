use anchor_lang::prelude::*;
use anchor_spl::token::{burn, transfer, Burn, Mint, Token, TokenAccount, Transfer};
use marinade_cpi::State;

use crate::{calc::proportional, error::OrbError, state::OrbState, ORB_SEED};

pub fn defund(ctx: Context<Defund>, lamports: u64) -> Result<()> {
    let (pda, bump) = Pubkey::find_program_address(&[ORB_SEED], ctx.program_id);
    require_keys_eq!(pda, ctx.accounts.orb_pda.key(), OrbError::InvalidPDA);

    let seeds = &[ORB_SEED, &[bump]];
    let signer_seeds = &[&seeds[..]];

    require_gt!(
        ctx.accounts.user_psol_account.amount,
        lamports,
        OrbError::InsufficientFunds
    );

    let msol_amt = proportional(
        lamports,
        ctx.accounts.msol_account.amount,
        ctx.accounts.psol_mint.supply,
    )?;

    msg!("msol_amt: {}", msol_amt);
    msg!("psol amt: {}", lamports);

    transfer(
        ctx.accounts.into_transfer_ctx().with_signer(signer_seeds),
        msol_amt,
    )?;

    msg!(
        "Transferred {} msol to {}",
        msol_amt,
        ctx.accounts.user_msol_account.key()
    );

    burn(ctx.accounts.into_burn_ctx(), lamports)?;

    Ok(())
}

#[derive(Accounts)]
pub struct Defund<'info> {
    #[account(mut, seeds=[b"orb_state"], bump= state.bump)]
    pub state: Box<Account<'info, OrbState>>,

    #[account(mut, associated_token::mint=msol_mint, associated_token::authority=orb_pda)]
    pub msol_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint=msol_mint, associated_token::authority=user)]
    pub user_msol_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, address = state.psol_mint)]
    pub psol_mint: Box<Account<'info, Mint>>,

    /// CHECK: Checking validity inside deposit_user
    pub orb_pda: AccountInfo<'info>,

    #[account(mut, address = marinade_state.msol_mint.key())]
    pub msol_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub marinade_state: Box<Account<'info, State>>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// User's psol account
    #[account(mut, associated_token::mint = psol_mint, associated_token::authority = user)]
    pub user_psol_account: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,
}

impl<'info> Defund<'info> {
    pub fn into_transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_call = Transfer {
            from: self.msol_account.to_account_info().clone(),
            to: self.user_msol_account.to_account_info().clone(),
            authority: self.orb_pda.clone(),
        };

        let cpi_program = self.token_program.to_account_info().clone();

        CpiContext::new(cpi_program, cpi_call)
    }

    pub fn into_burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_call = Burn {
            mint: self.psol_mint.to_account_info().clone(),
            from: self.user_psol_account.to_account_info().clone(),
            authority: self.user.to_account_info().clone(),
        };

        let cpi_program = self.token_program.to_account_info().clone();

        CpiContext::new(cpi_program, cpi_call)
    }
}
