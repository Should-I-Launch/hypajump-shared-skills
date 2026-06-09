# Linear Document Download — Upload URL Auth

Linear documents that contain file attachments store a URL to the upload. These URLs require the Linear API key in the Authorization header to download.

## Pattern

1. Fetch document metadata via GraphQL:
```python
query = f"""
query {{
  document(id: "{doc_id}") {{
    id title content url
  }}
}}
"""
```

2. Parse the Markdown content for attachment links:
```python
import re
# Content format: "[filename](https://uploads.linear.app/...)"
url = re.search(r'\((https://uploads\.linear\.app/[^)]+)\)', content).group(1)
```

3. Download with Authorization header:
```python
import requests
headers = {"Authorization": api_key}  # Same key as GraphQL
r = requests.get(url, headers=headers)
# Content-Type will be application/zip, application/pdf, etc.
```

## Pitfall

Direct curl without Authorization header returns `{"error":"unauthorized"}`. The upload URL is not public — it requires the same API key used for GraphQL queries.

## Example: ZIP extraction

```python
import zipfile, io
r = requests.get(upload_url, headers={"Authorization": api_key})
with zipfile.ZipFile(io.BytesIO(r.content)) as z:
    z.extractall("/tmp/extracted/")
```
