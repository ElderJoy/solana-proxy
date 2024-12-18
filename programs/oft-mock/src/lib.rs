use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use errors::*;
use events::*;
use instructions::*;
use state::*;

use oapp::endpoint::{MessagingReceipt};

declare_id!("7CfFVr1LEaBNjDhBJWrohW4xBxx6rKRUYTGpYpToBCdk");

pub const OFT_SEED: &[u8] = b"OFT";
pub const PEER_SEED: &[u8] = b"Peer";
pub const LZ_RECEIVE_TYPES_SEED: &[u8] = oapp::LZ_RECEIVE_TYPES_SEED;

#[program]
pub mod oft_mock {
    use super::*;

    pub fn send(
        mut ctx: Context<Send>,
        params: SendParams,
    ) -> Result<(MessagingReceipt, OFTReceipt)> {
        Send::apply(&mut ctx, &params)
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct OFTReceipt {
    pub amount_sent_ld: u64,
    pub amount_received_ld: u64,
}