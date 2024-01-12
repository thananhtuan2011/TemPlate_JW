export function appInitializer(): any {
    return () =>
        new Promise((resolve) => {
            // @ts-ignore
            resolve();
        });
}
