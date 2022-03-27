// Only add no rename
// This enum only makes permissions easier to program,
// This does not have to be a complete list of all permissions
// -> the frontend and backend can be somewhat out of sync
export enum Permission {
  ImageView = 'image-view',
  ImageUpload = 'image-upload',

  UserLogin = 'user-login', // Ability to log in
  UserKeepLogin = 'user-keep-login', // Ability to view own user details and refresh token
  UserRegister = 'user-register', // Ability to register

  Settings = 'settings', // Ability to view (personal) settings

  UserManage = 'user-manage', // Allow modification of users
  RoleManage = 'role-manage', // Allow modification of roles
  SysPrefManage = 'syspref-manage',
}
