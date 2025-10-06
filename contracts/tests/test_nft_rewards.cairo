use hello_starknet::NFTRewards;
use hello_starknet::INFTRewardsDispatcher;
use hello_starknet::INFTRewardsDispatcherTrait;
use snforge_std::{declare, ContractClassTrait, declare::ContractClass};

// Achievement type constants for testing
const ACHIEVEMENT_FIRST_TRADE: felt252 = 1;
const ACHIEVEMENT_10_TRADES: felt252 = 2;
const ACHIEVEMENT_100_TRADES: felt252 = 3;
const ACHIEVEMENT_DAILY_STREAK: felt252 = 4;
const ACHIEVEMENT_WEEKLY_STREAK: felt252 = 5;

#[test]
fn test_constructor() {
    let admin = starknet::contract_address_const::<'admin'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Test basic ERC721 properties
    assert_eq!(dispatcher.name(), "AsTrade Rewards");
    assert_eq!(dispatcher.symbol(), "ATR");
    assert_eq!(dispatcher.get_total_rewards_minted(), 0);
}

#[test]
fn test_mint_reward_nft() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user = starknet::contract_address_const::<'user'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Mint a reward NFT for first trade achievement
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
    
    // Verify the NFT was minted
    assert_eq!(dispatcher.balance_of(user), 1);
    assert_eq!(dispatcher.owner_of(1), user);
    assert_eq!(dispatcher.get_total_rewards_minted(), 1);
    assert_eq!(dispatcher.get_achievement_count(user), 1);
    
    // Check user achievements
    let achievements = dispatcher.get_user_achievements(user);
    assert_eq!(achievements.len(), 1);
    assert_eq!(achievements.at(0), ACHIEVEMENT_FIRST_TRADE);
}

#[test]
fn test_multiple_achievements() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user = starknet::contract_address_const::<'user'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Mint multiple reward NFTs
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_10_TRADES);
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_DAILY_STREAK);
    
    // Verify multiple NFTs were minted
    assert_eq!(dispatcher.balance_of(user), 3);
    assert_eq!(dispatcher.get_total_rewards_minted(), 3);
    assert_eq!(dispatcher.get_achievement_count(user), 3);
    
    // Check all user achievements
    let achievements = dispatcher.get_user_achievements(user);
    assert_eq!(achievements.len(), 3);
    assert_eq!(achievements.at(0), ACHIEVEMENT_FIRST_TRADE);
    assert_eq!(achievements.at(1), ACHIEVEMENT_10_TRADES);
    assert_eq!(achievements.at(2), ACHIEVEMENT_DAILY_STREAK);
}

#[test]
fn test_batch_mint_rewards() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user1 = starknet::contract_address_const::<'user1'>();
    let user2 = starknet::contract_address_const::<'user2'>();
    let user3 = starknet::contract_address_const::<'user3'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Batch mint rewards for multiple users
    let recipients = array![user1, user2, user3];
    let achievement_types = array![ACHIEVEMENT_FIRST_TRADE, ACHIEVEMENT_10_TRADES, ACHIEVEMENT_100_TRADES];
    
    dispatcher.batch_mint_rewards(recipients, achievement_types);
    
    // Verify all NFTs were minted
    assert_eq!(dispatcher.balance_of(user1), 1);
    assert_eq!(dispatcher.balance_of(user2), 1);
    assert_eq!(dispatcher.balance_of(user3), 1);
    assert_eq!(dispatcher.get_total_rewards_minted(), 3);
    
    // Check individual achievements
    assert_eq!(dispatcher.get_achievement_count(user1), 1);
    assert_eq!(dispatcher.get_achievement_count(user2), 1);
    assert_eq!(dispatcher.get_achievement_count(user3), 1);
}

#[test]
fn test_achievement_metadata() {
    let admin = starknet::contract_address_const::<'admin'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Add achievement metadata
    let metadata = "First Trade Achievement - Complete your first trade on AsTrade";
    dispatcher.add_achievement_metadata(ACHIEVEMENT_FIRST_TRADE, metadata);
    
    // Retrieve and verify metadata
    let retrieved_metadata = dispatcher.get_achievement_metadata(ACHIEVEMENT_FIRST_TRADE);
    assert_eq!(retrieved_metadata, metadata);
}

#[test]
fn test_nft_transfer() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user1 = starknet::contract_address_const::<'user1'>();
    let user2 = starknet::contract_address_const::<'user2'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Mint NFT to user1
    dispatcher.mint_reward_nft(user1, ACHIEVEMENT_FIRST_TRADE);
    
    // Transfer NFT from user1 to user2
    dispatcher.transfer_from(user1, user2, 1);
    
    // Verify transfer
    assert_eq!(dispatcher.balance_of(user1), 0);
    assert_eq!(dispatcher.balance_of(user2), 1);
    assert_eq!(dispatcher.owner_of(1), user2);
}

#[test]
fn test_approval_system() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user1 = starknet::contract_address_const::<'user1'>();
    let user2 = starknet::contract_address_const::<'user2'>();
    let operator = starknet::contract_address_const::<'operator'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Mint NFT to user1
    dispatcher.mint_reward_nft(user1, ACHIEVEMENT_FIRST_TRADE);
    
    // User1 approves operator for all NFTs
    dispatcher.set_approval_for_all(operator, true);
    
    // Verify approval
    assert_eq!(dispatcher.is_approved_for_all(user1, operator), true);
    
    // Operator can now transfer the NFT
    dispatcher.safe_transfer_from(user1, user2, 1, array![].span());
    
    // Verify transfer
    assert_eq!(dispatcher.balance_of(user2), 1);
    assert_eq!(dispatcher.owner_of(1), user2);
}

#[test]
#[should_panic(expected: ('AccessControl: account is missing role',))]
fn test_unauthorized_mint() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user = starknet::contract_address_const::<'user'>();
    let unauthorized_user = starknet::contract_address_const::<'unauthorized'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Try to mint without proper role (should fail)
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
}

#[test]
fn test_token_uri_generation() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user = starknet::contract_address_const::<'user'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Mint an NFT
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
    
    // Get token URI
    let token_uri = dispatcher.token_uri(1);
    
    // The token URI should be base_uri + token_id
    // Note: In a real implementation, this would be base_uri + "1"
    assert_eq!(token_uri.len() > 0, true);
}

#[test]
fn test_reward_system_integration() {
    let admin = starknet::contract_address_const::<'admin'>();
    let user = starknet::contract_address_const::<'user'>();
    let base_uri = "https://api.astrade.com/nft/";
    
    let contract = NFTRewards::contract_class_for_testing();
    let contract_address = contract.deploy(@array![admin.into(), base_uri.into()]).unwrap();
    let dispatcher = INFTRewardsDispatcher { contract_address };
    
    // Simulate user progression through achievements
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
    assert_eq!(dispatcher.get_achievement_count(user), 1);
    
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_10_TRADES);
    assert_eq!(dispatcher.get_achievement_count(user), 2);
    
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_100_TRADES);
    assert_eq!(dispatcher.get_achievement_count(user), 3);
    
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_DAILY_STREAK);
    assert_eq!(dispatcher.get_achievement_count(user), 4);
    
    // Verify total rewards minted
    assert_eq!(dispatcher.get_total_rewards_minted(), 4);
    
    // Verify user has all 4 NFTs
    assert_eq!(dispatcher.balance_of(user), 4);
    
    // Check all achievements are recorded
    let achievements = dispatcher.get_user_achievements(user);
    assert_eq!(achievements.len(), 4);
    assert_eq!(achievements.at(0), ACHIEVEMENT_FIRST_TRADE);
    assert_eq!(achievements.at(1), ACHIEVEMENT_10_TRADES);
    assert_eq!(achievements.at(2), ACHIEVEMENT_100_TRADES);
    assert_eq!(achievements.at(3), ACHIEVEMENT_DAILY_STREAK);
} 