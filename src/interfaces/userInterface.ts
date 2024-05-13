export const gender = ['male', 'female', 'other'] as const;
export type genderT = typeof gender[number];

export const role = ['admin', 'lawyer', 'client'] as const;
export type roleT = typeof role[number];
