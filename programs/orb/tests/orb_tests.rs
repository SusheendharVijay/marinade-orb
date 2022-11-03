use orb::program::Orb;
use solana_program_test::{processor, tokio, ProgramTest};
use solana_sdk::{account::AccountSharedData, signature::Keypair, signer::Signer};

pub trait Testing {
    fn add_new_account(&mut self) -> Keypair;
}
impl Testing for ProgramTest {
    fn add_new_account(&mut self) -> Keypair {
        let keypair = Keypair::new();
        let account =
            AccountSharedData::new(1000_000_000, 0, &solana_program::system_program::id());
        self.add_account(keypair.pubkey(), account.into());

        keypair
    }
}

#[tokio::test]
async fn test_program() {
    let mut validator = ProgramTest::default();
    validator.add_program("orb", orb::ID, processor!(orb::entry));
    let alice = validator.add_new_account();
    let bob = validator.add_new_account();
    let mut context = validator.start_with_context().await;
    // orb::
}
