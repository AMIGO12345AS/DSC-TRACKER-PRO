'use server';

import { z } from 'zod';
import { addDsc as addDscToDb, updateDsc as updateDscInDb, deleteDsc as deleteDscFromDb, takeDsc as takeDscFromDb, returnDsc as returnDscFromDb, getDscs } from '@/services/dsc';
import { addUser, updateUser, deleteUser, getUsers } from '@/services/user';
import { addAuditLog, getAuditLogs } from '@/services/auditLog';
import { revalidatePath } from 'next/cache';
import type { DSC, User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, runTransaction, Timestamp, writeBatch } from 'firebase/firestore';


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
    await addUser(validatedFields.data);
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

// Zod schema for imported data validation
const ImportedDataSchema = z.object({
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
    expiryDate: z.string(), // ISO string
    status: z.enum(['storage', 'with-employee']),
    location: z.object({
      mainBox: z.number(),
      subBox: z.string(),
    }),
    currentHolderId: z.string().nullable().optional(),
  })),
});


// Helper to delete all documents in a collection in batches
async function deleteCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return;
    }

    const batchSize = 500;
    const batches = [];

    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        snapshot.docs.slice(i, i + batchSize).forEach(doc => batch.delete(doc.ref));
        batches.push(batch.commit());
    }

    await Promise.all(batches);
}

// Action to import data, overwriting existing data
export async function importDataAction(jsonString: string): Promise<{ success: boolean; message: string; }> {
    let parsedData;
    try {
        parsedData = JSON.parse(jsonString);
    } catch (error) {
        return { success: false, message: 'Invalid JSON file. Could not parse.' };
    }

    const validatedData = ImportedDataSchema.safeParse(parsedData);
    if (!validatedData.success) {
        console.error(validatedData.error.flatten().fieldErrors);
        return { success: false, message: `Invalid data structure in JSON file. ${validatedData.error.message}` };
    }
    
    const { users: importedUsers, dscs: importedDscs } = validatedData.data;

    try {
        // 1. Delete all existing data
        await deleteCollection('dscs');
        await deleteCollection('users');
        await deleteCollection('auditLogs');

        // 2. Batch write new users and create ID map
        const oldToNewUserIdMap = new Map<string, string>();
        const userBatch = writeBatch(db);
        importedUsers.forEach(user => {
            const newUserRef = doc(collection(db, 'users'));
            oldToNewUserIdMap.set(user.id, newUserRef.id);
            const { id, ...userData } = user;
            userBatch.set(newUserRef, userData);
        });
        await userBatch.commit();

        // 3. Batch write new DSCs
        const dscBatch = writeBatch(db);
        importedDscs.forEach(dsc => {
            const newDscRef = doc(collection(db, 'dscs'));
            const { id, expiryDate, currentHolderId, ...dscData } = dsc;

            const newDscData: any = {
                ...dscData,
                expiryDate: Timestamp.fromDate(new Date(expiryDate)),
                currentHolderId: currentHolderId ? oldToNewUserIdMap.get(currentHolderId) || null : null,
            };
            dscBatch.set(newDscRef, newDscData);
        });
        await dscBatch.commit();

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Database write failed: ${errorMessage}.` };
    }
    
    revalidatePath('/');
    return { success: true, message: 'Data imported successfully.' };
}
