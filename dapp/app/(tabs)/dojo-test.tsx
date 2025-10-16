import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useDojo } from '@/lib/hooks/useDojo';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';
import { secureStorage } from '@/lib/secure-storage';

export default function DojoTestScreen() {
  const {
    isConnected,
    isLoading,
    error,
    connectionState,
    executeSystemCall,
    queryEntities,
    findContract,
    reconnect: reconnectDojo,
    config,
    manifest
  } = useDojo();
  
  const { wallet, isAuthenticated, logout, reconnect } = useWallet();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSpawn = async () => {
    try {
      setLoading(true);
      setMessage('⏳ Ejecutando spawn...');
      
      // Primero intentamos encontrar el contrato en el manifest
      let contractAddress = '';
      const actionsContract = findContract('di-actions');
      
      if (actionsContract) {
        contractAddress = actionsContract.address;
        console.log('✅ Contrato encontrado en manifest:', contractAddress);
      } else {
        // Si no está en el manifest, usamos la dirección conocida
        contractAddress = '0x00c15f8f861c8ab9e466c69d78ec701c9ad5952404a8d000a06c6217e67f5591';
        console.log('⚠️ Usando dirección hardcoded del contrato');
      }
      
      const result = await executeSystemCall({
        contractAddress,
        entrypoint: 'spawn',
        calldata: [],
      });
      
      setMessage(
        `✅ ¡Spawn exitoso!\n\n` +
        `TX Hash:\n${result.transaction_hash.slice(0, 20)}...${result.transaction_hash.slice(-10)}\n\n` +
        `Ahora puedes hacer Query para ver tus datos.`
      );
      
      console.log('✅ Spawn completado:', result);
    } catch (err: any) {
      console.error('❌ Error en spawn:', err);
      setMessage(`❌ Error en spawn:\n${err.message || 'Error desconocido'}`);
      Alert.alert('Error', err.message || 'No se pudo ejecutar el spawn');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (direction: 'up' | 'down' | 'left' | 'right') => {
    try {
      setLoading(true);
      setMessage(`⏳ Moviendo ${direction}...`);
      
      let contractAddress = '';
      const actionsContract = findContract('di-actions');
      
      if (actionsContract) {
        contractAddress = actionsContract.address;
      } else {
        contractAddress = '0x00c15f8f861c8ab9e466c69d78ec701c9ad5952404a8d000a06c6217e67f5591';
      }

      // Mapear dirección a enum Cairo (0=Left, 1=Right, 2=Up, 3=Down)
      const directionMap = {
        'left': '0',
        'right': '1',
        'up': '2',
        'down': '3',
      };
      
      const result = await executeSystemCall({
        contractAddress,
        entrypoint: 'move',
        calldata: [directionMap[direction]],
      });
      
      setMessage(
        `✅ ¡Movimiento exitoso!\n\n` +
        `Dirección: ${direction.toUpperCase()}\n` +
        `TX Hash:\n${result.transaction_hash.slice(0, 20)}...${result.transaction_hash.slice(-10)}\n\n` +
        `Haz Query para ver tu nueva posición.`
      );
      
      console.log('✅ Move completado:', result);
    } catch (err: any) {
      console.error('❌ Error en move:', err);
      setMessage(`❌ Error en move:\n${err.message || 'Error desconocido'}`);
      Alert.alert('Error', err.message || 'No se pudo ejecutar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    try {
      setLoading(true);
      
      setMessage('⏳ Consultando entidades...');
      
      // En modo web, usamos una dirección mock
      const mockAddress = wallet?.address || '0xa9d5a8aa7c34b94cd552c66429ac17bc9ba4cad4';
      
      const entities = await queryEntities({
        keys: [mockAddress],
        models: ['Position', 'Moves'],
      });
      
      console.log('📊 Entidades encontradas:', JSON.stringify(entities, null, 2));
      
      if (entities.length > 0) {
        const entity = entities[0];
        const position = entity.models?.di?.Position;
        const moves = entity.models?.di?.Moves;
        
        setMessage(
          `✅ Datos onchain encontrados!\n\n` +
          `📍 Position:\n` +
          `   X: ${position?.x ?? '?'}\n` +
          `   Y: ${position?.y ?? '?'}\n\n` +
          `🎮 Moves:\n` +
          `   Remaining: ${moves?.remaining ?? '?'}\n\n` +
          `Player: ${entity.entityId.slice(0, 20)}...`
        );
      } else {
        setMessage(
          `ℹ️ No se encontraron entidades.\n\n` +
          `Esto es normal si aún no has hecho spawn.\n\n` +
          `👉 Presiona "Spawn Player" para crear tu jugador onchain.`
        );
      }
    } catch (err: any) {
      console.error('❌ Error en query:', err);
      setMessage(`❌ Error en query:\n${err.message || 'Error desconocido'}`);
      Alert.alert('Error', err.message || 'No se pudo consultar las entidades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎮 Dojo Test</Text>
      <Text style={styles.subtitle}>AsTrade x Dojo Integration</Text>
      
      {/* Estado de Conexión */}
      <View style={[
        styles.statusCard,
        isConnected ? styles.statusConnected : styles.statusDisconnected
      ]}>
        <Text style={styles.statusTitle}>🔌 Estado de Conexión</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Estado:</Text>
          <Text style={styles.statusValue}>{connectionState}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Cargando:</Text>
          <Text style={styles.statusValue}>{isLoading ? '⏳ Sí' : '✅ No'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Conectado:</Text>
          <Text style={styles.statusValue}>{isConnected ? '✅ Sí' : '❌ No'}</Text>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
                    <Button title="🔄 Reintentar" onPress={reconnectDojo} color="#e74c3c" />
          </View>
        )}
      </View>

      {/* Info de Wallet */}
      {wallet?.address && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>👛 Wallet</Text>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.address}>
            {wallet.address.slice(0, 15)}...{wallet.address.slice(-10)}
          </Text>
          <Text style={styles.infoText}>
            {isAuthenticated ? '✅ Autenticada' : '⚠️ No autenticada'}
          </Text>
        </View>
      )}

              {/* Debug Info */}
              <View style={styles.debugCard}>
                <Text style={styles.cardTitle}>🔧 Debug Info</Text>
                <Text style={styles.label}>World:</Text>
                <Text style={styles.debugText}>{config.worldAddress.slice(0, 20)}...</Text>
                <Text style={styles.label}>RPC:</Text>
                <Text style={styles.debugText}>{config.rpcUrl}</Text>
                <Text style={styles.label}>Torii:</Text>
                <Text style={styles.debugText}>{config.toriiUrl}</Text>
                <Text style={styles.label}>Namespace:</Text>
                <Text style={styles.debugText}>{config.namespace}</Text>
                <Text style={styles.label}>Manifest:</Text>
                <Text style={styles.debugText}>{manifest ? '✅ Loaded' : '❌ Missing'}</Text>
                <Text style={styles.label}>Wallet Auth:</Text>
                <Text style={styles.debugText}>{isAuthenticated ? '✅ Connected' : '❌ Disconnected'}</Text>
              </View>

              {/* Verificación de Wallet */}
              <View style={styles.walletCheckCard}>
                <Text style={styles.cardTitle}>🔍 Verificación de Wallet</Text>
                
                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      console.log('=== INICIANDO VERIFICACIÓN COMPLETA DE WALLET ===')
                      
                      // 0. Test directo de secureStorage
                      console.log('🧪 Testing secureStorage directly...')
                      await secureStorage.setItemAsync('test_key', 'test_value')
                      const testValue = await secureStorage.getItemAsync('test_key')
                      console.log('🧪 secureStorage test result:', testValue)
                      
                      // 1. Verificar storage
                      const storedData = await secureStorage.getItemAsync('cavos_auth_data')
                      console.log('📦 Raw stored data:', storedData)
                      
                      if (storedData) {
                        const parsed = JSON.parse(storedData)
                        console.log('📱 Parsed auth data:', parsed)
                        
                        // 2. Verificar edad del token
                        const age = Date.now() - parsed.timestamp
                        console.log('⏰ Token age:', {
                          ageMs: age,
                          ageSeconds: Math.floor(age / 1000),
                          ageMinutes: Math.floor(age / 60000),
                          expiresIn: parsed.expiresIn,
                          isExpired: age > (parsed.expiresIn * 1000)
                        })
                      }
                      
                      // 3. Verificar estado del wallet
                      if (wallet) {
                        console.log('👛 Wallet instance:', wallet.getWalletInfo())
                        const isAuth = await wallet.isAuthenticated()
                        console.log('🔐 Wallet isAuthenticated():', isAuth)
                      } else {
                        console.log('❌ No wallet instance')
                      }
                      
                      // 4. Verificar contextos
                      console.log('📊 Context states:', {
                        isAuthenticated,
                        hasWallet: !!wallet,
                        walletAddress: wallet?.address,
                        dojoConnected: isConnected
                      })
                      
                      Alert.alert('Check Complete', 'Revisa la consola para ver los detalles')
                    } catch (err) {
                      console.error('Error checking wallet:', err)
                      Alert.alert('Error', String(err))
                    }
                  }}
                  style={styles.checkButton}
                >
                  <Text style={styles.checkButtonText}>🔍 Verificar Estado Completo</Text>
                </TouchableOpacity>
                
                <View style={styles.statusGrid}>
                  <Text>WalletContext Auth: {isAuthenticated ? '✅' : '❌'}</Text>
                  <Text>Wallet Instance: {wallet ? '✅' : '❌'}</Text>
                  <Text>Wallet Address: {wallet?.address ? '✅' : '❌'}</Text>
                </View>

                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      console.log('🧪 Simulating mock login...')
                      
                      // Simular datos de login como los que guardaría el mock
                      const mockAuthData = {
                        wallet_address: '0x' + Math.random().toString(16).slice(2, 42),
                        network: 'starknet-sepolia',
                        email: 'test@example.com',
                        user_id: 'test_user_' + Math.random().toString(16).slice(2, 8),
                        org_id: 'test_org_' + Math.random().toString(16).slice(2, 8),
                        timestamp: Date.now(),
                        accessToken: 'mock_access_token_' + Math.random().toString(16).slice(2, 16),
                        refreshToken: 'mock_refresh_token_' + Math.random().toString(16).slice(2, 16),
                        expiresIn: 3600,
                      }
                      
                      console.log('💾 Saving mock auth data:', mockAuthData)
                      await secureStorage.setItemAsync('cavos_auth_data', JSON.stringify(mockAuthData))
                      
                      // Verificar que se guardó
                      const savedData = await secureStorage.getItemAsync('cavos_auth_data')
                      console.log('✅ Verification - saved data:', savedData ? 'SUCCESS' : 'FAILED')
                      
                      Alert.alert('Mock Login Complete', 'Mock auth data saved. Now try "Verificar Estado Completo" again.')
                    } catch (err) {
                      console.error('Error in mock login:', err)
                      Alert.alert('Error', String(err))
                    }
                  }}
                  style={[styles.checkButton, { backgroundColor: '#28a745' }]}
                >
                  <Text style={[styles.checkButtonText, { color: '#fff' }]}>🧪 Simular Login Mock</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      console.log('🔄 Forcing wallet reconnection...')
                      await reconnect()
                      Alert.alert('Reconnect Complete', 'Check the console for reconnection logs.')
                    } catch (err) {
                      console.error('Reconnection failed:', err)
                      Alert.alert('Error', String(err))
                    }
                  }}
                  style={[styles.checkButton, { backgroundColor: '#17a2b8' }]}
                >
                  <Text style={[styles.checkButtonText, { color: '#fff' }]}>🔄 Forzar Reconexión</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      await secureStorage.deleteItemAsync('cavos_auth_data')
                      await logout() // del useWallet
                      Alert.alert('Reset Complete', 'Wallet data cleared. Please login again.')
                    } catch (err) {
                      Alert.alert('Error', String(err))
                    }
                  }}
                  style={[styles.checkButton, { backgroundColor: '#dc3545' }]}
                >
                  <Text style={[styles.checkButtonText, { color: '#fff' }]}>🗑️ Reset Wallet Data</Text>
                </TouchableOpacity>
              </View>

      {/* Controles */}
      <View style={styles.controlsCard}>
        <Text style={styles.cardTitle}>🎯 Acciones</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Procesando...</Text>
          </View>
        ) : (
          <>
            <View style={styles.buttonContainer}>
              <Button 
                title="🎯 Spawn Player" 
                onPress={handleSpawn}
                disabled={!isConnected || loading}
                color="#2ecc71"
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="🔍 Query Entities" 
                onPress={handleQuery}
                disabled={!isConnected || loading}
                color="#3498db"
              />
            </View>

            <Text style={styles.sectionTitle}>Mover Jugador</Text>
            <View style={styles.moveControls}>
              <View style={styles.moveRow}>
                <Button 
                  title="⬆️ Up" 
                  onPress={() => handleMove('up')}
                  disabled={!isConnected || loading}
                  color="#9b59b6"
                />
              </View>
              <View style={styles.moveRow}>
                <View style={styles.moveButton}>
                  <Button 
                    title="⬅️ Left" 
                    onPress={() => handleMove('left')}
                    disabled={!isConnected || loading}
                    color="#9b59b6"
                  />
                </View>
                <View style={styles.moveButton}>
                  <Button 
                    title="➡️ Right" 
                    onPress={() => handleMove('right')}
                    disabled={!isConnected || loading}
                    color="#9b59b6"
                  />
                </View>
              </View>
              <View style={styles.moveRow}>
                <Button 
                  title="⬇️ Down" 
                  onPress={() => handleMove('down')}
                  disabled={!isConnected || loading}
                  color="#9b59b6"
                />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Mensaje de resultado */}
      {message ? (
        <View style={styles.messageCard}>
          <Text style={styles.message}>{message}</Text>
        </View>
      ) : null}

      {/* Instrucciones */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>ℹ️ Instrucciones</Text>
        <Text style={styles.instructionText}>
          1️⃣ Asegúrate de estar logueado con Cavos{'\n'}
          2️⃣ Verifica que Dojo esté conectado (verde){'\n'}
          3️⃣ Presiona "Spawn Player" para crear tu jugador{'\n'}
          4️⃣ Usa los botones de movimiento{'\n'}
          5️⃣ Presiona "Query Entities" para ver tus datos onchain
        </Text>
      </View>

      {/* Info técnica */}
      <View style={styles.technicalCard}>
        <Text style={styles.cardTitle}>🔧 Info Técnica</Text>
        <Text style={styles.technicalText}>
          World: 0x04fd367663e253d042fef50014873adba41eb40bfd52a3e686c1c37fe6e3dac0{'\n\n'}
          Actions: 0x00c15f8f861c8ab9e466c69d78ec701c9ad5952404a8d000a06c6217e67f5591{'\n\n'}
          RPC: http://localhost:5050{'\n'}
          Torii: http://localhost:8080
        </Text>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
  },
  statusConnected: {
    borderColor: '#2ecc71',
  },
  statusDisconnected: {
    borderColor: '#e74c3c',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  debugCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
    marginBottom: 8,
  },
  controlsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f8c8d',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#2c3e50',
  },
  moveControls: {
    alignItems: 'center',
  },
  moveRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 8,
  },
  moveButton: {
    width: 120,
    marginHorizontal: 4,
  },
  messageCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1565c0',
    fontFamily: 'monospace',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
  },
  technicalCard: {
    backgroundColor: '#263238',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  technicalText: {
    fontSize: 10,
    lineHeight: 18,
    color: '#90caf9',
    fontFamily: 'monospace',
  },
  walletCheckCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  checkButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusGrid: {
    marginTop: 10,
    gap: 5,
  },
});

