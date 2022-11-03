import { PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
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
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

const initialize = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const program = getProgram();
    const connection = getConnection();
    const payer = getPayerKeypair();
    const pSolMint = Keypair.generate();
    const instructions = [];
    const { orbPda, orbState, poolPda } = await getMarindeInfo();

    console.log("orbpda", orbPda.toBase58());

    const msolAccount = await getAssociatedTokenAddress(msolMint, orbPda, true);

    // const userPSolAccount = await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   payer,
    //   psolMint
    //   userPk
    // );

    const tx = await program.methods
      .initialize(
        new PublicKey("orbxSkXtPo6ZQbyDSotq2VkSfALUMMSciiQrYNRRLrD"),
        15
      )
      .accounts({
        solPoolPda: poolPda,
        msolAccount,
        msolMint,
        orbPda,
        payer: payer.publicKey,
        state: orbState,
        psolMint: pSolMint.publicKey,
        marinadeState,
      })
      .signers([payer, pSolMint])
      .rpc();

    res.status(200).json({ success: true, tx: tx });
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
};

export default initialize;
