export function canAccessRoute(permissions: string[] | undefined, routeName: string): boolean {
    if (!permissions?.length) {
        return false;
    }

    if (permissions.includes('*')) {
        return true;
    }

    return permissions.some((pattern) => {
        if (pattern.endsWith('.*')) {
            const prefix = pattern.slice(0, -2);
            return routeName === `${prefix}.index` || routeName.startsWith(`${prefix}.`);
        }

        return routeName === pattern;
    });
}
