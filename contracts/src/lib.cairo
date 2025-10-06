use starknet::ContractAddress;

/// Interface for the NFT Rewards System
#[starknet::interface]
pub trait INFTRewards<TContractState> {
    // ERC721 Standard Functions
    fn balance_of(account: ContractAddress) -> u256;
    fn owner_of(token_id: u256) -> ContractAddress;
    fn safe_transfer_from(
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
        data: Span<felt252>
    );
    fn transfer_from(from: ContractAddress, to: ContractAddress, token_id: u256);
    fn approve(to: ContractAddress, token_id: u256);
    fn set_approval_for_all(operator: ContractAddress, approved: bool);
    fn get_approved(token_id: u256) -> ContractAddress;
    fn is_approved_for_all(owner: ContractAddress, operator: ContractAddress) -> bool;
    fn name() -> ByteArray;
    fn symbol() -> ByteArray;
    fn token_uri(token_id: u256) -> ByteArray;

    // Reward System Functions
    fn mint_reward_nft(ref self: TContractState, recipient: ContractAddress, achievement_type: felt252);
    fn get_user_achievements(self: @TContractState, user: ContractAddress) -> Array<felt252>;
    fn get_achievement_count(self: @TContractState, user: ContractAddress) -> u256;
    fn get_total_rewards_minted(self: @TContractState) -> u256;
}

/// NFT Rewards System Contract
/// This contract implements ERC721 NFTs for rewarding user achievements in your app
#[starknet::contract]
pub mod NFTRewards {
    use openzeppelin_access::accesscontrol::AccessControlComponent;
    use openzeppelin_access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::*;

    // Role constants
    const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
    const REWARD_MANAGER_ROLE: felt252 = selector!("REWARD_MANAGER_ROLE");

    // Components
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);

    // ERC721 Mixin
    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    // SRC5 Mixin
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    // AccessControl Mixin
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        
        // Reward system specific storage
        total_rewards_minted: u256,
        user_achievements: Map<ContractAddress, Array<felt252>>,
        achievement_metadata: Map<felt252, ByteArray>, // achievement_type -> metadata
        next_token_id: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        RewardMinted: RewardMinted,
        AchievementAdded: AchievementAdded,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardMinted {
        recipient: ContractAddress,
        token_id: u256,
        achievement_type: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct AchievementAdded {
        user: ContractAddress,
        achievement_type: felt252,
        metadata: ByteArray,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        base_uri: ByteArray
    ) {
        // Initialize ERC721
        let name = "AsTrade Rewards";
        let symbol = "ATR";
        self.erc721.initializer(name, symbol, base_uri);

        // Initialize SRC5
        self.src5.initializer();

        // Initialize AccessControl
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
        self.accesscontrol._grant_role(MINTER_ROLE, admin);
        self.accesscontrol._grant_role(REWARD_MANAGER_ROLE, admin);

        // Initialize reward system
        self.total_rewards_minted.write(0);
        self.next_token_id.write(1);
    }

    #[abi(embed_v0)]
    impl NFTRewardsImpl of super::INFTRewards<ContractState> {
        // ERC721 Standard Functions (delegated to component)
        fn balance_of(account: ContractAddress) -> u256 {
            self.erc721.balance_of(account)
        }

        fn owner_of(token_id: u256) -> ContractAddress {
            self.erc721.owner_of(token_id)
        }

        fn safe_transfer_from(
            from: ContractAddress,
            to: ContractAddress,
            token_id: u256,
            data: Span<felt252>
        ) {
            self.erc721.safe_transfer_from(from, to, token_id, data);
        }

        fn transfer_from(from: ContractAddress, to: ContractAddress, token_id: u256) {
            self.erc721.transfer_from(from, to, token_id);
        }

        fn approve(to: ContractAddress, token_id: u256) {
            self.erc721.approve(to, token_id);
        }

        fn set_approval_for_all(operator: ContractAddress, approved: bool) {
            self.erc721.set_approval_for_all(operator, approved);
        }

        fn get_approved(token_id: u256) -> ContractAddress {
            self.erc721.get_approved(token_id)
        }

        fn is_approved_for_all(owner: ContractAddress, operator: ContractAddress) -> bool {
            self.erc721.is_approved_for_all(owner, operator)
        }

        fn name() -> ByteArray {
            self.erc721.name()
        }

        fn symbol() -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(token_id: u256) -> ByteArray {
            self.erc721.token_uri(token_id)
        }

        // Reward System Functions
        fn mint_reward_nft(ref self: ContractState, recipient: ContractAddress, achievement_type: felt252) {
            // Only authorized minters can mint reward NFTs
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            
            let token_id = self.next_token_id.read();
            
            // Mint the NFT
            self.erc721.mint(recipient, token_id);
            
            // Update reward system state
            self.next_token_id.write(token_id + 1);
            self.total_rewards_minted.write(self.total_rewards_minted.read() + 1);
            
            // Add achievement to user's list
            let mut user_achievements = self.user_achievements.entry(recipient).read();
            user_achievements.append(achievement_type);
            self.user_achievements.entry(recipient).write(user_achievements);
            
            // Emit event
            self.emit(Event::RewardMinted(RewardMinted {
                recipient,
                token_id,
                achievement_type,
            }));
        }

        fn get_user_achievements(self: @ContractState, user: ContractAddress) -> Array<felt252> {
            self.user_achievements.entry(user).read()
        }

        fn get_achievement_count(self: @ContractState, user: ContractAddress) -> u256 {
            let achievements = self.user_achievements.entry(user).read();
            achievements.len().into()
        }

        fn get_total_rewards_minted(self: @ContractState) -> u256 {
            self.total_rewards_minted.read()
        }
    }

    // Additional admin functions
    #[external(v0)]
    fn add_achievement_metadata(
        ref self: ContractState,
        achievement_type: felt252,
        metadata: ByteArray
    ) {
        self.accesscontrol.assert_only_role(REWARD_MANAGER_ROLE);
        self.achievement_metadata.entry(achievement_type).write(metadata);
        
        self.emit(Event::AchievementAdded(AchievementAdded {
            user: get_caller_address(),
            achievement_type,
            metadata,
        }));
    }

    #[external(v0)]
    fn get_achievement_metadata(self: @ContractState, achievement_type: felt252) -> ByteArray {
        self.achievement_metadata.entry(achievement_type).read()
    }

    #[external(v0)]
    fn batch_mint_rewards(
        ref self: ContractState,
        recipients: Array<ContractAddress>,
        achievement_types: Array<felt252>
    ) {
        self.accesscontrol.assert_only_role(MINTER_ROLE);
        
        let recipients_len = recipients.len();
        let types_len = achievement_types.len();
        assert(recipients_len == types_len, 'Arrays must have same length');
        
        let mut i = 0;
        loop {
            if i >= recipients_len {
                break;
            };
            
            let recipient = recipients.at(i);
            let achievement_type = achievement_types.at(i);
            
            // Mint reward for this recipient
            self.mint_reward_nft(recipient, achievement_type);
            
            i += 1;
        };
    }
}
