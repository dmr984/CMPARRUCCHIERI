// src/firebase/errors.ts

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};

const FIRESTORE_PERMISSION_ERROR_NAME = 'FirestorePermissionError';

export class FirestorePermissionError extends Error {
    public readonly context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const { path, operation } = context;
        const message = `Firestore Permission Denied: Insufficient permissions for ${operation} operation on path: ${path}`;
        super(message);
        this.name = FIRESTORE_PERMISSION_ERROR_NAME;
        this.context = context;

        // This is to ensure the stack trace is captured correctly
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FirestorePermissionError);
        }
    }

    public static isFirestorePermissionError(error: any): error is FirestorePermissionError {
        return error?.name === FIRESTORE_PERMISSION_ERROR_NAME;
    }
}
