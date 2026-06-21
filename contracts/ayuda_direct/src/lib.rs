#![no_std]
//! # Ayuda Direct
//!
//! Direct, leak-proof cash assistance ("ayuda") on Stellar. A government unit
//! or NGO funds a program pool once. Enrolled beneficiaries then *pull* a fixed
//! stipend themselves, at most once per `period` (e.g. weekly or monthly). No
//! middlemen handle the cash, and every claim is recorded on-chain.
//!
//! The pull model matters: instead of an operator pushing thousands of manual
//! payouts (slow, skimmable), each recipient claims their own stipend, and the
//! contract enforces the schedule with the ledger clock.

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Token,
    Stipend,            // fixed amount paid per claim (i128)
    Period,             // seconds that must pass between claims (u64)
    Enrolled(Address),  // beneficiary -> bool
    LastClaim(Address), // beneficiary -> u64 timestamp of last claim (0 = never)
}

#[contract]
pub struct AyudaDirect;

#[contractimpl]
impl AyudaDirect {
    /// One-time setup. `stipend` is the per-claim amount; `period` is the
    /// minimum number of seconds between a beneficiary's claims.
    pub fn initialize(env: Env, admin: Address, token: Address, stipend: i128, period: u64) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        if stipend <= 0 {
            panic!("stipend must be positive");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Stipend, &stipend);
        env.storage().instance().set(&DataKey::Period, &period);
    }

    /// Top up the program pool. Typically called by the LGU/NGO funding source,
    /// but anyone may contribute. Tokens move from `from` into the contract.
    pub fn fund(env: Env, from: Address, amount: i128) {
        from.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token_addr).transfer(
            &from,
            &env.current_contract_address(),
            &amount,
        );
        env.events().publish((symbol_short!("fund"), from), amount);
    }

    /// Admin enrolls a beneficiary. Sets their clock to 0 so they can claim
    /// immediately the first time.
    pub fn enroll(env: Env, beneficiary: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage()
            .persistent()
            .set(&DataKey::Enrolled(beneficiary.clone()), &true);
        env.storage()
            .persistent()
            .set(&DataKey::LastClaim(beneficiary.clone()), &0u64);
        env.events().publish((symbol_short!("enroll"), beneficiary), ());
    }

    /// Beneficiary pulls their stipend. Allowed on the first call, then only
    /// once `period` seconds have elapsed since the previous claim.
    pub fn claim(env: Env, beneficiary: Address) {
        beneficiary.require_auth(); // recipient signs for their own claim

        let enrolled: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Enrolled(beneficiary.clone()))
            .unwrap_or(false);
        if !enrolled {
            panic!("not enrolled");
        }

        let period: u64 = env.storage().instance().get(&DataKey::Period).unwrap();
        let last: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::LastClaim(beneficiary.clone()))
            .unwrap_or(0);
        let now = env.ledger().timestamp();
        if last != 0 && now < last + period {
            panic!("claim too soon");
        }

        let stipend: i128 = env.storage().instance().get(&DataKey::Stipend).unwrap();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token_addr).transfer(
            &env.current_contract_address(),
            &beneficiary,
            &stipend,
        );

        env.storage()
            .persistent()
            .set(&DataKey::LastClaim(beneficiary.clone()), &now);
        env.events().publish((symbol_short!("claim"), beneficiary), stipend);
    }

    // ----------------------- read-only views -----------------------

    pub fn program_balance(env: Env) -> i128 {
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token_addr).balance(&env.current_contract_address())
    }

    pub fn is_enrolled(env: Env, who: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Enrolled(who))
            .unwrap_or(false)
    }

    /// Earliest timestamp at which `who` may claim again. Returns 0 if they
    /// have never claimed (eligible now).
    pub fn next_claim_time(env: Env, who: Address) -> u64 {
        let last: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::LastClaim(who))
            .unwrap_or(0);
        if last == 0 {
            return 0;
        }
        let period: u64 = env.storage().instance().get(&DataKey::Period).unwrap();
        last + period
    }

    pub fn stipend_amount(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Stipend).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;