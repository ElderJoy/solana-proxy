import * as anchor from "@coral-xyz/anchor";
import { BN, Program, Idl } from '@coral-xyz/anchor'
import { Oft } from "../target/types/oft";
import { Endpoint } from './types/endpoint'
import endpointIdl from './idl/endpoint.json'
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { initOft } from "./setup";


const LAYERZERO_ENDPOINT_PROGRAM_ID = new PublicKey('76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6')

describe("Test Solana OFT", () => {
    console.log("Get test environment and pdas")
    const provider = anchor.AnchorProvider.env()
    const wallet = provider.wallet as anchor.Wallet
    anchor.setProvider(provider)

    const oftProgram = anchor.workspace.Oft as Program<Oft>;
    const endpointProgram = new Program(endpointIdl as Idl, LAYERZERO_ENDPOINT_PROGRAM_ID, provider) as unknown as Program<Endpoint>

    before("Preparing test environment", async () => {
        await initOft(wallet, oftProgram, endpointProgram)
        console.log("✅ Init Oft")
    })

    it("Get OFT version", async () => {
        // Add your test here.
        const tx = await oftProgram.methods.oftVersion().rpc();
        console.log("Your transaction signature", tx);
    });

});
