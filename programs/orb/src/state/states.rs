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
    pub psol_mint: Pubkey,
    pub msol_account: Pubkey,
    pub current_epoch_msol: u64,
    pub new_epoch_msol: u64,
    pub current_epoch: u64,
    pub current_msol_price: u64,
    pub public_goods_treasury: Pubkey,
    pub fee_rate: u8,
    pub bump: u8,
}

impl OrbState {
    pub const MAX_SIZE: usize = std::mem::size_of::<Self>();

    pub fn update_epoch_msol(
        &mut self,
        current_epoch: u64,
        msol_amt: u64,
        msol_price: u64,
    ) -> Result<()> {
        if self.current_epoch == 0 {
            self.current_epoch = current_epoch;
            self.current_epoch_msol += msol_amt;
            self.current_msol_price = msol_price;
        } else if self.current_epoch == current_epoch {
            self.current_epoch_msol += msol_amt;
        } else {
            self.new_epoch_msol += msol_amt;
        }
        Ok(())
    }
    pub fn calculate_fee(
        &self,
        total_msol_pool: u64,
        new_msol_price: u64,
        fee_rate: u8,
    ) -> Result<u64> {
        let msol_price_diff = new_msol_price - self.current_msol_price;

        let current_epoch_rewards =
            total_msol_pool.saturating_sub(self.new_epoch_msol) * msol_price_diff;

        let fee = (current_epoch_rewards * (fee_rate as u64)) / 100;
        Ok(fee / 1_000_000_000)
    }

    pub fn update_epoch_state(&mut self, current_epoch: u64, new_msol_price: u64) -> Result<()> {
        self.current_epoch_msol = self.new_epoch_msol;
        self.current_epoch = current_epoch;
        self.new_epoch_msol = 0;
        self.current_msol_price = new_msol_price;
        Ok(())
    }
}

#[cfg(test)]
mod test {

    use solana_program::native_token::LAMPORTS_PER_SOL;

    use super::*;
    #[test]
    fn test_update_msol() {
        let mut state = OrbState {
            psol_mint: Pubkey::new_unique(),
            msol_account: Pubkey::new_unique(),
            current_epoch_msol: 0,
            new_epoch_msol: 0,
            current_msol_price: 10000,
            current_epoch: 0,
            public_goods_treasury: Pubkey::new_unique(),
            fee_rate: 0,
            bump: 0,
        };
        state.update_epoch_msol(1, 100, 1000).unwrap();
        assert_eq!(state.current_epoch_msol, 100);
        state.update_epoch_msol(1, 100, 1000).unwrap();
        assert_eq!(state.current_epoch_msol, 200);
        state.update_epoch_msol(2, 100, 1000).unwrap();
        assert_eq!(state.current_epoch_msol, 200);
        assert_eq!(state.new_epoch_msol, 100);
    }
    #[test]
    fn test_fee() {
        let mut state = OrbState {
            psol_mint: Pubkey::new_unique(),
            msol_account: Pubkey::new_unique(),
            current_epoch_msol: 0,
            new_epoch_msol: 0,
            current_msol_price: 0,
            current_epoch: 0,
            public_goods_treasury: Pubkey::new_unique(),
            fee_rate: 0,
            bump: 0,
        };
        // balance before is 10_000
        state
            .update_epoch_msol(1, 100, 1000 * LAMPORTS_PER_SOL)
            .unwrap();
        assert_eq!(state.current_epoch_msol, 100);
        state.update_epoch_msol(1, 100, 1000).unwrap();
        state
            .update_epoch_msol(2, 100, 1002 * LAMPORTS_PER_SOL)
            .unwrap();
        assert_eq!(state.current_epoch_msol, 200);
        assert_eq!(state.new_epoch_msol, 100);

        let fee = state
            .calculate_fee(10_300, 1002 * LAMPORTS_PER_SOL, 15)
            .unwrap();

        let real_fee = ((10_300 as u64).saturating_sub(100) * 15 * 2) / 100;
        assert_eq!(fee, real_fee);
    }

    #[test]
    fn test_update_epoch_state() {
        let mut state = OrbState {
            psol_mint: Pubkey::new_unique(),
            msol_account: Pubkey::new_unique(),
            current_epoch_msol: 0,
            new_epoch_msol: 0,
            current_msol_price: 10,
            current_epoch: 0,
            public_goods_treasury: Pubkey::new_unique(),
            fee_rate: 15,
            bump: 0,
        };

        state.update_epoch_msol(10, 100, 1000).unwrap();
        state.update_epoch_msol(10, 300, 1000).unwrap();
        state.update_epoch_msol(11, 50, 1002).unwrap();
        state.update_epoch_msol(11, 100, 1002).unwrap();

        assert_eq!(state.current_epoch_msol, 400);
        assert_eq!(state.new_epoch_msol, 150);
        assert_eq!(state.current_epoch, 10);
        assert_eq!(state.current_msol_price, 1000);

        state.update_epoch_state(11, 1002).unwrap();

        state.update_epoch_msol(11, 100, 1002).unwrap();
        state.update_epoch_msol(12, 100, 1002).unwrap();

        assert_eq!(state.current_epoch_msol, 250);

        assert_eq!(state.new_epoch_msol, 100);
        assert_eq!(state.current_epoch, 11);
        assert_eq!(state.current_msol_price, 1002);
    }
}
