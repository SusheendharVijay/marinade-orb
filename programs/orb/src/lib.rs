use anchor_lang::prelude::*;
mod error;
mod state;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::mint_to,
    token::{Mint, Token, TokenAccount},
};
use marinade_cpi::{
    cpi::{accounts::Deposit, deposit},
    State,
};
use state::{OrbState, Pool};

pub const ORB_SEED: &[u8] = b"orb";

declare_id!("FtoHTcr7Khzp7DcYSEDw5QN2pFYbMipohBsGcNjrqRZ7");

#[program]
pub mod orb {
    use anchor_lang::solana_program::{lamports, program::invoke, system_instruction};

    use crate::error::OrbError;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Checking if the given mint is the same as the one in the marinade state
        require_keys_eq!(
            ctx.accounts.msol_mint.key(),
            ctx.accounts.marinade_state.msol_mint.key(),
            OrbError::InvalidMSolMint
        );

        ctx.accounts.sol_pool_pda.bump = *ctx.bumps.get("sol_pool_pda").unwrap();

        Ok(())
    }

    pub fn deposit_user(ctx: Context<DepositUser>, lamports: u64) -> Result<()> {
        let (pda, bump) = Pubkey::find_program_address(&[ORB_SEED], ctx.program_id);
        let seeds = &[ORB_SEED, &[bump]];
        let signer_seeds = &[&seeds[..]];

        invoke(
            &system_instruction::transfer(
                &ctx.accounts.transfer_from.key(),
                &ctx.accounts.sol_pool_pda.key(),
                lamports,
            ),
            &[
                ctx.accounts.transfer_from.to_account_info().clone(),
                ctx.accounts.sol_pool_pda.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;

        msg!("Deposited: {} sol in to the Orb program!", lamports);

        deposit(
            ctx.accounts
                .into_deposit_context()
                .with_signer(signer_seeds),
            lamports,
        )?;

        msg!("Successfully deposited into marinade!");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The program's sol pool pda
    #[account(init, seeds=[b"pool"], bump, payer=payer, space= 8 + Pool::MAX_SIZE)]
    pub sol_pool_pda: Account<'info, Pool>,
    // The program's msol token account
    #[account(init,payer=payer, associated_token::mint=msol_mint, associated_token::authority=orb_pda)]
    pub msol_account: Account<'info, TokenAccount>,
    #[account(init, payer=payer, mint::decimals=9, mint::authority=orb_pda)]
    pub psol_mint: Account<'info, Mint>,
    /// State of the marinade program
    #[account(init, payer=payer, seeds=[b"state"], bump, space= 8 + OrbState::MAX_SIZE)]
    pub state: Account<'info, OrbState>,
    pub marinade_state: Account<'info, State>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: as
    pub orb_pda: AccountInfo<'info>,
    pub msol_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(mut,seeds=[b"pool"], bump=pool_pda.bump)]
    pub pool_pda: Account<'info, Pool>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositUser<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,

    #[account(mut, seeds=[b"pool"], bump=sol_pool_pda.bump)]
    pub sol_pool_pda: Account<'info, Pool>,

    #[account(mut)]
    pub msol_mint: Account<'info, Mint>,

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

    #[account(mut)]
    pub mint_to: Account<'info, TokenAccount>,

    /// CHECK: the neccessary checks are done in the Marinade program
    pub msol_mint_authority: AccountInfo<'info>,

    /// CHECK: the neccessary checks are done in the Marinade program
    pub system_program: Program<'info, System>,
    /// CHECK: the neccessary checks are done in the Marinade program
    pub token_program: Program<'info, Token>,
    pub marinade_program: Program<'info, marinade_cpi::program::MarinadeFinance>,
}

impl<'info> DepositUser<'info> {
    fn into_deposit_context(&mut self) -> CpiContext<'_, '_, '_, 'info, Deposit<'info>> {
        let cpi_accounts = Deposit {
            state: self.state.to_account_info().clone(),
            msol_mint: self.msol_mint.to_account_info().clone(),
            liq_pool_msol_leg: self.liq_pool_msol_leg.to_account_info().clone(),
            liq_pool_sol_leg_pda: self.liq_pool_sol_leg_pda.to_account_info().clone(),
            liq_pool_msol_leg_authority: self.liq_pool_msol_leg_authority.to_account_info().clone(),
            reserve_pda: self.reserve_pda.to_account_info().clone(),
            transfer_from: self.transfer_from.to_account_info().clone(),
            mint_to: self.mint_to.to_account_info().clone(),
            msol_mint_authority: self.msol_mint_authority.to_account_info().clone(),
            system_program: self.system_program.to_account_info().clone(),
            token_program: self.token_program.to_account_info().clone(),
        };

        let cpi_program = self.marinade_program.to_account_info().clone();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
