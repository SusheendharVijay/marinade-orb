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

const DefundSchema = z.object({
  amount: z.number().positive(),
  userPk: z.string().transform((c) => new PublicKey(c)),
});

const defund = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { amount, userPk } = DefundSchema.parse(req.body);

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

    const userMsolAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      msolMint,
      userPk
    );

    const ix = await program.methods
      .defund(new anchor.BN(amount * LAMPORTS_PER_SOL))
      .accounts({
        msolAccount: state.msolAccount,
        msolMint: msolMint,
        orbPda,
        user: payer.publicKey,
        state: orbState,
        psolMint: state.psolMint,
        marinadeState,
        userPsolAccount: userPsolAccount.address,
        userMsolAccount: userMsolAccount.address,
      })
      //   .signers([payer])
      .instruction();
    const txn = new anchor.web3.Transaction().add(ix);

    txn.feePayer = userPk;
    const blockHashObj = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockHashObj.blockhash;
    const serializedJson = txn
      .serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      })
      .toJSON();

    res.status(200).json({ success: true, serialized: serializedJson.data });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error });
  }
};

export default defund;
