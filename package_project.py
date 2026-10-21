"""
Lingrove Production Packaging Script
Creates a clean, distributable release package (ZIP) adhering to Phase 14 specifications.
Excludes node_modules, venvs, caches, .env secrets, logs, and temporary test artifacts.
Includes all source code, clean .env.example, migrations, tests, deployment configs, and documentation.

Usage:
    python package_project.py
"""

import os
import zipfile
import shutil

EXCLUDE_DIRS = {
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    ".pytest_cache",
    ".vite",
    ".vscode",
    ".idea",
    "dist",
    "build",
    "backups",
    "dist_clean",
    "package_dist",
}

EXCLUDE_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".log",
    ".bak",
    ".backup",
}

EXCLUDE_EXACT_FILES = {
    ".env",
    "backend/.env",
    "backend/lingrove.db.safety_backup_preaudit.bak",
}

def should_exclude(rel_path: str) -> bool:
    normalized = rel_path.replace("\\", "/")
    parts = normalized.split("/")
    
    # Check directory exclusion
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
            
    # Check exact file exclusion
    if normalized in EXCLUDE_EXACT_FILES or os.path.basename(normalized) == ".env":
        return True
        
    # Check extension exclusion
    ext = os.path.splitext(normalized)[1].lower()
    if ext in EXCLUDE_EXTENSIONS:
        return True
        
    return False

def package():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    output_filename = "Lingrove_Production_Release.zip"
    output_path = os.path.join(root_dir, output_filename)
    
    if os.path.exists(output_path):
        os.remove(output_path)
        
    print(f"Creating clean production package: {output_filename}...")
    file_count = 0
    total_bytes = 0

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Modify dirs in-place to avoid descending into excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                
                if should_exclude(rel_path) or file == output_filename:
                    continue
                    
                zipf.write(full_path, arcname=os.path.join("Lingrove", rel_path))
                file_count += 1
                total_bytes += os.path.getsize(full_path)

    print(f"Package created successfully!")
    print(f"Output: {output_path}")
    print(f"Total files packaged: {file_count}")
    print(f"Total uncompressed size: {total_bytes / (1024*1024):.2f} MB")
    print(f"Compressed archive size: {os.path.getsize(output_path) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    package()
