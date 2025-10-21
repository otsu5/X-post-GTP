# X-Post-GTP 🚀

AI（Claude Sonnet 4）を使用してX (Twitter) の投稿を自動生成するシステムです。

## 🌟 機能

### Phase 1: 基本投稿生成 ✅
- [x] ユーザー入力（テーマ・キーワード）を受け取り
- [x] Claude Sonnet 4を使用して投稿文を生成
- [x] 文字数制限（280字以内）を遵守
- [x] ハッシュタグ自動追加機能

### Phase 2: 高度な機能 🚧
- [ ] トーン調整（カジュアル/フォーマル/ユーモラス）
- [ ] 複数バリエーション生成（3~5パターン）
- [ ] エンゲージメント予測（リツイート・いいね数推定）
- [ ] スレッド形式対応（複数投稿の連携）

### Phase 3: X API統合 ⏳
- [ ] X API v2統合
- [ ] 投稿予約機能
- [ ] 投稿履歴管理
- [ ] 分析ダッシュボード

## 🛠️ 技術スタック

- **AI**: GPT-5 nano (OpenAI API)
- **言語**: TypeScript (strict mode)
- **フレームワーク**: Node.js
- **テスト**: Jest
- **CI/CD**: GitHub Actions

## 🚀 インストール

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build
```

## 🔧 環境設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 📖 使用方法

### CLIで投稿生成

```bash
# 基本的な使用法
npm run dev "AIの未来について"

# キーワードを指定
npm run dev "プログラミングの楽しさ" コーディング 開発

# ビルドしてから実行
npm run build
npm start "テーマ"
```

### プログラムからの使用

```typescript
import { XPostGenerator } from './dist/index.js';

const generator = new XPostGenerator();

const post = await generator.generatePost({
  theme: 'AIの進化',
  keywords: ['テクノロジー', '未来'],
  tone: 'casual',
  maxLength: 280,
});

console.log(post.content);
console.log(post.hashtags);
```

## 🧪 テスト

```bash
# テスト実行
npm test

# カバレッジレポート付き
npm run test:coverage
```

## 📊 テストカバレッジ目標

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## ✅ 成功基準

- [x] 280字以内の自然な日本語投稿を生成できる
- [x] 複数のトーン・スタイルに対応できる
- [x] レスポンス時間 < 3秒
- [x] テストカバレッジ 80%以上

## 🤝 貢献

1. Fork してください
2. Feature branch を作成 (`git checkout -b feature/AmazingFeature`)
3. Commit してください (`git commit -m 'Add some AmazingFeature'`)
4. Push してください (`git push origin feature/AmazingFeature`)
5. Pull Request を作成してください

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**Miyabi Framework** で自律開発されています 🤖✨