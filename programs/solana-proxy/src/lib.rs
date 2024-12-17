use anchor_lang::prelude::*;

declare_id!("H8xZNU5ZNAySjGH2yfVWA6V5McxjZZkXN9j6CvC3evko");

#[program]
pub mod solana_proxy {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
