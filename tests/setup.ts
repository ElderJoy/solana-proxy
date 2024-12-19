import * as anchor from '@coral-xyz/anchor'
import { BN, Program, Idl } from '@coral-xyz/anchor'
import { Oft } from "../target/types/oft";
// import { Uln } from '../target/types/uln'
import { Endpoint } from '../tests/types/endpoint'
// import * as utils from '../scripts/utils'
// import { EVENT_SEED, MESSAGE_LIB_SEED, OAPP_SEED } from "@layerzerolabs/lz-solana-sdk-v2"
import { ConfirmOptions, PublicKey, SystemProgram, Signer } from '@solana/web3.js'
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createWeb3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import bs58 from 'bs58'

// import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import {
    createNoopSigner,
    createSignerFromKeypair,
    percentAmount,
    publicKey,
    transactionBuilder, EddsaInterface, signerIdentity
} from '@metaplex-foundation/umi'
import { OftPDA, OFT_DECIMALS, oft, types } from '@layerzerolabs/oft-v2-solana-sdk'

import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'

const DEFAULT_LOCAL_DECIMALS = 10

/**
 * Derive the keys needed for the OFT program.
 * @param programIdStr {string}
 */
export const deriveKeys = (programIdStr: string) => {
    const programId = publicKey(programIdStr)
    const eddsa: EddsaInterface = createWeb3JsEddsa()
    const oftDeriver = new OftPDA(programId)
    const lockBox = eddsa.generateKeypair()
    const escrowPK = lockBox.publicKey
    const [oftStorePda] = oftDeriver.oftStore(escrowPK)
    return {
        programId,
        lockBox,
        escrowPK,
        oftStorePda,
        eddsa,
    }
}

export const initOft = async (wallet: anchor.Wallet, oftProgram: Program<Oft>, endpointProgram: Program<Endpoint>) => {
    const [oappConfigPda, oappBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("OApp")],
        oftProgram.programId
    )

    const [oappRegistryPda, oappRegistryBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("OApp"), oappConfigPda.toBuffer()],
        endpointProgram.programId
    )

    const { programId, lockBox, escrowPK, oftStorePda, eddsa } = deriveKeys(oftProgram.programId.toString())
    // console.log("programId", programId.toString())
    // console.log("lockBox", lockBox)
    // console.log(escrowPK)
    // console.log(oftStorePda)
    // console.log(eddsa)

    // const umi = createUmi(connection.rpcEndpoint).use(mplToolbox())
    // const signer = createSignerFromKeypair({ eddsa }, { publicKey: fromWeb3JsPublicKey(wallet.payer.publicKey), secretKey: wallet.payer.secretKey })
    // // const signer: Signer = wallet.payer;
    // const lockboxSigner = createSignerFromKeypair({ eddsa: eddsa }, lockBox)

    let oappRegistry
    try {
        oappRegistry = await endpointProgram.account.oAppRegistry.fetch(oappRegistryPda)
    } catch {
        // const { signature } = await transactionBuilder()
        //     .add(
        //         oft.initOft(
        //             {
        //                 payer: signer,
        //                 admin: fromWeb3JsPublicKey(wallet.publicKey),
        //                 mint: mint.publicKey,
        //                 escrow: lockboxSigner,
        //             },
        //             types.OFTType.Native,
        //             DEFAULT_LOCAL_DECIMALS,
        //             {
        //                 oft: programId,
        //                 token: tokenProgramId,
        //             }
        //         )
        //     )
        //     .sendAndConfirm(umi)

        await oftProgram.methods
            .initOft({
                admin: wallet.publicKey,
                endpointProgram: endpointProgram.programId,
                sharedDecimals: DEFAULT_LOCAL_DECIMALS,
                oftType: oftProgram.idl.types[18].type.variants[0],
            })
            .accounts({
                payer: wallet.publicKey,
                oappConfig: oappConfigPda,
                lzReceiveTypes: lzReceiveTypesPda,
                accountList: accountListPda,
                systemProgram: SystemProgram.programId,
            })
            .remainingAccounts([
                {
                    pubkey: endpointProgram.programId,
                    isWritable: true,
                    isSigner: false,
                },
                {
                    pubkey: wallet.publicKey,
                    isWritable: true,
                    isSigner: true,
                },
                {
                    pubkey: oappConfigPda,
                    isWritable: false,
                    isSigner: false,
                },
                {
                    pubkey: oappRegistryPda,
                    isWritable: true,
                    isSigner: false,
                },
                {
                    pubkey: SystemProgram.programId,
                    isWritable: false,
                    isSigner: false,
                },
                {
                    pubkey: eventAuthorityPda,
                    isWritable: true,
                    isSigner: false,
                },
                {
                    pubkey: endpointProgram.programId,
                    isWritable: true,
                    isSigner: false,
                },
            ])
            .rpc(confirmOptions)
        oappRegistry = await endpointProgram.account.oAppRegistry.fetch(oappRegistryPda)
    }

    return { oappRegistry, oappConfigPda }

}
