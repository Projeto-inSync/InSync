import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const isWeb = Platform.OS === "web";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: colors.primaryGreen,
        paddingTop: isWeb ? 20 : 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: isWeb ? 22 : 20,
        fontWeight: "bold",
    },
    logoutButton: {
        position: "absolute",
        right: 20,
        top: isWeb ? 16 : 46,
        ...(isWeb ? { cursor: "pointer" } as any : {}),
    },
    content: {
        padding: isWeb ? 32 : 16,
        maxWidth: isWeb ? 960 : undefined,
        width: "100%",
        alignSelf: isWeb ? "center" : undefined,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 16,
        marginTop: 32,
    },
    statsContainerVertical: {
        flexDirection: isWeb ? "row" : "column",
        gap: 16,
        marginBottom: 8,
    },
    statCardVertical: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: isWeb ? 24 : 16,
        alignItems: "center",
        flex: isWeb ? 1 : undefined,
        ...(isWeb
            ? { boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" } as any
            : {
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                marginBottom: 12,
            }),
    },
    statValue: {
        fontSize: isWeb ? 32 : 28,
        fontWeight: "bold",
        color: colors.textDark,
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 13,
        color: "#757575",
        textAlign: "center",
    },
    chartWrapper: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        ...(isWeb
            ? { boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" } as any
            : {
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            }),
    },
    chart: {
        borderRadius: 12,
    },
    userListContainer: {
        gap: 8,
    },
    responsavelGroup: {
        backgroundColor: "white",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 8,
        ...(isWeb
            ? { boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" } as any
            : {
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            }),
    },
    responsavelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        backgroundColor: "#E8F5E9",
    },
    filhosContainer: {
        paddingLeft: 8,
    },
    filhoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingRight: 14,
        paddingLeft: 8,
    },
    userRowInactive: {
        opacity: 0.6,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    userIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textDark,
    },
    filhoName: {
        fontSize: 14,
        fontWeight: "500",
    },
    userDetail: {
        fontSize: 12,
        color: "#757575",
        marginTop: 1,
    },
    textInactive: {
        color: "#9E9E9E",
    },
    switchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    treeConnector: {
        width: 24,
        alignItems: "center",
        alignSelf: "stretch",
    },
    treeLine: {
        width: 2,
        flex: 1,
        backgroundColor: "#C8E6C9",
    },
    treeLineLast: {
        flex: 0.5,
        alignSelf: "flex-start",
    },
    treeBranch: {
        width: 12,
        height: 2,
        backgroundColor: "#C8E6C9",
        position: "absolute",
        left: 11,
        top: "50%",
    },
    emptyText: {
        textAlign: "center",
        color: "#9E9E9E",
        padding: 20,
    },
    semFilhosText: {
        fontSize: 13,
        color: "#9E9E9E",
        fontStyle: "italic",
    },
});