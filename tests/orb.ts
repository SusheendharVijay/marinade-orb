import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Orb } from "../target/types/orb";
import { LAMPORTS_PER_SOL, PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const globalInfo: { payer: Keypair } = { payer: null };

describe("orb", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.Orb as Program<Orb>;
  const setup = async () => {
    // const payer = anchor.web3.Keypair.generate();
    // const signature = await provider.connection.requestAirdrop(
    //   payer.publicKey,
    //   LAMPORTS_PER_SOL * 1
    // );
    // await provider.connection.confirmTransaction(signature, "confirmed");
    const payer = Keypair.fromSecretKey(
      anchor.utils.bytes.bs58.decode(
        "2sTVDqinU89o5WBbdVDH8sCghdyH86iJV97112yxAmHrdCTNLGWJzfuhnzsmS3BJ8vUpHZzWZPjE7xHEGNQLiEqv"
      )
    );

    globalInfo.payer = payer;
  };

  it("It initializes a pool!", async () => {
    await setup();
    const { payer } = globalInfo;
    // Add your test here.
    const [poolPda] = await PublicKey.findProgramAddress(
      [Buffer.from("pool")],
      program.programId
    );
    const [orbPda] = await PublicKey.findProgramAddress(
      [Buffer.from("orb")],
      program.programId
    );
    const [orbState] = await PublicKey.findProgramAddress(
      [Buffer.from("state")],
      program.programId
    );

    const psolMint = Keypair.generate();
    const msolMint = new PublicKey(
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
    );
    const marinadeState = new PublicKey(
      "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC"
    );
    const msolAccount = await getAssociatedTokenAddress(msolMint, orbPda, true);
    console.log("msolAccount", msolAccount.toBase58());
    console.log("msolMint", msolMint.toBase58());
    console.log("poolPda", poolPda.toBase58());
    console.log("orbPda", orbPda.toBase58());
    console.log("orbState", orbState.toBase58());

    const tx = await program.methods
      .initialize()
      .accounts({
        solPoolPda: poolPda,
        msolAccount,
        msolMint: msolMint,
        orbPda,
        payer: payer.publicKey,
        state: orbState,
        psolMint: psolMint.publicKey,
        marinadeState,
      })
      .signers([payer, psolMint])
      .rpc();

    console.log("Your transaction signature", tx);
  });
});
