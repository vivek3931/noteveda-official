/**
 * NoteVeda PDF Plugin Manager
 * 
 * Simple plugin registration and event dispatching.
 * Keep this minimal for v1 - expand based on actual needs.
 */

import { NoteVedaPDFPlugin, PluginRegistrationOptions } from './types';

interface RegisteredPlugin {
    plugin: NoteVedaPDFPlugin;
    options: Required<PluginRegistrationOptions>;
    enabled: boolean;
}

class PluginManagerClass {
    private plugins: Map<string, RegisteredPlugin> = new Map();
    private eventOrder: string[] = []; // Ordered by priority

    /**
     * Register a plugin
     */
    register(plugin: NoteVedaPDFPlugin, options: PluginRegistrationOptions = {}): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`[PluginManager] Plugin ${plugin.id} already registered, replacing...`);
            this.unregister(plugin.id);
        }

        const registeredPlugin: RegisteredPlugin = {
            plugin,
            options: {
                priority: options.priority ?? 0,
                enabled: options.enabled ?? true,
            },
            enabled: options.enabled ?? true,
        };

        this.plugins.set(plugin.id, registeredPlugin);
        this.updateEventOrder();

        // Call activation hook
        if (registeredPlugin.enabled) {
            plugin.onActivate?.();
        }

        console.log(`[PluginManager] Registered plugin: ${plugin.id}`);
    }

    /**
     * Unregister a plugin
     */
    unregister(pluginId: string): void {
        const registered = this.plugins.get(pluginId);
        if (registered) {
            registered.plugin.onDeactivate?.();
            this.plugins.delete(pluginId);
            this.updateEventOrder();
            console.log(`[PluginManager] Unregistered plugin: ${pluginId}`);
        }
    }

    /**
     * Enable/disable a plugin
     */
    setEnabled(pluginId: string, enabled: boolean): void {
        const registered = this.plugins.get(pluginId);
        if (registered) {
            const wasEnabled = registered.enabled;
            registered.enabled = enabled;

            if (enabled && !wasEnabled) {
                registered.plugin.onActivate?.();
            } else if (!enabled && wasEnabled) {
                registered.plugin.onDeactivate?.();
            }
        }
    }

    /**
     * Get all registered plugins
     */
    getPlugins(): NoteVedaPDFPlugin[] {
        return Array.from(this.plugins.values())
            .filter((r) => r.enabled)
            .map((r) => r.plugin);
    }

    /**
     * Get toolbar items from all active plugins
     */
    getToolbarItems(): Array<{ id: string; item: React.ReactNode }> {
        return Array.from(this.plugins.values())
            .filter((r) => r.enabled && r.plugin.toolbarItem)
            .map((r) => ({
                id: r.plugin.id,
                item: r.plugin.toolbarItem,
            }));
    }

    /**
     * Dispatch event to all registered plugins (internal helper)
     */
    private dispatchEvent(
        event: string,
        handler: (plugin: NoteVedaPDFPlugin) => void
    ): void {
        for (const pluginId of this.eventOrder) {
            const registered = this.plugins.get(pluginId);
            if (registered?.enabled) {
                try {
                    handler(registered.plugin);
                } catch (error) {
                    console.error(`[PluginManager] Error in ${pluginId}.${event}:`, error);
                }
            }
        }
    }

    // Event dispatchers
    onPageRender(pageNumber: number): void {
        this.dispatchEvent('onPageRender', (p) => p.onPageRender?.(pageNumber));
    }

    onTextSelect(text: string, rect: DOMRect, pageNumber: number): void {
        this.dispatchEvent('onTextSelect', (p) => p.onTextSelect?.(text, rect, pageNumber));
    }

    onScroll(scrollTop: number, currentPage: number): void {
        this.dispatchEvent('onScroll', (p) => p.onScroll?.(scrollTop, currentPage));
    }

    onDocumentLoad(totalPages: number, url: string): void {
        this.dispatchEvent('onDocumentLoad', (p) => p.onDocumentLoad?.(totalPages, url));
    }

    onDocumentUnload(): void {
        this.dispatchEvent('onDocumentUnload', (p) => p.onDocumentUnload?.());
    }

    /**
     * Update event order based on priority
     */
    private updateEventOrder(): void {
        this.eventOrder = Array.from(this.plugins.entries())
            .sort((a, b) => b[1].options.priority - a[1].options.priority)
            .map(([id]) => id);
    }

    /**
     * Clear all plugins
     */
    clear(): void {
        for (const pluginId of this.plugins.keys()) {
            this.unregister(pluginId);
        }
    }
}

// Singleton instance
export const PluginManager = new PluginManagerClass();

// Export class for testing
export { PluginManagerClass };
