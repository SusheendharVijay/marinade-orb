import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Orb } from "../target/types/orb";
import { LAMPORTS_PER_SOL, PublicKey, Keypair } from "@solana/web3.js";
import {
  createMint,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

const globalInfo: {
  payer: Keypair;
  psolMint: PublicKey;
  msolAccount: PublicKey;
  publicGoodsTreasury: PublicKey;
  userPsolAccount: PublicKey;
} = {
  payer: null,
  psolMint: null,
  msolAccount: null,
  publicGoodsTreasury: null,
  userPsolAccount: null,
};

describe("orb", () => {
  try {
    const msolMint = new PublicKey(
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
    );

    const marinadeState = new PublicKey(
      "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC"
    );

    const liqPoolMsolLeg = new PublicKey(
      "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE"
    );
    const liqPoolSolLegPda = new PublicKey(
      "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q"
    );
    const liqPoolMsolLegAuthority = new PublicKey(
      "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL"
    );
    const reservePda = new PublicKey(
      "Du3Ysj1wKbxPKkuPPnvzQLQh8oMSVifs3jGZjJWXFmHN"
    );
    const msolMintAuthority = new PublicKey(
      "3JLPCS1qM2zRw3Dp6V4hZnYHd4toMNPkNesXdX9tg6KM"
    );
    const marinadeProgram = new PublicKey(
      "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"
    );
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.getProvider();

    const program = anchor.workspace.Orb as Program<Orb>;
    const setup = async () => {
      const payer = anchor.web3.Keypair.generate();
      const signature = await provider.connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL * 1000
      );
      await provider.connection.confirmTransaction(signature, "confirmed");

      globalInfo.payer = payer;
    };

    it("It initializes a pool!", async () => {
      try {
        await setup();
        const { payer } = globalInfo;
        // Add your test here.
        const [poolPda] = await PublicKey.findProgramAddress(
          [Buffer.from("sol_pool")],
          program.programId
        );
        const [orbPda] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_pda")],
          program.programId
        );
        const [orbState] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_state")],
          program.programId
        );

        const psolMint = Keypair.generate();
        const publicGoodsTreasury = Keypair.generate();
        const msolMint = new PublicKey(
          "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
        );

        const marinadeState = new PublicKey(
          "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC"
        );
        const msolAccount = await getAssociatedTokenAddress(
          msolMint,
          orbPda,
          true
        );
        console.log("msolAccount", msolAccount.toBase58());
        console.log("msolMint", msolMint.toBase58());
        console.log("poolPda", poolPda.toBase58());
        console.log("orbPda", orbPda.toBase58());
        console.log("orbState", orbState.toBase58());

        const tx = await program.methods
          .initialize(publicGoodsTreasury.publicKey, 15)
          .accounts({
            solPoolPda: poolPda,
            msolAccount,
            msolMint,
            orbPda,
            payer: payer.publicKey,
            state: orbState,
            psolMint: psolMint.publicKey,
            marinadeState,
          })
          .signers([payer, psolMint])
          .rpc();

        console.log("Your transaction signature", tx);

        globalInfo.msolAccount = msolAccount;
        globalInfo.psolMint = psolMint.publicKey;
        globalInfo.publicGoodsTreasury = publicGoodsTreasury.publicKey;
      } catch (e) {
        console.log(e);
      }
    });

    it("It deposits to marinade!", async () => {
      try {
        const { payer, psolMint, msolAccount } = globalInfo;
        // Add your test here.
        const [poolPda] = await PublicKey.findProgramAddress(
          [Buffer.from("sol_pool")],
          program.programId
        );
        const [orbPda] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_pda")],
          program.programId
        );
        const [orbState] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_state")],
          program.programId
        );

        console.log("msolAccount", msolAccount.toBase58());
        console.log("msolMint", msolMint.toBase58());
        console.log("poolPda", poolPda.toBase58());
        console.log("orbPda", orbPda.toBase58());
        console.log("orbState", orbState.toBase58());

        const userPsolAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer,
          psolMint,
          payer.publicKey
        );

        const accountInfoI = await getAccount(provider.connection, msolAccount);
        console.log("msolAccount initial", accountInfoI.amount.toString());

        const tx = await program.methods
          .depositUser(new anchor.BN(1000000000))
          .accounts({
            solPoolPda: poolPda,
            msolAccount,
            msolMint: msolMint,
            orbPda,
            transferFrom: payer.publicKey,
            state: orbState,
            psolMint: psolMint,
            marinadeState,
            liqPoolMsolLeg,
            liqPoolSolLegPda,
            liqPoolMsolLegAuthority,
            reservePda,
            msolMintAuthority,
            marinadeProgram,
            userPsolAccount: userPsolAccount.address,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .signers([payer])
          .rpc();

        const currState = await program.account.orbState.fetch(orbState);
        console.log("currState", currState);

        globalInfo.userPsolAccount = userPsolAccount.address;

        console.log("Your transaction signature", tx);
      } catch (e) {
        console.log(e);
      }
    });

    it("It takes fee", async () => {
      console.log("waiting for next slot...");
      // excuse the terrible testing method
      await delay(20000);
      try {
        const { payer, psolMint, msolAccount, publicGoodsTreasury } =
          globalInfo;
        // Add your test here.
        const [poolPda] = await PublicKey.findProgramAddress(
          [Buffer.from("sol_pool")],
          program.programId
        );
        const [orbPda] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_pda")],
          program.programId
        );
        const [orbState] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_state")],
          program.programId
        );

        console.log("msolAccount", msolAccount.toBase58());
        console.log("msolMint", msolMint.toBase58());
        console.log("poolPda", poolPda.toBase58());
        console.log("orbPda", orbPda.toBase58());
        console.log("orbState", orbState.toBase58());

        const accountInfoI = await getAccount(provider.connection, msolAccount);
        console.log("msolAccount initial", accountInfoI.amount.toString());

        const treasuryMsolAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer,
          msolMint,
          publicGoodsTreasury
        );

        const tx = await program.methods
          // price change is added
          .takeFee()
          .accounts({
            msolAccount,
            msolMint: msolMint,
            orbPda,
            state: orbState,
            psolMint: psolMint,
            marinadeState,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            treasuryMsolAccount: treasuryMsolAccount.address,
            payer: payer.publicKey,
          })
          .signers([payer])
          .rpc();

        const accountInfoF = await getAccount(
          provider.connection,
          treasuryMsolAccount.address
        );
        console.log("treasury final", accountInfoF.amount.toString());
        console.log("Your transaction signature", tx);
      } catch (e) {
        console.log(e);
      }
    });
    it("Its defunds", async () => {
      try {
        const {
          payer,
          psolMint,
          msolAccount,
          publicGoodsTreasury,
          userPsolAccount,
        } = globalInfo;
        // Add your test here.
        const [poolPda] = await PublicKey.findProgramAddress(
          [Buffer.from("sol_pool")],
          program.programId
        );
        const [orbPda] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_pda")],
          program.programId
        );
        const [orbState] = await PublicKey.findProgramAddress(
          [Buffer.from("orb_state")],
          program.programId
        );

        console.log("msolAccount", msolAccount.toBase58());
        console.log("msolMint", msolMint.toBase58());
        console.log("poolPda", poolPda.toBase58());
        console.log("orbPda", orbPda.toBase58());
        console.log("orbState", orbState.toBase58());

        const accountInfoI = await getAccount(provider.connection, msolAccount);
        console.log("msolAccount initial", accountInfoI.amount.toString());

        const treasuryMsolAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer,
          msolMint,
          publicGoodsTreasury
        );

        const userMsolAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer,
          msolMint,
          payer.publicKey
        );

        const tx = await program.methods
          // price change is added
          .defund(new anchor.BN(50000000))
          .accounts({
            msolAccount,
            msolMint: msolMint,
            orbPda,
            state: orbState,
            psolMint: psolMint,
            marinadeState,
            user: payer.publicKey,
            userPsolAccount,
            userMsolAccount: userMsolAccount.address,
          })
          .signers([payer])
          .rpc();

        const accountInfoF = await getAccount(
          provider.connection,
          treasuryMsolAccount.address
        );
        console.log("treasury final", accountInfoF.amount.toString());
        console.log("Your transaction signature", tx);

        const finalPsolAccount = await getAccount(
          provider.connection,
          userPsolAccount
        );
        console.log("finalPsolAccount", finalPsolAccount.amount.toString());
        const finalMsolAmount = await getAccount(
          provider.connection,
          userMsolAccount.address
        );
        console.log("finalMsolAmount", finalMsolAmount.amount.toString());
      } catch (e) {
        console.log(e);
      }
    });
  } catch (e) {
    console.log(e);
  }
});
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
