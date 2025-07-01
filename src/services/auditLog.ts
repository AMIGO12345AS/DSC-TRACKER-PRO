'use server';
import { db } from '@/lib/firebase';
import type { AuditLog } from '@/types';
import { collection, getDocs, addDoc, Timestamp, query, orderBy } from 'firebase/firestore';

export async function getAuditLogs(): Promise<AuditLog[]> {
    try {
        const logsCol = collection(db, 'auditLogs');
        const q = query(logsCol, orderBy('timestamp', 'desc'));
        const logsSnapshot = await getDocs(q);
        const logsList = logsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
            } as AuditLog;
        });
        return logsList;
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        throw error;
    }
}

type AddAuditLogData = Omit<AuditLog, 'id' | 'timestamp'>;

export async function addAuditLog(logData: AddAuditLogData) {
    try {
        const logsCol = collection(db, 'auditLogs');
        const newLog = {
            ...logData,
            timestamp: Timestamp.now(),
        };
        await addDoc(logsCol, newLog);
    } catch (error) {
        console.error("Error adding audit log:", error);
        // Don't re-throw, as failing to log shouldn't block the primary action
    }
}
