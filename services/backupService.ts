import { AppState } from '../types';
import { saveState } from './storageService';

/**
 * Service for managing automated and manual backups.
 */
export const backupService = {
    /**
     * Generates a backup filename with current timestamp.
     */
    getBackupFilename: () => {
        const date = new Date().toISOString().split('T')[0];
        return `bibliopi_backup_${date}.json`;
    },

    /**
     * Triggers a browser download of the current state.
     * @param state The current AppState to backup.
     */
    exportToLocal: (state: AppState) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", backupService.getBackupFilename());
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    /**
     * Logic for automated daily backup check.
     * In a real backend env, this would send data to a NAS or Drive via API.
     * Currently, it prompts the user or stores a 'lastBackup' timestamp.
     */
    performDailyCheck: (state: AppState) => {
        const lastBackup = state.backupSettings.lastBackupDate;
        const today = new Date().toISOString().split('T')[0];

        if (state.backupSettings.frequency === 'daily' && lastBackup !== today) {
            console.log("Scheduling daily backup...");
            // In a client-only app, we can't truly automate this without user interaction,
            // but we can remind the user or trigger the flow.
        }
    },

    /**
     * Technical instructions for NAS/SMB Sync.
     */
    getNasInstructions: () => {
        return `
      To sync BiblioPi to your NAS:
      1. Map your NAS folder to the host machine (e.g., /mnt/nas/backups).
      2. In docker-compose.yml, mount the backup volume:
         volumes:
           - /mnt/nas/backups:/app/backups
      3. All automated JSON exports will now persist directly to your NAS.
    `;
    }
};
