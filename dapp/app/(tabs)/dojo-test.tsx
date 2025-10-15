import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useDojo } from '@/lib/hooks/useDojo';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export default function DojoTestScreen() {
  const { 
    isConnected, 
    isLoading, 
    error, 
    connectionState,
    executeSystemCall,
    queryEntities,
    findContract,
    reconnect,
    config,
    manifest
  } = useDojo();
  
  const { wallet, isAuthenticated } = useWallet();
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
      
      if (!wallet?.address) {
        setMessage('⚠️ Conecta tu wallet primero');
        Alert.alert('Atención', 'Necesitas conectar tu wallet');
        return;
      }

      setMessage('⏳ Consultando entidades...');
      
      const entities = await queryEntities({
        keys: [wallet.address],
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
            <Button title="🔄 Reintentar" onPress={reconnect} color="#e74c3c" />
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
                disabled={!isConnected || !isAuthenticated || loading}
                color="#2ecc71"
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="🔍 Query Entities" 
                onPress={handleQuery}
                disabled={!isConnected || !wallet?.address || loading}
                color="#3498db"
              />
            </View>

            <Text style={styles.sectionTitle}>Mover Jugador</Text>
            <View style={styles.moveControls}>
              <View style={styles.moveRow}>
                <Button 
                  title="⬆️ Up" 
                  onPress={() => handleMove('up')}
                  disabled={!isConnected || !isAuthenticated || loading}
                  color="#9b59b6"
                />
              </View>
              <View style={styles.moveRow}>
                <View style={styles.moveButton}>
                  <Button 
                    title="⬅️ Left" 
                    onPress={() => handleMove('left')}
                    disabled={!isConnected || !isAuthenticated || loading}
                    color="#9b59b6"
                  />
                </View>
                <View style={styles.moveButton}>
                  <Button 
                    title="➡️ Right" 
                    onPress={() => handleMove('right')}
                    disabled={!isConnected || !isAuthenticated || loading}
                    color="#9b59b6"
                  />
                </View>
              </View>
              <View style={styles.moveRow}>
                <Button 
                  title="⬇️ Down" 
                  onPress={() => handleMove('down')}
                  disabled={!isConnected || !isAuthenticated || loading}
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
});

