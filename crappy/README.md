# crappy — 勤怠・経費管理アプリ

フリーランスエンジニア向けの個人利用 Web アプリです。
月次の稼働時間（上限・下限目標）の管理、打刻、経費入力・領収書保管を一元化します。

---

## 目次

1. [機能概要](#機能概要)
2. [利用している Google / Firebase リソース](#利用している-google--firebase-リソース)
3. [運用者向け — 日常利用と設定](#運用者向け--日常利用と設定)
4. [開発者向け — セットアップと開発手順](#開発者向け--セットアップと開発手順)
5. [ソースコード構成](#ソースコード構成)
6. [データ構造](#データ構造)
7. [今後対応が必要な箇所](#今後対応が必要な箇所)

---

## 機能概要

| 画面 | 内容 |
|------|------|
| **Dashboard** | 月ナビゲーションで過去月も参照可能。累積時間・残営業日・必要ペース・予測着地をバーンアップチャートで表示。月別目標のインライン編集 |
| **Punch** | タイマー打刻（開始/終了）または時間の手動入力。±0.25h 刻みで調整後にログ保存 |
| **Attendance** | 週単位カレンダーで過去データの閲覧・追加・編集・削除。月をまたいだ週も対応。月次 CSV エクスポート |
| **Expense** | 経費入力（日付・タグ・金額・説明・領収書写真）。一覧の日付降順表示とインライン編集。月次 CSV エクスポート |
| **設定（デフォルト）** | AppBar 歯車アイコンから全月共通の稼働時間目標（上限・下限）を設定 |
| **設定（月別）** | Dashboard チャート下部の調整アイコンから特定月の目標を個別設定。デフォルトへのリセットも可能 |

### トースト通知

すべての保存・削除操作完了時に画面下部中央へトースト通知を表示します。

---

## 利用している Google / Firebase リソース

### Firebase Authentication

- **用途**: Google アカウントによるログイン認証
- **方式**:
  - デスクトップ: `signInWithPopup` でポップアップ認証
  - モバイル等ポップアップ非対応環境: `signInWithRedirect` に自動フォールバック
  - リダイレクト復帰時は `getRedirectResult()` で認証状態を復元
- **アクセス制限**: 環境変数 `VITE_ALLOWED_EMAILS` にカンマ区切りで許可するメールアドレスを列挙。空の場合はすべての Google アカウントを許可
- **管理場所**: [Firebase コンソール](https://console.firebase.google.com/) → Authentication → Sign-in method → Google

### Cloud Firestore

- **用途**: 勤怠データ・経費データ・設定データ（デフォルト・月別）のリアルタイム同期・永続化
- **オフライン対応**: `persistentLocalCache`（IndexedDB）を使用。Web Locks API 非対応ブラウザ（旧 iOS Safari 等）では `persistentSingleTabManager` に自動フォールバック
- **データモデル**: ユーザーごとにサブコレクションを分離（詳細は [データ構造](#データ構造) 参照）
- **セキュリティルール**: 各ユーザーが自分のドキュメントのみ読み書きできるよう設定が必要（後述）
- **管理場所**: Firebase コンソール → Firestore Database

#### 推奨 Firestore セキュリティルール

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Firebase Storage

- **用途**: 経費の領収書写真のアップロード・保存・削除
- **保存パス**: `receipts/{uid}/{YYYY-MM}/{expenseId}.{拡張子}`
- **操作**: 経費追加時にアップロード、経費削除時に対応ファイルも自動削除
- **管理場所**: Firebase コンソール → Storage

#### 推奨 Storage セキュリティルール

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 運用者向け — 日常利用と設定

### ログイン

1. アプリにアクセスし「Googleでサインイン」をタップ
2. 許可された Google アカウントでログイン
3. モバイルではリダイレクト方式でログインが行われます（自動判別）

### 打刻の流れ

1. **Punch** 画面を開く
2. **CLOCK IN** でタイマー開始 → **CLOCK OUT** で終了
3. 必要に応じて ±0.25h ボタンで時間を調整
4. **LOG** ボタンで今日の勤怠として保存 → Dashboard に自動反映

### 過去データの確認と修正

- **Dashboard** 画面の `<` `>` で過去月のチャートと実績を参照
- **Attendance** 画面で週を遡り、時間入力欄を直接編集（Enter キーまたはフォーカスアウトで保存）
- 行右端の削除ボタンでセッション削除、日付右の `+` ボタンで追加入力行を展開

### 目標時間の設定

| 設定種別 | 操作方法 |
|---------|---------|
| **全月共通のデフォルト** | AppBar 右上の歯車アイコン → 下限・上限を入力して保存 |
| **特定月の個別設定** | Dashboard → チャート下部の調整アイコン（⚙）→ 下限・上限を入力して保存 |
| **月別設定をリセット** | 同じ調整アイコンから「デフォルトに戻す」をクリック |

月別設定が有効な月は Dashboard のタイトル横に「月別設定」チップが表示されます。

### CSV エクスポート

| データ | 操作 | ファイル名 |
|--------|------|-----------|
| 勤怠 | **Attendance** ヘッダーの **CSV** ボタン | `attendance_YYYY-MM.csv` |
| 経費 | **Expense** 画面の **CSV出力** ボタン | `expenses_YYYY-MM.csv` |

勤怠 CSV のカラム: `日付, 時間(h), メモ`（日付昇順、BOM付き UTF-8）
経費 CSV のカラム: `取引日, 勘定科目, 税区分, 金額, 摘要`（freee 等の会計ソフトへのインポートを想定）

### 祝日対応

2025年・2026年の日本国民の祝日がビジネスデー計算に組み込まれています。2027年以降は祝日データの追加が必要です（[今後対応が必要な箇所](#今後対応が必要な箇所) 参照）。

---

## 開発者向け — セットアップと開発手順

### 前提条件

- Node.js 18 以上
- npm 9 以上
- Firebase プロジェクト（Authentication / Firestore / Storage を有効化済み）

### 初期セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local
```

`.env.local` を編集し Firebase プロジェクトの値を設定します：

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# 許可する Google アカウントのメールアドレス（カンマ区切り、空なら全員許可）
VITE_ALLOWED_EMAILS=your.email@gmail.com
```

> **注意**: `.env.local` は `.gitignore` に追加し、リポジトリにコミットしないこと。

### Firebase コンソールでの設定

1. Authentication → Sign-in method → **Google** を有効化
2. Authentication → Settings → 承認済みドメインに `localhost` とデプロイ先ドメインを追加
3. Firestore Database を作成（リージョン: `asia-northeast1` 推奨）
4. Storage を有効化
5. 上記の Firestore・Storage セキュリティルールを設定（テストモードのまま本番運用しないこと）

### コマンド一覧

```bash
npm run dev      # 開発サーバー起動 → http://localhost:5173
npm run build    # 本番ビルド（dist/ に出力）
npm run preview  # ビルド成果物のローカルプレビュー
npm run lint     # ESLint 実行
```

### 技術スタック

| カテゴリ | ライブラリ |
|----------|-----------|
| UI フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 8 |
| UI コンポーネント | MUI (Material UI) v7 |
| チャート | Recharts v3 |
| 日付処理 | date-fns v4 |
| 認証 | Firebase Authentication v12 |
| データベース | Cloud Firestore v12 |
| ファイルストレージ | Firebase Storage v12 |

---

## ソースコード構成

```
src/
├── contexts/
│   └── ToastContext.tsx        # トースト通知の Context・Provider・useToast フック
│
├── components/
│   ├── AuthGate.tsx            # 認証状態に応じてログイン画面/本体を切り替え
│   ├── LoginScreen.tsx         # Google サインインボタン画面
│   ├── Navigation.tsx          # 右ドロワーナビゲーション
│   ├── StatusHeader.tsx        # AppBar 内のステータス表示
│   ├── Dashboard.tsx           # 月ナビ・統計カード・月別設定インライン編集
│   ├── DashboardChart.tsx      # バーンアップチャート (Recharts)
│   ├── PunchView.tsx           # タイマー打刻 UI
│   ├── AttendanceCalendar.tsx  # 週カレンダー勤怠編集 UI
│   ├── ExpenseView.tsx         # 経費入力・一覧 UI
│   └── SettingsModal.tsx       # デフォルト設定モーダル（全月共通）
│
├── hooks/
│   ├── useAuth.ts              # Firebase Auth 状態管理・サインイン/アウト
│   ├── useWorkSessions.ts      # 当月勤怠データの購読・CRUD（Punch 用）
│   ├── useDashboardData.ts     # 任意月の勤怠データ購読・dailyTotals 算出（Dashboard 用）
│   ├── useAttendanceCalendar.ts# 週ナビ付き勤怠データ購読・CRUD（Calendar 用）
│   ├── useMonthSettings.ts     # デフォルト設定・月別設定の購読・保存・リセット
│   └── useDashboardStats.ts    # 統計計算・チャートデータ生成（純粋関数）
│
├── lib/
│   ├── firebase.ts             # Firebase 初期化（Auth / Firestore / Storage）
│   ├── firestoreService.ts     # Firestore 読み書き関数（勤怠・経費・設定・月別設定）
│   ├── receiptStorage.ts       # Firebase Storage アップロード・削除
│   ├── businessDays.ts         # 営業日計算ユーティリティ
│   └── holidays.ts             # 日本の祝日定義（2025〜2026年）
│
├── types/
│   └── WorkData.ts             # 型定義（WorkSession / Expense / AppSettings / MonthSettings 他）
│
└── App.tsx                     # ルートコンポーネント・画面ルーティング・月状態管理
```

### 主なデータフロー

```
ToastProvider（アプリ全体を包む）
  └── AppContent（App.tsx）
        ├── useWorkSessions()       → 当月データ購読・Punch の addSession
        ├── useDashboardData(month) → 選択月データ購読・Dashboard の dailyTotals
        └── useMonthSettings(month) → デフォルト＋月別設定の購読・更新
              ↓ settings（有効値）をDashboard へ渡す
        Dashboard
              ├── 月ナビゲーション（selectedMonth を App で管理）
              └── 月別設定インライン編集
```

---

## データ構造

### Firestore

```
users/
└── {uid}/
    ├── settings/
    │   └── current             # デフォルト設定 { targetMin, targetMax, updatedAt }
    ├── monthSettings/
    │   └── {YYYY-MM}           # 月別設定 { targetMin?, targetMax?, updatedAt }
    │                           # ドキュメントが存在しない月はデフォルト設定を使用
    ├── attendance/
    │   └── {YYYY-MM}           # { month, sessions: WorkSession[], updatedAt }
    └── expenses/
        └── {YYYY-MM}           # { month, items: Expense[], updatedAt }
```

**設定の優先順位**: 月別設定（`monthSettings/{YYYY-MM}`）> デフォルト設定（`settings/current`）

**WorkSession 型**

```typescript
{
  id: string;       // UUID
  date: string;     // "YYYY-MM-DD"
  hours: number;    // 0.25 刻み
  note?: string;
}
```

**Expense 型**

```typescript
{
  id: string;           // UUID
  date: string;         // "YYYY-MM-DD"
  amount: number;       // 円（整数）
  description: string;
  tag: 'entertainment' | 'equipment' | 'transport' | 'communication' | 'other';
  receiptUrl?: string;  // Firebase Storage ダウンロード URL
  receiptPath?: string; // Storage 内パス（削除時に使用）
}
```

**MonthSettings 型**

```typescript
{
  targetMin?: number;  // 省略時はデフォルト値を使用
  targetMax?: number;
}
```

### Firebase Storage

```
receipts/
└── {uid}/
    └── {YYYY-MM}/
        └── {expenseId}.{jpg|png|...}
```

---

## 今後対応が必要な箇所

### 高優先度

- **Firebase セキュリティルールの本番適用確認**
  Firestore・Storage のセキュリティルールが本番環境で正しく設定されているか必ず確認してください。
  テストモード（全員読み書き可）のままデプロイしないこと。

- **祝日データの追加（2027年以降）**
  `src/lib/holidays.ts` に 2027 年以降の祝日を毎年追加する必要があります。
  現状はハードコードされており、2026 年末以降は祝日が営業日として扱われます。
  対応策として `@holiday-jp/holiday_jp` パッケージの導入や内閣府の祝日 CSV API の利用を検討してください。

### 中優先度

- **経費の領収書写真の差し替え**
  経費一覧のインライン編集では写真の差し替え・削除ができません。対応するには編集フォームへのファイル入力と Storage の更新処理が必要です。

- **バンドルサイズの最適化**
  ビルド成果物が約 1.39 MB（gzip 後 416 KB）あります。
  MUI・Recharts・Firebase の dynamic import によるコードスプリットを検討してください。

- **Firestore 書き込みエラーのハンドリング**
  保存処理が失敗した場合のユーザーへのエラー通知が未実装です。`try/catch` と `showToast` を組み合わせたエラー通知の追加を検討してください。

### 低優先度

- **PWA 対応**
  `vite-plugin-pwa` を導入することでホーム画面への追加・オフライン動作が改善されます。

- **未使用ライブラリの整理**
  `google-spreadsheet`・`lucide-react`・`tailwindcss` が `package.json` に残っていますが現在は未使用です。削除することでビルド依存を整理できます。
