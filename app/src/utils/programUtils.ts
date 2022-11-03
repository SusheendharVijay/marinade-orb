import {
  clusterApiUrl,
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  AnchorProvider,
  Program,
  Address,
  Idl,
  Wallet,
  web3,
  Provider,
} from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
// import idl from "../idl.json";

import { IDL, Orb } from "./orb";
import { ZodError } from "zod";

declare global {
  interface Window {
    phantom: any;
  }
}

export const getConnection = () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  return connection;
};
export const programID: Address =
  "FtoHTcr7Khzp7DcYSEDw5QN2pFYbMipohBsGcNjrqRZ7";
export const getMainnetConnection = () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  return connection;
};

export const getProgram = (): Program<Orb> => {
  const LHT: Keypair = web3.Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(process.env.LHT_SECRET_KEY as string)
  );

  const LHT_wallet = new Wallet(LHT);

  const opts = {
    preflightCommitment: "processed" as Commitment,
  };

  const provider: Provider = new AnchorProvider(
    getConnection(),
    LHT_wallet,
    opts
  );

  const program = new Program(IDL, programID, provider);
  return program;
};

export const getPayerKeypair = (): Keypair => {
  const LHT: Keypair = web3.Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(process.env.LHT_SECRET_KEY as string)
  );
  return LHT;
};

export const getBobKeypair = (): Keypair => {
  const bob: Keypair = web3.Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(process.env.ALICE_SECRET_KEY as string)
  );
  return bob;
};

export const getProvider = () => {
  if (typeof window !== "undefined") {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
  }

  //   window.open("https://phantom.app/", "_blank");
  console.log("not available");
};

export const isPhantomInstalled = () => window.phantom?.solana?.isPhantom;

export const isZodError = (error: any) => {
  return error instanceof ZodError;
};
export const msolMint = new PublicKey(
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
);

export const marinadeState = new PublicKey(
  "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC"
);

export const liqPoolMsolLeg = new PublicKey(
  "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE"
);
export const liqPoolSolLegPda = new PublicKey(
  "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q"
);
export const liqPoolMsolLegAuthority = new PublicKey(
  "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL"
);
export const reservePda = new PublicKey(
  "Du3Ysj1wKbxPKkuPPnvzQLQh8oMSVifs3jGZjJWXFmHN"
);
export const msolMintAuthority = new PublicKey(
  "3JLPCS1qM2zRw3Dp6V4hZnYHd4toMNPkNesXdX9tg6KM"
);
export const marinadeProgram = new PublicKey(
  "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"
);

export const getMarindeInfo = async () => {
  const [poolPda] = await PublicKey.findProgramAddress(
    [Buffer.from("sol_pool")],
    new PublicKey(programID)
  );
  const [orbPda] = await PublicKey.findProgramAddress(
    [Buffer.from("orb_pda")],
    new PublicKey(programID)
  );
  const [orbState] = await PublicKey.findProgramAddress(
    [Buffer.from("orb_state")],
    new PublicKey(programID)
  );

  return { poolPda, orbPda, orbState };
};
