// Example usage of the AsTrade NFT Rewards System
// This file demonstrates how to interact with the NFT rewards contract

use hello_starknet::INFTRewardsDispatcher;
use hello_starknet::INFTRewardsDispatcherTrait;

// Example achievement types for a trading application
const ACHIEVEMENT_FIRST_TRADE: felt252 = 1;
const ACHIEVEMENT_10_TRADES: felt252 = 2;
const ACHIEVEMENT_100_TRADES: felt252 = 3;
const ACHIEVEMENT_DAILY_STREAK: felt252 = 4;
const ACHIEVEMENT_WEEKLY_STREAK: felt252 = 5;
const ACHIEVEMENT_PROFIT_MAKER: felt252 = 6;
const ACHIEVEMENT_VOLUME_TRADER: felt252 = 7;

// Example function showing how to reward a user for their first trade
fn reward_first_trade(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress
) {
    // Mint NFT reward for first trade achievement
    dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
    
    // The contract will automatically:
    // 1. Mint a new NFT with the next available token ID
    // 2. Transfer ownership to the user
    // 3. Record the achievement in the user's achievement list
    // 4. Emit a RewardMinted event
}

// Example function showing how to reward multiple users for completing 10 trades
fn reward_multiple_users_10_trades(
    dispatcher: INFTRewardsDispatcher,
    users: Array<ContractAddress>
) {
    // Create achievement types array (all users get the same achievement)
    let mut achievement_types = array![];
    let mut i = 0;
    loop {
        if i >= users.len() {
            break;
        };
        achievement_types.append(ACHIEVEMENT_10_TRADES);
        i += 1;
    };
    
    // Batch mint rewards for all users
    dispatcher.batch_mint_rewards(users, achievement_types);
}

// Example function showing how to check user progress
fn check_user_progress(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress
) -> (u256, Array<felt252>) {
    // Get user's achievement count
    let achievement_count = dispatcher.get_achievement_count(user);
    
    // Get all user achievements
    let achievements = dispatcher.get_user_achievements(user);
    
    (achievement_count, achievements)
}

// Example function showing how to add achievement metadata
fn setup_achievement_metadata(dispatcher: INFTRewardsDispatcher) {
    // Add metadata for different achievement types
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

// Example function showing how to implement a trading milestone system
fn handle_trading_milestone(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress,
    trade_count: u256
) {
    // Check for different milestones and reward accordingly
    if trade_count == 1 {
        // First trade
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_FIRST_TRADE);
    } else if trade_count == 10 {
        // 10 trades milestone
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_10_TRADES);
    } else if trade_count == 100 {
        // 100 trades milestone
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_100_TRADES);
    };
    
    // Note: You would typically check if the user already has this achievement
    // to avoid duplicate minting. This is a simplified example.
}

// Example function showing how to implement a daily streak system
fn handle_daily_streak(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress,
    streak_days: u256
) {
    if streak_days == 7 {
        // 7-day streak achievement
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_DAILY_STREAK);
    } else if streak_days == 28 {
        // 4-week streak achievement
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_WEEKLY_STREAK);
    };
}

// Example function showing how to implement profit-based achievements
fn handle_profit_achievement(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress,
    profit_percentage: u256
) {
    if profit_percentage >= 10 {
        // 10% or higher profit achievement
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_PROFIT_MAKER);
    };
}

// Example function showing how to implement volume-based achievements
fn handle_volume_achievement(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress,
    total_volume: u256
) {
    if total_volume >= 10000 {
        // $10,000+ volume achievement
        dispatcher.mint_reward_nft(user, ACHIEVEMENT_VOLUME_TRADER);
    };
}

// Example function showing how to get contract statistics
fn get_contract_stats(dispatcher: INFTRewardsDispatcher) -> u256 {
    // Get total number of rewards minted
    dispatcher.get_total_rewards_minted()
}

// Example function showing how to check if a user has a specific achievement
fn has_achievement(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress,
    achievement_type: felt252
) -> bool {
    let achievements = dispatcher.get_user_achievements(user);
    let mut i = 0;
    loop {
        if i >= achievements.len() {
            break false;
        };
        if achievements.at(i) == achievement_type {
            break true;
        };
        i += 1;
    }
}

// Example function showing how to implement a comprehensive reward system
fn comprehensive_reward_system(
    dispatcher: INFTRewardsDispatcher,
    user: ContractAddress,
    trade_data: (u256, u256, u256, u256) // (trade_count, streak_days, profit_percentage, total_volume)
) {
    let (trade_count, streak_days, profit_percentage, total_volume) = trade_data;
    
    // Handle trading milestones
    handle_trading_milestone(dispatcher, user, trade_count);
    
    // Handle streak achievements
    handle_daily_streak(dispatcher, user, streak_days);
    
    // Handle profit achievements
    handle_profit_achievement(dispatcher, user, profit_percentage);
    
    // Handle volume achievements
    handle_volume_achievement(dispatcher, user, total_volume);
} 