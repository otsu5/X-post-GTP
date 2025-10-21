import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface PostGenerationOptions {
  theme: string;
  keywords?: string[];
  tone?: 'casual' | 'formal' | 'humorous';
  maxLength?: number;
}

interface GeneratedPost {
  content: string;
  hashtags: string[];
  characterCount: number;
  tone: string;
}

class XPostGenerator {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Generate a single X post based on the given options
   */
  async generatePost(options: PostGenerationOptions): Promise<GeneratedPost> {
    const { theme, keywords = [], tone = 'casual', maxLength = 280 } = options;

    const prompt = this.buildPrompt(theme, keywords, tone, maxLength);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'あなたはX（Twitter）の投稿を生成する専門AIです。自然で魅力的な投稿を作成してください。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const generatedContent = response.choices[0].message.content;
      if (!generatedContent) {
        throw new Error('Unexpected response from OpenAI');
      }

      const content = generatedContent.trim();
      const hashtags = this.extractOrGenerateHashtags(content, keywords);
      const characterCount = content.length;

      // Ensure content fits within character limit
      const finalContent = characterCount > maxLength
        ? content.substring(0, maxLength - 3) + '...'
        : content;

      return {
        content: finalContent,
        hashtags,
        characterCount: finalContent.length,
        tone,
      };
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('Failed to generate post with OpenAI');
    }
  }

  /**
   * Generate multiple post variations
   */
  async generateMultiplePosts(
    options: PostGenerationOptions,
    count: number = 3
  ): Promise<GeneratedPost[]> {
    const posts: GeneratedPost[] = [];

    for (let i = 0; i < count; i++) {
      const post = await this.generatePost({
        ...options,
        // Add variation hint for multiple generations
        theme: `${options.theme} (バリエーション ${i + 1})`,
      });
      posts.push(post);
    }

    return posts;
  }

  private buildPrompt(theme: string, keywords: string[], tone: string, maxLength: number): string {
    const toneDescriptions = {
      casual: 'カジュアルで親しみやすい',
      formal: '丁寧でフォーマルな',
      humorous: 'ユーモラスで楽しい',
    };

    const keywordsText = keywords.length > 0 ? `キーワード: ${keywords.join(', ')}` : '';

    return `以下の条件でX（Twitter）の投稿を1つ生成してください：

テーマ: ${theme}
${keywordsText}
トーン: ${toneDescriptions[tone as keyof typeof toneDescriptions]}
文字数制限: ${maxLength}文字以内

要件:
- 自然で魅力的な日本語の投稿文
- Xのスタイルに適した書き方
- ハッシュタグは含めない（別途追加）
- 絵文字を適切に使用
- 読者が共感しやすい内容

投稿文のみを出力してください。`;
  }

  private extractOrGenerateHashtags(content: string, keywords: string[]): string[] {
    const hashtags: string[] = [];

    // Extract existing hashtags from content
    const hashtagRegex = /#[^\s]+/g;
    const existingHashtags = content.match(hashtagRegex) || [];
    hashtags.push(...existingHashtags.map(tag => tag.substring(1)));

    // Add keywords as hashtags if not already present
    keywords.forEach(keyword => {
      const hashtag = keyword.replace(/\s+/g, '').toLowerCase();
      if (!hashtags.includes(hashtag)) {
        hashtags.push(hashtag);
      }
    });

    // Generate additional relevant hashtags based on content
    const additionalHashtags = this.generateRelevantHashtags(content);
    hashtags.push(...additionalHashtags.filter(tag => !hashtags.includes(tag)));

    // Limit to 3 hashtags
    return hashtags.slice(0, 3);
  }

  private generateRelevantHashtags(content: string): string[] {
    const hashtags: string[] = [];

    // Simple keyword extraction for hashtags
    const words = content.toLowerCase().split(/\s+/);
    const relevantWords = words.filter(word =>
      word.length > 2 &&
      !['です', 'ます', 'して', 'ある', 'いる', 'する', 'なる', 'ある'].includes(word)
    );

    // Add some common X hashtags based on content themes
    if (content.includes('AI') || content.includes('人工知能')) {
      hashtags.push('AI');
    }
    if (content.includes('技術') || content.includes('プログラミング')) {
      hashtags.push('プログラミング');
    }

    return hashtags.slice(0, 2);
  }
}

// CLI interface
async function main() {
  const generator = new XPostGenerator();

  // Example usage
  if (process.argv.length < 3) {
    console.log('Usage: npm run dev "<theme>" [keywords...]');
    console.log('Example: npm run dev "AIの未来について" テクノロジー 未来');
    process.exit(1);
  }

  const theme = process.argv[2];
  const keywords = process.argv.slice(3);

  try {
    console.log('🚀 X投稿を生成中...');
    const post = await generator.generatePost({
      theme,
      keywords,
      tone: 'casual',
      maxLength: 280,
    });

    console.log('\n📝 生成された投稿:');
    console.log(post.content);
    console.log(`\n🏷️ ハッシュタグ: ${post.hashtags.map(tag => `#${tag}`).join(' ')}`);
    console.log(`📊 文字数: ${post.characterCount}/280`);
    console.log(`🎭 トーン: ${post.tone}`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// Export for use as module
export { XPostGenerator, PostGenerationOptions, GeneratedPost };

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}