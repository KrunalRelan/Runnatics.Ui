export enum AppPermission {
    Admin = 'Admin',
    SuperAdmin = 'SuperAdmin',
    Ops = 'Ops',
    Support = 'Support',
    Readonly = 'Readonly'
}

export const appPermissions = Object.values(AppPermission);