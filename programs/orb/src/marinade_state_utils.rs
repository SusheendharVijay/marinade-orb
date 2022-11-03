use anchor_lang::prelude::*;
use marinade_cpi::State;

use crate::{calc::proportional, error::OrbError};
pub fn total_cooling_down(marinade_state: &Account<State>) -> u64 {
    marinade_state
        .stake_system
        .delayed_unstake_cooling_down
        .checked_add(marinade_state.emergency_cooling_down)
        .expect("Total cooling down overflow")
}

pub fn total_lamports_under_control(marinade_state: &Account<State>) -> u64 {
    marinade_state
        .validator_system
        .total_active_balance
        .checked_add(total_cooling_down(marinade_state))
        .expect("Stake balance overflow")
        .checked_add(marinade_state.available_reserve_balance) // reserve_pda.lamports() - self.rent_exempt_for_token_acc
        .expect("Total SOLs under control overflow")
}

pub fn total_virtual_staked_lamports(marinade_state: &Account<State>) -> u64 {
    // if we get slashed it may be negative but we must use 0 instead
    total_lamports_under_control(marinade_state)
        .saturating_sub(marinade_state.circulating_ticket_balance) //tickets created -> cooling down lamports or lamports already in reserve and not claimed yet
}

/// calculate the amount of msol tokens corresponding to certain lamport amount
pub fn calc_msol_from_lamports(
    marinade_state: &Account<State>,
    stake_lamports: u64,
) -> Result<u64> {
    shares_from_value(
        stake_lamports,
        total_virtual_staked_lamports(marinade_state),
        marinade_state.msol_supply,
    )
}

pub fn check_address(
    actual_address: &Pubkey,
    reference_address: &Pubkey,
    field_name: &str,
) -> Result<()> {
    if actual_address == reference_address {
        Ok(())
    } else {
        msg!(
            "Invalid {} address: expected {} got {}",
            field_name,
            reference_address,
            actual_address
        );
        Err(OrbError::InvalidAddress.into())
    }
}

pub fn shares_from_value(value: u64, total_value: u64, total_shares: u64) -> Result<u64> {
    if total_shares == 0 {
        //no shares minted yet / First mint
        Ok(value)
    } else {
        proportional(value, total_shares, total_value)
    }
}
