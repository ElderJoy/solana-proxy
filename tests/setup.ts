import * as anchor from '@coral-xyz/anchor'
import { BN, Program, Idl } from '@coral-xyz/anchor'
import { Oft } from "../target/types/oft";
// import { Uln } from '../target/types/uln'
import { Endpoint } from '../tests/types/endpoint'
// import * as utils from '../scripts/utils'
// import { EVENT_SEED, MESSAGE_LIB_SEED, OAPP_SEED } from "@layerzerolabs/lz-solana-sdk-v2"
import { ConfirmOptions, PublicKey, SystemProgram } from '@solana/web3.js'
import { deriveKeys } from '../tasks/solana/index'

export const initOft = async (wallet: anchor.Wallet, program: Program<Oft>, endpointProgram: Program<Endpoint>) => {
    const [oappConfigPda, oappBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("OApp")],
        program.programId
    )

    const { programId, lockBox, escrowPK, oftStorePda, eddsa } = deriveKeys(program.programId.toString())
    console.log("programId", programId.toString())
    console.log("lockBox", lockBox)
    console.log(escrowPK)
    console.log(oftStorePda)
    console.log(eddsa)
}
