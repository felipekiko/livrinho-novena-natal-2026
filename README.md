# Novena de Natal 2026 — webapp

Versão para celular (uso pessoal) da *Novena de Natal 2026 — "A paz existe, deseja habitar-nos"* (Edições CNBB, autoria de Matheus Cedric Godinho).

App estático (HTML/CSS/JS puro), sem build, com tema escuro e PWA para instalar na tela inicial do Android.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Casca do app |
| `styles.css` | Tema escuro + dourado |
| `app.js` | Navegação e renderização |
| `dados.json` | **Todo o conteúdo da novena** (orações, 9 encontros, cantos) |
| `manifest.webmanifest` / `sw.js` / `icons/` | PWA |

Para corrigir qualquer texto, edite apenas `dados.json`.

### Como a navegação segue o livro físico

Cada encontro é percorrido na ordem de uso, com botões **Anterior / Próximo**:

1. Oração Inicial → 2. Acolhida do Tema → 3. Iluminação Bíblica → 4. Partilha → 5. Fato da Vida → 6. Rezar com a Palavra → 7. Compromisso de Irmãos → 8. Oração Final

As partes fixas (Oração Inicial e Final) aparecem já no lugar certo, sem precisar folhear. Os cantos ficam numa seção própria.

Legenda: **D.** Dirigente · **L1./L2./L3.** Leitores · **T.** Todos · **R.** Resposta. O negrito marca o que é rezado/respondido por todos.

## Testar localmente

Precisa ser via servidor HTTP (o app carrega `dados.json` via `fetch`):

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicar no GitHub Pages

1. `git add` dos arquivos do app (o `scan.pdf` fica fora pelo `.gitignore`).
2. Commit e push para o branch publicado (ex.: `main`).
3. No GitHub: **Settings → Pages → Source: Deploy from a branch**, branch `main`, pasta `/ (root)`.
4. Acessar a URL gerada no celular e usar **Adicionar à tela inicial** (Chrome no Android).

> O arquivo `scan.pdf` é a digitalização do livro físico e **não** é versionado/publicado.
