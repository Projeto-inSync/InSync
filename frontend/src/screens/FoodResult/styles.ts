import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        width: "100%",
        borderRadius: 25,
        padding: 25,
        elevation: 8,
    },
    header: { alignItems: "center", marginBottom: 15 },
    title: { fontSize: 22, fontWeight: "bold", color: "#333", marginTop: 10 },
    aiTextContainer: {
        backgroundColor: "#F5F5F5",
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.primaryGreen,
    },
    aiTextContainerWarning: {
        backgroundColor: "#FFF3F3",
        borderLeftColor: "#E53935",
    },
    warningRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },
    warningText: { fontSize: 12, color: "#E53935", fontWeight: "600" },
    aiText: { fontSize: 14, color: "#555", fontStyle: "italic", lineHeight: 20 },
    subtitle: {
        fontSize: 16,
        color: "#777",
        textAlign: "center",
        marginBottom: 20,
        fontWeight: "600",
    },
    barContainer: { marginBottom: 15 },
    barHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 5,
    },
    barLabel: { fontSize: 14, fontWeight: "bold", color: "#444" },
    barDelta: { fontSize: 14, fontWeight: "bold", color: colors.primaryGreen },
    barDeltaWarning: { color: "#E53935" },
    barDeltaNeutral: { color: "#BDBDBD" },
    barBackground: {
        width: "100%",
        height: 12,
        backgroundColor: "#EEEEEE",
        borderRadius: 6,
        overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 6 },
    btnPrimary: { marginTop: 20 },
    btnCancel: { marginTop: 10 },
});