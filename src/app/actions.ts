'use server';

import { z } from 'zod';
import { addDsc as addDscToDb } from '@/services/dsc';
import { revalidatePath } from 'next/cache';

const AddDscSchema = z.object({
  issuedTo: z.string().min(1, { message: "Employee name is required." }),
  serialNumber: z.string().min(1, { message: "Serial number is required." }),
  expiryDate: z.string({required_error: "Expiry date is required."}).min(1, { message: "Expiry date is required." }),
  mainBox: z.coerce.number().min(1, "Main box must be between 1-8").max(8, "Main box must be between 1-8"),
  subBox: z.string().length(1, "Sub box must be a single letter").regex(/^[a-i]$/, "Sub box must be a-i"),
});

type ActionState = {
    errors?: {
        issuedTo?: string[];
        serialNumber?: string[];
        expiryDate?: string[];
        mainBox?: string[];
        subBox?: string[];
    };
    message?: string;
};

export async function addDscAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = AddDscSchema.safeParse({
    issuedTo: formData.get('employeeName'),
    serialNumber: formData.get('serialNumber'),
    expiryDate: formData.get('expiryDate'),
    mainBox: formData.get('mainBox'),
    subBox: formData.get('subBox'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add DSC. Please check the fields.',
    };
  }
  
  const { issuedTo, serialNumber, expiryDate, mainBox, subBox } = validatedFields.data;

  try {
    await addDscToDb({
      serialNumber,
      issuedTo,
      expiryDate,
      location: { mainBox, subBox },
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Add DSC.',
    };
  }

  revalidatePath('/');
  return { message: 'DSC added successfully.' };
}
