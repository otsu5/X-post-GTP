import { XPostGenerator } from '../src/index';

// Mock OpenAI SDK
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

describe('XPostGenerator', () => {
  let generator: XPostGenerator;
  let mockOpenai: any;

  beforeEach(() => {
    // Set mock API key
    process.env.OPENAI_API_KEY = 'test-key';
    
    // Reset mock
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'AIの進化は素晴らしいですね！将来が楽しみです。🚀',
          },
        },
      ],
    });
    
    const { OpenAI } = require('openai');
    mockOpenai = new OpenAI();
    generator = new XPostGenerator();
    (generator as any).openai = mockOpenai;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePost', () => {
    it('should generate a post successfully', async () => {
      const options = {
        theme: 'AIの未来',
        keywords: ['テクノロジー', '未来'],
        tone: 'casual' as const,
        maxLength: 280,
      };

      const result = await generator.generatePost(options);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('hashtags');
      expect(result).toHaveProperty('characterCount');
      expect(result).toHaveProperty('tone');
      expect(result.characterCount).toBeLessThanOrEqual(280);
      expect(result.hashtags).toContain('テクノロジー');
    });

    it('should handle missing API key', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new XPostGenerator()).toThrow('OPENAI_API_KEY environment variable is required');
    });

    it('should truncate content if it exceeds maxLength', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'これは非常に長い投稿のサンプルです。'.repeat(50),
            },
          },
        ],
      });

      const options = {
        theme: '長い投稿',
        maxLength: 50,
      };

      const result = await generator.generatePost(options);

      expect(result.characterCount).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result.content).toContain('...');
    });
  });

  describe('generateMultiplePosts', () => {
    it('should generate multiple posts', async () => {
      const options = {
        theme: 'テストテーマ',
        keywords: ['テスト'],
      };

      const results = await generator.generateMultiplePosts(options, 2);

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('content');
        expect(result.hashtags).toContain('テスト');
      });
    });
  });

  describe('hashtag generation', () => {
    it('should extract hashtags from content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '素晴らしい一日です #素敵 #楽しい',
            },
          },
        ],
      });

      const result = await generator.generatePost({ theme: 'テスト' });

      expect(result.hashtags).toContain('素敵');
      expect(result.hashtags).toContain('楽しい');
    });

    it('should generate relevant hashtags', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'AIの技術革新がすごいですね',
            },
          },
        ],
      });

      const result = await generator.generatePost({ theme: 'AIについて' });

      expect(result.hashtags).toContain('AI');
    });
  });
});
