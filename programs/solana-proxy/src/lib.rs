use anchor_lang::prelude::*;

declare_id!("Dut1zwap9h9P2FAohfivPyRbuq27TNgsQZuic4RpKzBF");

#[program]
pub mod solana_proxy {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
