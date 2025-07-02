'use server';

import { z } from 'zod';
import { addDsc as addDscToDb, updateDsc as updateDscInDb, deleteDsc as deleteDscFromDb, takeDsc as takeDscFromDb, returnDsc as returnDscFromDb, getDscs } from '@/services/dsc';
import { addUser, updateUser, deleteUser, getUsers } from '@/services/user';
import { addAuditLog, getAuditLogs } from '@/services/auditLog';
import { revalidatePath } from 'next/cache';
import type { DSC, User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, writeBatch, documentId, limit } from 'firebase/firestore';
import Papa from 'papaparse';


const DscSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  serialNumber: z.string().min(1, { message: "Serial number is required." }),
  expiryDate: z.string({required_error: "Expiry date is required."}).min(1, { message: "Expiry date is required." }),
  mainBox: z.coerce.number().min(1, "Main box must be between 1-8").max(8, "Main box must be between 1-8"),
  subBox: z.string().length(1, "Sub box must be a single letter").regex(/^[a-i]$/, "Sub box must be a-i"),
});

const ActorSchema = z.object({
  actorId: z.string().min(1, { message: "Actor ID is missing." }),
  actorName: z.string().min(1, { message: "Actor name is missing." }),
});

type ActionState = {
    errors?: {
        description?: string[];
        serialNumber?: string[];
        expiryDate?: string[];
        mainBox?: string[];
        subBox?: string[];
        actorId?: string[];
        actorName?: string[];
    };
    message?: string;
};

export async function addDscAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = DscSchema.safeParse({
    description: formData.get('description'),
    serialNumber: formData.get('serialNumber'),
    expiryDate: formData.get('expiryDate'),
    mainBox: formData.get('mainBox'),
    subBox: formData.get('subBox'),
  });

  const validatedActor = ActorSchema.safeParse({
    actorId: formData.get('actorId'),
    actorName: formData.get('actorName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add DSC. Please check the fields.',
    };
  }
   if (!validatedActor.success) {
    return {
      errors: validatedActor.error.flatten().fieldErrors,
      message: 'Failed to identify the acting user.',
    };
  }
  
  const { description, serialNumber, expiryDate, mainBox, subBox } = validatedFields.data;
  const { actorId, actorName } = validatedActor.data;

  try {
    await addDscToDb({
      serialNumber,
      description,
      expiryDate,
      location: { mainBox, subBox },
    });
    
    await addAuditLog({
        userId: actorId,
        userName: actorName,
        action: 'ADD_DSC',
        dscSerialNumber: serialNumber,
        dscDescription: description,
    });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      message: `Database Error: ${errorMessage}.`,
    };
  }

  revalidatePath('/');
  return { message: 'DSC added successfully.' };
}

export async function editDscAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const dscId = formData.get('dscId');
  if (typeof dscId !== 'string' || !dscId) {
    return { message: 'DSC ID is missing.' };
  }

  const validatedFields = DscSchema.safeParse({
    description: formData.get('description'),
    serialNumber: formData.get('serialNumber'),
    expiryDate: formData.get('expiryDate'),
    mainBox: formData.get('mainBox'),
    subBox: formData.get('subBox'),
  });

  const validatedActor = ActorSchema.safeParse({
    actorId: formData.get('actorId'),
    actorName: formData.get('actorName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update DSC. Please check the fields.',
    };
  }

  if (!validatedActor.success) {
    return {
      errors: validatedActor.error.flatten().fieldErrors,
      message: 'Failed to identify the acting user.',
    };
  }

  const { description, serialNumber, expiryDate, mainBox, subBox } = validatedFields.data;
  const { actorId, actorName } = validatedActor.data;

  try {
    await updateDscInDb(dscId, {
      serialNumber,
      description,
      expiryDate,
      location: { mainBox, subBox },
    });

    await addAuditLog({
        userId: actorId,
        userName: actorName,
        action: 'UPDATE_DSC',
        dscSerialNumber: serialNumber,
        dscDescription: description,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      message: `Database Error: ${errorMessage}.`,
    };
  }

  revalidatePath('/');
  return { message: 'DSC updated successfully.' };
}

const DeleteDscPayload = z.object({
  dscId: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  serialNumber: z.string(),
  description: z.string(),
});

export async function deleteDscAction(payload: z.infer<typeof DeleteDscPayload>): Promise<{ message: string }> {
    const validatedPayload = DeleteDscPayload.safeParse(payload);
    if (!validatedPayload.success) {
      return { message: 'Invalid payload for delete action.' };
    }
    const { dscId, actorId, actorName, serialNumber, description } = validatedPayload.data;

    try {
        await deleteDscFromDb(dscId);
        await addAuditLog({
          userId: actorId,
          userName: actorName,
          action: 'DELETE_DSC',
          dscSerialNumber: serialNumber,
          dscDescription: description,
        });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { message: `Database Error: ${errorMessage}.` };
    }
    revalidatePath('/');
    return { message: 'DSC deleted successfully.' };
}


// User Management Actions
const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  role: z.enum(['leader', 'employee'], { required_error: "Role is required." }),
});

type UserActionState = {
  errors?: {
    name?: string[];
    role?: string[];
  };
  message?: string;
};

export async function addUserAction(prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add user. Please check the fields.',
    };
  }
  
  try {
      await addUser({
          name: validatedFields.data.name,
          role: validatedFields.data.role,
      });
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { message: `Database Error: ${errorMessage}.` };
  }

  revalidatePath('/');
  return { message: 'User added successfully.' };
}


export async function updateUserAction(prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const userId = formData.get('userId');
  if (typeof userId !== 'string' || !userId) {
      return { message: 'User ID is missing.' };
  }

  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update user. Please check the fields.',
    };
  }

  try {
    await updateUser(userId, validatedFields.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { message: `Database Error: ${errorMessage}.` };
  }

  revalidatePath('/');
  return { message: 'User updated successfully.' };
}


export async function deleteUserAction(userId: string): Promise<{ message: string }> {
    if (!userId) {
        return { message: 'User ID is missing.' };
    }
    try {
        await deleteUser(userId);
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { message: `Database Error: ${errorMessage}.` };
    }
    revalidatePath('/');
    return { message: 'User deleted successfully.' };
}


// Actions for Take/Return DSC
const DscInteractionPayload = z.object({
  dscId: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  serialNumber: z.string(),
  description: z.string(),
});

export async function takeDscAction(payload: z.infer<typeof DscInteractionPayload>): Promise<{ success: boolean; message: string }> {
    const validatedPayload = DscInteractionPayload.safeParse(payload);
    if (!validatedPayload.success) {
      return { success: false, message: 'Invalid payload for take action.' };
    }
    const { dscId, actorId, actorName, serialNumber, description } = validatedPayload.data;
    
    try {
        await takeDscFromDb(dscId, actorId);
        await addAuditLog({
            userId: actorId,
            userName: actorName,
            action: 'TAKE',
            dscSerialNumber: serialNumber,
            dscDescription: description,
        });
        revalidatePath('/');
        return { success: true, message: 'DSC taken successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database Error: ${errorMessage}.` };
    }
}

export async function returnDscAction(payload: z.infer<typeof DscInteractionPayload>): Promise<{ success: boolean; message: string }> {
    const validatedPayload = DscInteractionPayload.safeParse(payload);
    if (!validatedPayload.success) {
      return { success: false, message: 'Invalid payload for return action.' };
    }
    const { dscId, actorId, actorName, serialNumber, description } = validatedPayload.data;
    try {
        await returnDscFromDb(dscId, actorId);
        await addAuditLog({
            userId: actorId,
            userName: actorName,
            action: 'RETURN',
            dscSerialNumber: serialNumber,
            dscDescription: description,
        });
        revalidatePath('/');
        return { success: true, message: 'DSC returned successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database Error: ${errorMessage}.` };
    }
}


// Action to get audit logs
export async function getAuditLogsAction(): Promise<{ logs?: any[]; error?: string; }> {
    try {
        const logs = await getAuditLogs();
        return { logs };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { error: `Database Error: ${errorMessage}.` };
    }
}

// Action to get DSCs sorted by expiry
export async function getDscsSortedByExpiryAction(): Promise<{ dscs?: DSC[]; error?: string; }> {
    try {
        const dscs = await getDscs({ sortByExpiry: true });
        return { dscs };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { error: `Database Error: ${errorMessage}.` };
    }
}

// Action for client-side to fetch all necessary dashboard data at once.
export async function getDashboardDataAction(): Promise<{ success: boolean; data?: { users: User[], dscs: DSC[] }; message?: string; }> {
    try {
        const [users, dscs] = await Promise.all([
            getUsers(),
            getDscs()
        ]);
        return { success: true, data: { users, dscs } };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database Error: ${errorMessage}.` };
    }
}

// Action for client-side to fetch users for selection screen.
export async function getUsersAction(): Promise<{ success: boolean; data?: User[]; message?: string; }> {
    try {
        const users = await getUsers();
        return { success: true, data: users };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database Error: ${errorMessage}.` };
    }
}


// Action to export all data
export async function exportDataAction(): Promise<{ success: boolean; data?: { users: User[], dscs: DSC[] }; message?: string; }> {
    try {
        const [users, dscs] = await Promise.all([
            getUsers(),
            getDscs()
        ]);
        return { success: true, data: { users, dscs } };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database Error: ${errorMessage}.` };
    }
}

// Zod schema for imported JSON data
const ImportedJsonDataSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(['leader', 'employee']),
    hasDsc: z.boolean(),
  })),
  dscs: z.array(z.object({
    id: z.string(),
    serialNumber: z.string(),
    description: z.string(),
    expiryDate: z.any(), // Can be string or have toDate method
    status: z.enum(['storage', 'with-employee']),
    location: z.object({
      mainBox: z.number(),
      subBox: z.string(),
    }),
    currentHolderId: z.string().nullable().optional(),
  })),
});

// Zod schemas for imported CSV data
const CsvUserImportSchema = z.object({
  name: z.string().min(1, { message: 'User name is required.' }),
  role: z.enum(['leader', 'employee'], { errorMap: () => ({ message: 'Role must be leader or employee.' }) }),
});

const CsvDscImportSchema = z.object({
  serialNumber: z.string().min(1, { message: 'DSC serial number is required.' }),
  description: z.string().min(1, { message: 'DSC description is required.' }),
  'expiryDate (YYYY-MM-DD)': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Expiry date must be in YYYY-MM-DD format.' }),
  currentHolderName: z.string().optional().nullable(),
  locationMainBox: z.coerce.number().optional().nullable(),
  locationSubBox: z.string().optional().nullable(),
});

// Helper to delete all documents in a collection
async function deleteCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, limit(50)); // Process in batches of 50
    
    return new Promise((resolve, reject) => {
        deleteQueryBatch(q, resolve).catch(reject);
    });
}

async function deleteQueryBatch(q: any, resolve: (value: unknown) => void) {
    const snapshot = await getDocs(q);

    if (snapshot.size === 0) {
        return resolve(0);
    }
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Recurse on the same query to get the next batch.
    process.nextTick(() => {
        deleteQueryBatch(q, resolve);
    });
}


// Action to import JSON backup, overwriting all existing data
export async function importJsonBackupAction(jsonString: string): Promise<{ success: boolean; message: string; }> {
    try {
        let parsedData;
        try {
            parsedData = JSON.parse(jsonString);
        } catch (error) {
            throw new Error('Invalid JSON file. Could not parse.');
        }

        const validatedDataResult = ImportedJsonDataSchema.safeParse(parsedData);
        if (!validatedDataResult.success) {
            throw new Error(`Invalid data structure in JSON file. ${validatedDataResult.error.message}`);
        }
        
        await processJsonImport(validatedDataResult.data);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Import failed: ${errorMessage}.` };
    }
    
    revalidatePath('/');
    return { success: true, message: 'JSON backup imported successfully. All previous data has been overwritten.' };
}

async function processJsonImport(data: z.infer<typeof ImportedJsonDataSchema>) {
    const { users: importedUsers, dscs: importedDscs } = data;
    
    // This is highly destructive and should be used with caution.
    // In a real app, you might want to handle this differently.
    // For now, this assumes a full restore from a known-good state.
    await Promise.all([
        deleteCollection('dscs'),
        deleteCollection('users'),
        deleteCollection('auditLogs'),
    ]);

    const writeDbBatch = writeBatch(db);

    // Batch write new users and create ID map
    const oldToNewUserIdMap = new Map<string, string>();
    importedUsers.forEach(user => {
        const newUserRef = doc(collection(db, 'users'));
        oldToNewUserIdMap.set(user.id, newUserRef.id);
        const { id, ...userData } = user;
        writeDbBatch.set(newUserRef, userData);
    });

    // Batch write new DSCs
    importedDscs.forEach(dsc => {
        const newDscRef = doc(collection(db, 'dscs'));
        const { id, expiryDate, currentHolderId, ...dscData } = dsc;

        const newDscData: any = {
            ...dscData,
            expiryDate: new Date(expiryDate.seconds ? expiryDate.toDate() : expiryDate),
            currentHolderId: currentHolderId ? oldToNewUserIdMap.get(currentHolderId) || null : null,
        };
        writeDbBatch.set(newDscRef, newDscData);
    });
    
    await writeDbBatch.commit();
}


export async function importUsersFromCsvAction(csvString: string): Promise<{ success: boolean; message: string; }> {
    try {
        const parsedCsv = Papa.parse(csvString, { header: true, skipEmptyLines: true });
        if (parsedCsv.errors.length > 0) throw new Error(`CSV parsing error: ${parsedCsv.errors[0].message}`);

        const validatedUsersResult = z.array(CsvUserImportSchema).safeParse(parsedCsv.data);
        if (!validatedUsersResult.success) throw new Error(`Invalid user data in CSV: ${validatedUsersResult.error.errors[0].message}`);

        const userNames = new Set<string>();
        for (const user of validatedUsersResult.data) {
            if (userNames.has(user.name)) throw new Error(`Duplicate user name found in CSV file: "${user.name}". User names must be unique.`);
            userNames.add(user.name);
        }

        // This action is now too destructive as it doesn't handle Auth users.
        // It's recommended to add users one by one through the UI to create their auth credentials.
        // I'm disabling this to prevent data inconsistency.
        throw new Error("CSV User import is disabled. Please add users through the 'Manage Users' dialog to create their login credentials.");


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `User import failed: ${errorMessage}.` };
    }
}


export async function importDscsFromCsvAction(csvString: string): Promise<{ success: boolean; message: string; }> {
    try {
        const parsedCsv = Papa.parse(csvString, { header: true, skipEmptyLines: true });
        if (parsedCsv.errors.length > 0) throw new Error(`CSV parsing error: ${parsedCsv.errors[0].message}`);

        const validatedDscsResult = z.array(CsvDscImportSchema).safeParse(parsedCsv.data);
        if (!validatedDscsResult.success) throw new Error(`Invalid DSC data in CSV: ${validatedDscsResult.error.errors[0].message}`);
        
        for (const dsc of validatedDscsResult.data) {
            const expiryDate = new Date(dsc['expiryDate (YYYY-MM-DD)']);
            if (isNaN(expiryDate.getTime())) throw new Error(`Invalid date format for DSC S/N ${dsc.serialNumber}`);
        }

        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        const userNameToIdMap = new Map<string, string>();
        allUsersSnapshot.forEach(doc => userNameToIdMap.set(doc.data().name, doc.id));
        
        await deleteCollection('dscs');
        const dscWriteBatch = writeBatch(db);
        const userUpdateBatch = writeBatch(db);
        
        allUsersSnapshot.forEach(userDoc => {
            userUpdateBatch.update(userDoc.ref, { hasDsc: false });
        });

        validatedDscsResult.data.forEach(dsc => {
            const newDscRef = doc(collection(db, 'dscs'));
            let currentHolderId: string | null = null;
            let status: 'storage' | 'with-employee' = 'storage';
            
            if (dsc.currentHolderName) {
                if (userNameToIdMap.has(dsc.currentHolderName)) {
                    currentHolderId = userNameToIdMap.get(dsc.currentHolderName)!;
                    status = 'with-employee';
                    const userRef = doc(db, 'users', currentHolderId);
                    userUpdateBatch.update(userRef, { hasDsc: true });
                } else {
                    console.warn(`User "${dsc.currentHolderName}" for DSC S/N ${dsc.serialNumber} not found. Storing DSC without a holder.`);
                }
            }
            
            const expiryDate = new Date(dsc['expiryDate (YYYY-MM-DD)']);

            const newDscData = {
                serialNumber: dsc.serialNumber,
                description: dsc.description,
                expiryDate: expiryDate,
                status,
                currentHolderId,
                location: { mainBox: dsc.locationMainBox ?? 1, subBox: dsc.locationSubBox ?? 'a' }
            };

            dscWriteBatch.set(newDscRef, newDscData);
        });

        await userUpdateBatch.commit();
        await dscWriteBatch.commit();

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `DSC import failed: ${errorMessage}.` };
    }
    
    revalidatePath('/');
    return { success: true, message: 'DSCs imported successfully. All previous DSCs have been overwritten.' };
}
