// Wallet service for blockchain operations
export interface WalletInfo {
  address: string
  network: string
  email: string
  userId: string
  isConnected: boolean
}

export interface TransactionResult {
  success: boolean
  hash?: string
  error?: string
}

export class WalletService {
  private wallet: any = null

  constructor(wallet?: any) {
    this.wallet = wallet
  }

  setWallet(wallet: any) {
    this.wallet = wallet
    console.log('✅ Wallet set in service:', wallet?.address)
  }

  getWalletInfo(): WalletInfo | null {
    if (!this.wallet) {
      return null
    }

    return {
      address: this.wallet.address,
      network: this.wallet.network,
      email: this.wallet.email,
      userId: this.wallet.user_id,
      isConnected: !!this.wallet.address
    }
  }

  async executeTransaction(contractAddress: string, method: string, params: any[]): Promise<TransactionResult> {
    try {
      if (!this.wallet) {
        throw new Error('No wallet connected')
      }

      console.log('🚀 Executing transaction:', { contractAddress, method, params })
      
      const result = await this.wallet.execute(contractAddress, method, params)
      
      console.log('✅ Transaction successful:', result)
      return { success: true, hash: result.hash || 'mock-hash' }
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      }
    }
  }

  async batchExecute(transactions: Array<{ contractAddress: string; method: string; params: any[] }>): Promise<TransactionResult[]> {
    try {
      if (!this.wallet) {
        throw new Error('No wallet connected')
      }

      console.log('🚀 Executing batch transactions:', transactions.length)
      
      const results = await Promise.all(
        transactions.map(tx => this.executeTransaction(tx.contractAddress, tx.method, tx.params))
      )
      
      console.log('✅ Batch execution completed:', results)
      return results
    } catch (error) {
      console.error('❌ Batch execution failed:', error)
      return transactions.map(() => ({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Batch execution failed' 
      }))
    }
  }

  async swapTokens(tokenIn: string, tokenOut: string, amount: string): Promise<TransactionResult> {
    try {
      if (!this.wallet) {
        throw new Error('No wallet connected')
      }

      console.log('🔄 Swapping tokens:', { tokenIn, tokenOut, amount })
      
      // Mock swap transaction
      const result = await this.executeTransaction(
        '0x1234567890abcdef1234567890abcdef12345678', // DEX contract
        'swap',
        [tokenIn, tokenOut, amount]
      )
      
      return result
    } catch (error) {
      console.error('❌ Token swap failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token swap failed' 
      }
    }
  }

  isConnected(): boolean {
    return !!this.wallet && !!this.wallet.address
  }

  getAddress(): string | null {
    return this.wallet?.address || null
  }

  getNetwork(): string | null {
    return this.wallet?.network || null
  }
} 