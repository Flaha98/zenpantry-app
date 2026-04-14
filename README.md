<div align="center">

# ZenPantry

**Gestão de dispensa e lista de compras — mobile‑first, com alma.**

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![ngx-translate](https://img.shields.io/badge/ngx--translate-v17-5C2D91?style=flat-square)

</div>

---

<!-- PORTUGUÊS -->
# 🇵🇹 Português

## Sobre o projeto

ZenPantry é uma aplicação web mobile‑first para gerir a dispensa doméstica e a lista de compras. Permite organizar itens por categoria, acompanhar o ciclo de estado de cada produto e trocar de idioma em tempo real — tudo sem necessidade de servidor, com dados guardados localmente.

---

## Funcionalidades

| Funcionalidade | Detalhe |
|---|---|
| **CRUD completo** | Criar, ler, atualizar e eliminar itens da dispensa |
| **Persistência** | LocalStorage — dados mantidos entre recarregamentos |
| **Filtros** | Por categoria (8 tipos) e por estado (pendente / no carrinho / comprado) |
| **Ciclo de estado** | Toque no emoji do item para avançar: pendente → no carrinho → comprado → pendente |
| **Dois idiomas** | Inglês e Português (PT‑PT) via ngx‑translate v17, com troca em tempo real |
| **Modo escuro** | Classes `dark:` do Tailwind, preferência guardada em LocalStorage |
| **Toast notifications** | Feedback visual em cada ação CRUD |
| **Mobile‑first** | Layout otimizado para telemóvel; responsivo em tablet/desktop |

---

## Iniciar a aplicação

```bash
npm install
ng serve
```

A app fica disponível em `http://localhost:4200`.

---

## Arquitetura

<details>
<summary>Ver estrutura de pastas</summary>

```
src/
  public/assets/i18n/
    en.json            # Traduções em inglês
    pt-PT.json         # Traduções em português (PT‑PT)

  app/
    core/
      models/
        item.model.ts         # Tipos + constantes (ItemCategory, ItemStatus, …)
      services/
        data.service.ts       # CRUD + LocalStorage (Signals)
        theme.service.ts      # Modo escuro/claro (Signal + effect)
        toast.service.ts      # Fila de notificações (Signal)

    shared/
      header/
        header.component.ts         # Barra superior fixa
      components/
        language-switcher/          # Seletor EN / PT
        toast/                      # Overlay de notificações

    features/
      pantry/
        pantry-page/                # Página principal — orquestra tudo
        filter-bar/                 # Chips de filtro por categoria e estado
        item-list/                  # Lista de cards de itens
        item-form/                  # Bottom-sheet de criação/edição
```

</details>

---

## Decisões Técnicas

> Esta secção documenta as escolhas arquiteturais com maior impacto na experiência do utilizador e na qualidade do código.

---

### Angular Signals em vez de RxJS

**Decisão:** o estado da lista de itens (`DataService`) e os filtros (`PantryPageComponent`) são geridos com `signal()` e `computed()`.

**Porquê?** O estado é síncrono e local — não existem streams assíncronos. Signals integram‑se nativamente com `ChangeDetectionStrategy.OnPush` sem necessidade de `async pipe`, subscriptions ou teardown manual. O resultado é código mais simples e rastreabilidade de reatividade integrada no Angular.

---

### ngx‑translate em vez de `@angular/localize`

**Decisão:** internacionalização feita com `ngx‑translate v17` e a nova API `provideTranslateService()`.

**Porquê?** `@angular/localize` requer builds separados por idioma e não suporta troca de idioma em runtime. `ngx‑translate` carrega ficheiros JSON via HTTP e troca o idioma instantaneamente — comportamento essencial para uma SPA com utilizadores de diferentes regiões.

---

### `ChangeDetectionStrategy.OnPush` em todos os componentes

**Decisão:** todos os componentes declaram `changeDetection: ChangeDetectionStrategy.OnPush`.

**Porquê?** Combinado com Signals, o Angular só re‑renderiza um componente quando os seus inputs mudam ou um Signal que lê muda — eliminando verificações desnecessárias e garantindo uma UI fluída mesmo em listas longas.

---

### Tailwind `dark:` com estratégia `class`

**Decisão:** `darkMode: 'class'` no `tailwind.config.js`; o `ThemeService` adiciona/remove a classe `dark` no `<html>`.

**Porquê?** Esta estratégia desacopla o tema do sistema operativo, permite ao utilizador substituir a preferência do sistema e garante que a escolha persiste entre sessões via LocalStorage.

---

### Assets em `public/` em vez de `src/assets/`

**Decisão:** os ficheiros de tradução JSON residem em `public/assets/i18n/`.

**Porquê?** A partir do Angular 17+, a pasta `public/` é o diretório estático recomendado. O build inclui automaticamente todo o conteúdo de `public/`, tornando os assets acessíveis sem configuração adicional no `angular.json`.

---

## Tecnologias

| Tecnologia | Versão | Utilização |
|---|---|---|
| Angular | 21 | Standalone components, Signals, lazy‑loaded routes |
| Tailwind CSS | v3 | Mobile‑first, dark mode via class, animações customizadas |
| ngx‑translate | v17 | i18n em runtime (EN / PT‑PT) |
| TypeScript | 5.9 | Tipagem estrita, sem `any` |

---
---

<!-- ENGLISH -->
# 🇬🇧 English

## About

ZenPantry is a mobile‑first web application for managing home pantry and shopping lists. It lets you organise items by category, track each product's status through a visual cycle, and switch language at runtime — all without a server, with data stored locally.

---

## Features

| Feature | Details |
|---|---|
| **Full CRUD** | Create, read, update and delete pantry items |
| **Persistence** | LocalStorage — data preserved between page reloads |
| **Filters** | By category (8 types) and by status (pending / in cart / purchased) |
| **Status cycle** | Tap the item emoji to advance: pending → in cart → purchased → pending |
| **Two languages** | English and Portuguese (PT‑PT) via ngx‑translate v17, switching at runtime |
| **Dark mode** | Tailwind `dark:` classes, preference saved in LocalStorage |
| **Toast notifications** | Visual feedback for every CRUD action |
| **Mobile‑first** | Layout optimised for mobile; responsive on tablet/desktop |

---

## Getting started

```bash
npm install
ng serve
```

The app is available at `http://localhost:4200`.

---

## Architecture

<details>
<summary>View folder structure</summary>

```
src/
  public/assets/i18n/
    en.json            # English translations
    pt-PT.json         # Portuguese (PT‑PT) translations

  app/
    core/
      models/
        item.model.ts         # Types + constants (ItemCategory, ItemStatus, …)
      services/
        data.service.ts       # CRUD + LocalStorage (Signals)
        theme.service.ts      # Dark/light mode (Signal + effect)
        toast.service.ts      # Notification queue (Signal)

    shared/
      header/
        header.component.ts         # Fixed top bar
      components/
        language-switcher/          # EN / PT switcher
        toast/                      # Notification overlay

    features/
      pantry/
        pantry-page/                # Main page — orchestrates everything
        filter-bar/                 # Category and status filter chips
        item-list/                  # Item card list
        item-form/                  # Create/edit bottom sheet
```

</details>

---

## Technical Decisions

> This section documents the architectural choices with the greatest impact on user experience and code quality.

---

### Angular Signals over RxJS

**Decision:** item list state (`DataService`) and filters (`PantryPageComponent`) are managed with `signal()` and `computed()`.

**Why?** The state is synchronous and local — there are no asynchronous streams. Signals integrate natively with `ChangeDetectionStrategy.OnPush` without needing `async pipe`, subscriptions, or manual teardown. The result is simpler code with built‑in reactivity tracking.

---

### ngx‑translate over `@angular/localize`

**Decision:** internationalisation via `ngx‑translate v17` with the new `provideTranslateService()` API.

**Why?** `@angular/localize` requires separate builds per language and does not support runtime language switching. `ngx‑translate` loads JSON files via HTTP and switches the language instantly — essential behaviour for a SPA serving users across different regions.

---

### `ChangeDetectionStrategy.OnPush` on every component

**Decision:** all components declare `changeDetection: ChangeDetectionStrategy.OnPush`.

**Why?** Combined with Signals, Angular only re‑renders a component when its inputs change or a Signal it reads changes — eliminating unnecessary checks and keeping the UI smooth even with long lists.

---

### Tailwind `dark:` with the `class` strategy

**Decision:** `darkMode: 'class'` in `tailwind.config.js`; `ThemeService` adds/removes the `dark` class on `<html>`.

**Why?** This strategy decouples the theme from the OS preference, lets the user override the system setting, and ensures the choice persists across sessions via LocalStorage.

---

### Assets in `public/` instead of `src/assets/`

**Decision:** translation JSON files live in `public/assets/i18n/`.

**Why?** From Angular 17+, `public/` is the recommended static directory. The build automatically includes everything under `public/`, making assets accessible without extra `angular.json` configuration.

---

## Tech stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21 | Standalone components, Signals, lazy‑loaded routes |
| Tailwind CSS | v3 | Mobile‑first, dark mode via class, custom animations |
| ngx‑translate | v17 | Runtime i18n (EN / PT‑PT) |
| TypeScript | 5.9 | Strict typing, zero `any` |
