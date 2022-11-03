import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IDL } from "../../utils/orb";
import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import * as anchor from "@project-serum/anchor";
import {
  getConnection,
  getMarindeInfo,
  getPayerKeypair,
  liqPoolMsolLeg,
  liqPoolMsolLegAuthority,
  liqPoolSolLegPda,
  marinadeProgram,
  marinadeState,
  msolMint,
  msolMintAuthority,
  reservePda,
} from "../../utils/programUtils";

import { getProgram } from "../../utils/programUtils";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const DepositSchema = z.object({
  amount: z.number().positive(),
  userPk: z.string().transform((c) => new PublicKey(c)),
});

const deposit = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { amount, userPk } = DepositSchema.parse(req.body);

    const { orbPda, orbState, poolPda } = await getMarindeInfo();

    const program = getProgram();
    const connection = getConnection();
    const payer = getPayerKeypair();
    const instructions = [];

    const state = await program.account.orbState.fetch(orbState);

    const userPsolAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      state.psolMint,
      userPk
    );

    const tx = await program.methods
      .depositUser(new anchor.BN(amount * LAMPORTS_PER_SOL))
      .accounts({
        solPoolPda: poolPda,
        msolAccount: state.msolAccount,
        msolMint: msolMint,
        orbPda,
        transferFrom: payer.publicKey,
        state: orbState,
        psolMint: state.psolMint,
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

    res.status(200).json({ success: true, tx });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error });
  }
};

export default deposit;
