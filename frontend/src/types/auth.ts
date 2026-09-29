export type SignupFormData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type SignupFormErrors = {
  form?: string
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export type LoginFormData = {
  email: string
  password: string
}

export type RegisteredUser = Omit<SignupFormData, 'password' | 'confirmPassword'> & {
  id: string
  balance: number
  passwordHash: string
}

export type AuthUser = Omit<RegisteredUser, 'passwordHash'>
