# Understanding the 409 Error

## Error: 409 Conflict

The error you're seeing is:
```
Failed to load resource: the server responded with a status of 409
```

A **409 Conflict** status code means that the resource (register number) you're trying to create **already exists** in the database.

## What This Means

The register number you entered is already used by another student. The `register_number` field has a **UNIQUE constraint** in the database, so each student must have a unique register number.

## How to Fix

### Option 1: Use a Different Register Number
Simply enter a different register number that doesn't exist yet.

For example, if you tried to add:
- Register Number: `REG001`
- Full Name: `John Doe`

And you got a 409 error, it means `REG001` already exists. Try:
- Register Number: `REG004` (or any other unique value)
- Full Name: `John Doe`

### Option 2: Check Existing Students
1. Look at the students list to see what register numbers are already taken
2. Scroll through to find an available number

### Option 3: Delete the Existing Student First
If you want to reuse a register number:
1. Find the existing student with that register number
2. Click the delete button (trash icon) on that student
3. Then try adding your new student again

## Testing Steps

1. **Click "Add Student"**
2. **Fill in the form with a unique register number:**
   - Register Number: `REG999` (use any number not in the list)
   - Full Name: `Test Student`
   - Other fields: Optional
3. **Click "Add Student"**
4. **You should now see:** "Student added successfully" toast

## Common Register Numbers That Might Already Exist

Based on the seed data, these register numbers likely already exist:
- `REG001`
- `REG002`
- `REG003`

Try using:
- `REG004`
- `REG005`
- `TEST001`
- `DEMO001`
- Or any other unique value

## Improved Error Handling

I've updated the code to:
1. Check for duplicates before trying to insert
2. Show a clear error message: "A student with register number 'XXX' already exists"
3. Log detailed error information in the console for debugging

Now when you try to add a duplicate register number, you'll see a clear message instead of just seeing "Failed to add student".

## Summary

**The issue**: You're trying to add a student with a register number that already exists in the database.

**The solution**: Use a different, unique register number.

