// Deployment script for AsTrade NFT Rewards System
// This script demonstrates how to deploy and initialize the contract

use hello_starknet::NFTRewards;
use hello_starknet::INFTRewardsDispatcher;
use hello_starknet::INFTRewardsDispatcherTrait;

// Achievement type constants
const ACHIEVEMENT_FIRST_TRADE: felt252 = 1;
const ACHIEVEMENT_10_TRADES: felt252 = 2;
const ACHIEVEMENT_100_TRADES: felt252 = 3;
const ACHIEVEMENT_DAILY_STREAK: felt252 = 4;
const ACHIEVEMENT_WEEKLY_STREAK: felt252 = 5;
const ACHIEVEMENT_PROFIT_MAKER: felt252 = 6;
const ACHIEVEMENT_VOLUME_TRADER: felt252 = 7;

// Deployment configuration
fn deploy_nft_rewards_system(
    admin: ContractAddress,
    base_uri: ByteArray
) -> INFTRewardsDispatcher {
    // Deploy the contract
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    
    // Create dispatcher for interaction
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Initialize achievement metadata
    initialize_achievement_metadata(dispatcher);
    
    dispatcher
}

// Initialize achievement metadata
fn initialize_achievement_metadata(dispatcher: INFTRewardsDispatcher) {
    // Add metadata for all achievement types
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_FIRST_TRADE,
        "First Trade - Complete your first trade on AsTrade"
    );
    
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_10_TRADES,
        "10 Trades - Complete 10 successful trades"
    );
    
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_100_TRADES,
        "100 Trades - Complete 100 successful trades"
    );
    
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_DAILY_STREAK,
        "Daily Streak - Trade for 7 consecutive days"
    );
    
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_WEEKLY_STREAK,
        "Weekly Streak - Trade for 4 consecutive weeks"
    );
    
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_PROFIT_MAKER,
        "Profit Maker - Achieve 10% profit in a single trade"
    );
    
    dispatcher.add_achievement_metadata(
        ACHIEVEMENT_VOLUME_TRADER,
        "Volume Trader - Trade over $10,000 in volume"
    );
}

// Example deployment with test data
fn deploy_with_test_data() -> INFTRewardsDispatcher {
    let admin = starknet::contract_address_const::<'admin'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let dispatcher = deploy_nft_rewards_system(admin, base_uri);
    
    // Mint some test rewards
    let test_user1 = starknet::contract_address_const::<'test_user1'>();
    let test_user2 = starknet::contract_address_const::<'test_user2'>();
    
    // Mint first trade achievement for test users
    dispatcher.mint_reward_nft(test_user1, ACHIEVEMENT_FIRST_TRADE);
    dispatcher.mint_reward_nft(test_user2, ACHIEVEMENT_FIRST_TRADE);
    
    // Mint additional achievements for user1
    dispatcher.mint_reward_nft(test_user1, ACHIEVEMENT_10_TRADES);
    dispatcher.mint_reward_nft(test_user1, ACHIEVEMENT_DAILY_STREAK);
    
    dispatcher
}

// Verify deployment
fn verify_deployment(dispatcher: INFTRewardsDispatcher) -> bool {
    // Check basic contract properties
    let name = dispatcher.name();
    let symbol = dispatcher.symbol();
    let total_rewards = dispatcher.get_total_rewards_minted();
    
    // Verify contract is properly initialized
    assert_eq!(name, "AsTrade Rewards");
    assert_eq!(symbol, "ATR");
    
    true
}

// Get deployment info
fn get_deployment_info(dispatcher: INFTRewardsDispatcher) -> (ByteArray, ByteArray, u256) {
    let name = dispatcher.name();
    let symbol = dispatcher.symbol();
    let total_rewards = dispatcher.get_total_rewards_minted();
    
    (name, symbol, total_rewards)
} 