import { z } from 'zod';
import { MemberStatus, MembershipType, MaritalStatus, TransactionType } from '../../types';

// Phone number validation regex: +country_code, dashes, parentheses, spaces allowed
const phoneRegex = /^\+?[\d\s\-()]+$/;

// Email validation - using zod's built-in email validator
const emailSchema = z.string().email('Invalid email address');

// Phone validation with length check
const phoneSchema = z
  .string()
  .regex(phoneRegex, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must not exceed 20 characters');

// Optional phone (for forms where it's not required)
const optionalPhoneSchema = phoneSchema.optional().or(z.literal(''));

// Name validation
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim();

// Amount validation
const amountSchema = z.number().positive('Amount must be positive').finite('Amount must be a finite number');

// Member form validation
export const MemberFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required').max(100, 'Location too long'),
  groups: z.array(z.string()).default([]),
  status: z.enum([MemberStatus.ACTIVE, MemberStatus.INACTIVE, MemberStatus.VISITOR, MemberStatus.YOUTH, MemberStatus.DECEASED, MemberStatus.ARCHIVED]).default(MemberStatus.ACTIVE),
  joinDate: z.string().date('Invalid join date format'),
  birthday: z.string().date('Invalid birthday format').optional(),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  maritalStatus: z.enum([MaritalStatus.SINGLE, MaritalStatus.MARRIED, MaritalStatus.WIDOWED, MaritalStatus.DIVORCED]).optional(),
  membershipType: z.enum([MembershipType.FULL, MembershipType.PROBATION, MembershipType.ASSOCIATE, MembershipType.CLERGY, MembershipType.NON_COMMUNICANT]).optional(),
  photo: z.string().optional(),
});

export type MemberFormData = z.infer<typeof MemberFormSchema>;

// CSV Import validation - more lenient for bulk operations
export const CsvMemberSchema = z.object({
  firstname: nameSchema,
  lastname: nameSchema,
  phone: phoneSchema,
  location: z.string().min(1, 'Location is required').max(100),
  email: emailSchema.optional().or(z.literal('')),
  groups: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  joindate: z.string().optional().or(z.literal('')),
  membershiptype: z.string().optional().or(z.literal('')),
  maritalstatus: z.string().optional().or(z.literal('')),
  age: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
});

// Login form validation
export const LoginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

// Signup form validation
export const SignupFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain uppercase letter').regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof SignupFormSchema>;

// Password reset validation
export const PasswordResetSchema = z.object({
  email: emailSchema,
});

export type PasswordResetData = z.infer<typeof PasswordResetSchema>;

// Transaction form validation
export const TransactionFormSchema = z.object({
  memberId: z.string().optional(),
  memberName: nameSchema,
  amount: amountSchema,
  type: z.enum(['Tithe', 'Offering', 'Project', 'Harambee', 'Benevolence', 'Expense', 'Salary', 'Utility', 'Maintenance']),
  paymentMethod: z.enum(['M-Pesa', 'Cash', 'Bank Transfer', 'Cheque']),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().min(1, 'Reference is required').max(50, 'Reference too long'),
  category: z.enum(['Income', 'Expense']),
  notes: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof TransactionFormSchema>;

// M-Pesa specific validation (phone + amount)
export const MpesaPaymentSchema = z.object({
  phoneNumber: phoneSchema,
  amount: amountSchema,
  accountRef: z.string().min(1, 'Account reference is required').max(12, 'Account ref max 12 chars'),
  transactionDesc: z.string().min(1).max(50).optional(),
});

export type MpesaPaymentData = z.infer<typeof MpesaPaymentSchema>;

// Event form validation
export const EventFormSchema = z.object({
  title: nameSchema,
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(2, 'Location is required').max(200, 'Location too long'),
  type: z.enum(['WORSHIP', 'BIBLE_STUDY', 'PRAYER', 'OUTREACH', 'YOUTH', 'OTHER']),
  coordinator: z.string().optional(),
  contactPerson: z.string().optional(),
  rsvpDeadline: z.string().optional(),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY']).optional(),
});

export type EventFormData = z.infer<typeof EventFormSchema>;

// Group form validation
export const GroupFormSchema = z.object({
  name: nameSchema,
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
});

export type GroupFormData = z.infer<typeof GroupFormSchema>;

// Budget form validation
export const BudgetFormSchema = z.object({
  category: nameSchema,
  amount: amountSchema,
  spent: z.number().min(0, 'Spent amount cannot be negative').default(0),
  month: z.string().min(1, 'Month is required'),
});

export type BudgetFormData = z.infer<typeof BudgetFormSchema>;

// Utility function for form validation with error handling
export const validateFormData = <T,>(schema: z.ZodSchema<T>, data: unknown): { data: T | null; errors: Record<string, string> } => {
  try {
    const validated = schema.parse(data);
    return { data: validated as T, errors: {} };
  } catch (error: any) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const errors: Record<string, string> = {};
      const issues = (error as any).issues as Array<{ path: (string | number)[]; message: string }>;
      issues.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { data: null, errors };
    }
    return { data: null, errors: { form: 'Validation failed' } };
  }
};
