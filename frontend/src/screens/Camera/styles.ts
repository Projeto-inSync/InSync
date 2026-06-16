import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        gap: 20,
    },
    permissionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    topControls: {
        padding: 20,
        alignItems: 'flex-end',
    },
    visorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visorText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        marginTop: 20,
        fontWeight: '600',
    },
    bottomControls: {
        height: 120,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20,
    },
    shutterButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
    },
});