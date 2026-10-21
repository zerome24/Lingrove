"""
Lingrove Database Backup and Restore Utility
Provides atomic backup creation and restore functionality for the local SQLite database.

Usage:
    Backup:  python backend/app/backup_database.py backup
    Restore: python backend/app/backup_database.py restore <backup_file_path>
"""

import os
import sys
import shutil
import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../lingrove.db"))
BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backups"))

def backup():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database {DB_PATH} not found.")
        sys.exit(1)

    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"lingrove_backup_{timestamp}.sqlite")
    
    shutil.copy2(DB_PATH, backup_file)
    print(f"Database backed up successfully to: {backup_file}")
    print(f"Size: {os.path.getsize(backup_file)} bytes")
    return backup_file

def restore(backup_path: str):
    if not os.path.exists(backup_path):
        print(f"Error: Backup file {backup_path} does not exist.")
        sys.exit(1)

    # First take a safety snapshot of current DB before restoring
    if os.path.exists(DB_PATH):
        safety_copy = DB_PATH + ".safety_before_restore"
        shutil.copy2(DB_PATH, safety_copy)
        print(f"Created safety copy of current DB at: {safety_copy}")

    shutil.copy2(backup_path, DB_PATH)
    print(f"Successfully restored database from: {backup_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ["backup", "restore"]:
        print("Usage:")
        print("  python backend/app/backup_database.py backup")
        print("  python backend/app/backup_database.py restore <backup_file_path>")
        sys.exit(1)

    if sys.argv[1] == "backup":
        backup()
    elif sys.argv[1] == "restore":
        if len(sys.argv) < 3:
            print("Error: Missing backup file path to restore.")
            sys.exit(1)
        restore(sys.argv[2])
