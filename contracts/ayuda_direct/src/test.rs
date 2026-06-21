#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

const STIPEND: i128 = 1_000;
const PERIOD: u64 = 604_800; // one week in seconds

/// Env + token + a program funded with `funding`, initialized and started at
/// timestamp `start`.
fn setup(start: u64, funding: i128) -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|li| li.timestamp = start);

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = sac.address();
    let id = env.register_contract(None, AyudaDirect);
    let client = AyudaDirectClient::new(&env, &id);
    client.initialize(&admin, &token_addr, &STIPEND, &PERIOD);

    // fund the pool from a sponsor
    let sponsor = Address::generate(&env);
    StellarAssetClient::new(&env, &token_addr).mint(&sponsor, &funding);
    client.fund(&sponsor, &funding);

    (env, id, token_addr, admin)
}

// Test 1 (Happy path): fund -> enroll -> claim pays exactly one stipend.
#[test]
fn test_fund_enroll_claim() {
    let (env, id, token_addr, _admin) = setup(1_000_000, 10_000);
    let client = AyudaDirectClient::new(&env, &id);
    let ben = Address::generate(&env);

    client.enroll(&ben);
    client.claim(&ben);

    let token = TokenClient::new(&env, &token_addr);
    assert_eq!(token.balance(&ben), STIPEND);
    assert_eq!(client.program_balance(), 10_000 - STIPEND);
}

// Test 2 (Edge case): claiming twice within the period must revert.
#[test]
#[should_panic(expected = "claim too soon")]
fn test_double_claim_too_soon() {
    let (env, id, _token_addr, _admin) = setup(1_000_000, 10_000);
    let client = AyudaDirectClient::new(&env, &id);
    let ben = Address::generate(&env);

    client.enroll(&ben);
    client.claim(&ben);
    client.claim(&ben); // same timestamp, period not elapsed -> panic
}

// Test 3 (State verification): after a claim, the next-claim clock is set.
#[test]
fn test_claim_sets_schedule() {
    let start = 1_000_000;
    let (env, id, _token_addr, _admin) = setup(start, 10_000);
    let client = AyudaDirectClient::new(&env, &id);
    let ben = Address::generate(&env);

    assert_eq!(client.next_claim_time(&ben), 0); // never claimed yet
    client.enroll(&ben);
    client.claim(&ben);
    assert_eq!(client.next_claim_time(&ben), start + PERIOD);
    assert!(client.is_enrolled(&ben));
}

// Test 4 (Edge case): a non-enrolled address cannot claim.
#[test]
#[should_panic(expected = "not enrolled")]
fn test_claim_not_enrolled() {
    let (env, id, _token_addr, _admin) = setup(1_000_000, 10_000);
    let client = AyudaDirectClient::new(&env, &id);
    let stranger = Address::generate(&env);
    client.claim(&stranger);
}

// Test 5 (Happy path over time): claim again after the period elapses.
#[test]
fn test_second_claim_after_period() {
    let start = 1_000_000;
    let (env, id, token_addr, _admin) = setup(start, 10_000);
    let client = AyudaDirectClient::new(&env, &id);
    let ben = Address::generate(&env);

    client.enroll(&ben);
    client.claim(&ben);

    // advance the ledger clock past one full period
    env.ledger().with_mut(|li| li.timestamp = start + PERIOD + 1);
    client.claim(&ben);

    let token = TokenClient::new(&env, &token_addr);
    assert_eq!(token.balance(&ben), STIPEND * 2);
}