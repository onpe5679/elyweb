"""Prefix public upload references while preserving absolute Supabase URLs."""
from pathlib import Path

root = Path(__file__).resolve().parents[2] / 'apps/web/out'
for path in root.rglob('*'):
    if path.suffix in {'.html', '.txt', '.js', '.css', '.json'}:
        content = path.read_text()
        content = content.replace('/uploads/', '/elyweb/previews/atelier/uploads/')
        content = content.replace('/storage/v1/object/public/elyweb/previews/atelier/uploads/', '/storage/v1/object/public/uploads/')
        path.write_text(content)
