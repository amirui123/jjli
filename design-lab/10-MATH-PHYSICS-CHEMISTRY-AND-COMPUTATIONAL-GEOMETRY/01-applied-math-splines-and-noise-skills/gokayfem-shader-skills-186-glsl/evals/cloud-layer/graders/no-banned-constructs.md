---
type: regex
target:
  source: file
  path: final.glsl
pattern: '(?:^|\n)(?:(?!//)[^\n])*?(?:\bgl_FragColor\b|\btexture2D\s*\(|\bfract\s*\(\s*sin\s*\()|(?:^|\n)[ \t]*#[ \t]*version\b'
match: not_contains
---
