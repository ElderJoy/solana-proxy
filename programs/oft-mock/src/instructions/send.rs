use crate::*;
use anchor_spl::token_interface::{
    Mint, TokenAccount, TokenInterface,
};
use oapp::endpoint::{MessagingFee, MessagingReceipt};

#[event_cpi]
#[derive(Accounts)]
#[instruction(params: SendParams)]
pub struct Send<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [
            PEER_SEED,
            oft_store.key().as_ref(),
            &params.dst_eid.to_be_bytes()
        ],
        bump = peer.bump
    )]
    pub peer: Account<'info, PeerConfig>,
    #[account(
        mut,
        seeds = [OFT_SEED, oft_store.token_escrow.as_ref()],
        bump = oft_store.bump
    )]
    pub oft_store: Account<'info, OFTStore>,
    #[account(
        mut,
        token::authority = signer,
        token::mint = token_mint,
        token::token_program = token_program
    )]
    pub token_source: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        address = oft_store.token_escrow,
        token::authority = oft_store.key(),
        token::mint = token_mint,
        token::token_program = token_program
    )]
    pub token_escrow: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        address = oft_store.token_mint,
        mint::token_program = token_program
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl Send<'_> {
    pub fn apply(
        ctx: &mut Context<Send>,
        params: &SendParams,
    ) -> Result<(MessagingReceipt, OFTReceipt)> {
        msg!("Send instruction called");

        let msg_receipt = MessagingReceipt {
            guid: [0; 32],
            nonce: 0,
            fee: MessagingFee {
                native_fee: 0,
                lz_token_fee: 0,
            }
        };

        emit_cpi!(OFTSent {
            guid: msg_receipt.guid,
            dst_eid: params.dst_eid,
            from: ctx.accounts.token_source.key(),
            amount_sent_ld: params.amount_ld,
            amount_received_ld: 0,
        });

        Ok((
            msg_receipt,
            OFTReceipt {
                amount_sent_ld: params.amount_ld,
                amount_received_ld: 0,
            },
        ))
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SendParams {
    pub dst_eid: u32,
    pub to: [u8; 32],
    pub amount_ld: u64,
    pub min_amount_ld: u64,
    pub options: Vec<u8>,
    pub compose_msg: Option<Vec<u8>>,
    pub native_fee: u64,
    pub lz_token_fee: u64,
}
